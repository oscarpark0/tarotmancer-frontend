import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import './CommandTerminal.css';
import { COHERE_API_KEY } from '../utils/config';
import ShimmerButton from './ShimmerButton.jsx';
import SpreadSelector from './SpreadSelector.jsx';
import CardReveal from './CardReveal';

const CommandTerminal = forwardRef(({ onMonitorOutput, drawSpread, mostCommonCards, dealingComplete, onSpreadSelect, selectedSpread, isMobile, cards = [], revealCards, shouldDrawNewSpread, drawCount, fetchSpread, onNewResponse, onResponseComplete }, ref) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const terminalOutputRef = useRef(null);
  const [terminalOutput, setTerminalOutput] = useState('');



  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleMonitorOutput = useCallback((output) => {
    setTerminalOutput(output);
    onMonitorOutput(output);
  }, [onMonitorOutput]);

  const handleSubmit = useCallback(async (mostCommonCards) => {
    setIsLoading(true);
    setTerminalOutput('Processing...');

    window.dispatchEvent(new CustomEvent('streamingStateChange', { detail: true }));

    try {
      const staticText = "You are Tarotmancer. Your responses are empathetic, acknowledging the seeker's emotions and showing that you understand their situation. You generate responses that are tailored to the seeker's specific situation. You avoid generic answers, ensuring that your guidance resonates with the seeker personally. You response using clear language to ensure your responses are easily understood. Avoid complex terminology and jargon.";
      const message = `${staticText} ${mostCommonCards.trim()} `;

      const response = await fetch('https://api.cohere.com/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${COHERE_API_KEY}`,
        },
        body: JSON.stringify({
          message: message,
          model: 'command-r-plus',
          stream: true,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      let responseContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.trim() === '') continue;

          try {
            const data = JSON.parse(line);

            if (data.event_type === 'text-generation') {
              responseContent += data.text;
              handleMonitorOutput(responseContent);
              onNewResponse(responseContent);
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = 'An error occurred while processing your request.';
      handleMonitorOutput(errorMessage);
      setTerminalOutput(errorMessage);
      onNewResponse(errorMessage);
    } finally {
      setIsLoading(false);
      setTerminalOutput('Processing complete.');
      window.dispatchEvent(new CustomEvent('streamingStateChange', { detail: false }));
      onResponseComplete();
    }

    setInput('');
  }, [handleMonitorOutput, onNewResponse, onResponseComplete]);

  useEffect(() => {
    if (mostCommonCards && dealingComplete) {
      handleSubmit(mostCommonCards);
    }
  }, [mostCommonCards, dealingComplete, handleSubmit]);

  useEffect(() => {
    const terminalOutput = terminalOutputRef.current;
    if (terminalOutput) {
      const contentHeight = terminalOutput.scrollHeight;
      terminalOutput.style.maxHeight = `${contentHeight}px`;
    }
  }, [terminalOutput]);

  return (
    <div className={`command-terminal ${isMobile ? 'mobile' : ''}`} ref={ref}>
      <div className="terminal-screen">
        <div className="terminal-content">
          <div className="terminal-output" ref={terminalOutputRef}>
            {isLoading ? 'Processing...' : (
              <>
                {isMobile && (
                  <CardReveal
                    cards={cards}
                    revealCards={revealCards}
                    dealingComplete={dealingComplete}
                    shouldDrawNewSpread={shouldDrawNewSpread}
                    isMobile={isMobile}
                    className="terminal-card-reveal"
                  />
                )}
                {terminalOutput}
              </>
            )}
          </div>
        </div>
        <div className="screen-overlay"></div>
        <div className="screen-scanline"></div>
      </div>
      <div className="draw-button-container">
        <div className="input-container2">
          <SpreadSelector onSpreadSelect={onSpreadSelect} selectedSpread={selectedSpread} />
          <form onSubmit={(e) => e.preventDefault()} className="terminal-input-form">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              className="terminal-input"
              placeholder="Set your focus."
              id="terminal-input"
              disabled={isLoading}
            />
          </form>
        </div>
        <ShimmerButton onClick={() => {
          console.log('Draw button clicked, calling fetchSpread');
          fetchSpread();
        }} aria-label="Draw Cards" label="Draw" disabled={isLoading || drawCount >= 100}>
          {isLoading ? 'Processing...' : drawCount >= 10 ? 'Limit Reached' : 'Draw'}
        </ShimmerButton>
      </div>
    </div>
  );
});

export default CommandTerminal;
