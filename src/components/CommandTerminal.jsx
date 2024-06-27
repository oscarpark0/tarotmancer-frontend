import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import './CommandTerminal.css';
import { COHERE_API_KEY } from '../utils/config';
import ShimmerButton from './ShimmerButton.jsx';
import SpreadSelector from './SpreadSelector.jsx';
import { v4 as uuidv4 } from 'uuid';

const CommandTerminal = memo(({ onMonitorOutput, drawSpread, mostCommonCards, dealingComplete, onSpreadSelect, selectedSpread, isMobile, cards = [], revealCards, shouldDrawNewSpread, drawCount, fetchSpread, onNewResponse, onResponseComplete }, ref) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const terminalOutputRef = useRef(null);
  const [terminalOutput, setTerminalOutput] = useState('');

  const [responses, setResponses] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleMonitorOutput = useCallback((output) => {
    setTerminalOutput(output);
    onMonitorOutput(output);
  }, [onMonitorOutput]);

  const handleNewResponse = useCallback((content) => {
    setResponses(prevResponses => {
      if (prevResponses.length === 0 || prevResponses[prevResponses.length - 1].complete) {
        // Create a new response
        const newResponse = { id: uuidv4(), content, complete: false };
        setActiveTab(newResponse.id);
        return [...prevResponses, newResponse];
      } else {
        // Update the last response
        const updatedResponses = [...prevResponses];
        const lastResponse = updatedResponses[updatedResponses.length - 1];
        lastResponse.content = content;
        return updatedResponses;
      }
    });
  }, []);

  const completeCurrentResponse = useCallback(() => {
    setResponses(prevResponses => {
      if (prevResponses.length > 0) {
        const updatedResponses = [...prevResponses];
        updatedResponses[updatedResponses.length - 1].complete = true;
        return updatedResponses;
      }
      return prevResponses;
    });
  }, []);

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
              handleNewResponse(responseContent); // Use handleNewResponse here
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
      handleNewResponse(errorMessage); // Use handleNewResponse here
    } finally {
      setIsLoading(false);
      setTerminalOutput('Processing complete.');
      window.dispatchEvent(new CustomEvent('streamingStateChange', { detail: false }));
      completeCurrentResponse(); // Use completeCurrentResponse here
    }

    setInput('');
  }, [handleMonitorOutput, handleNewResponse, completeCurrentResponse]);

  useEffect(() => {
    if (mostCommonCards && dealingComplete) {
      handleSubmit(mostCommonCards);
    }
  }, [mostCommonCards, dealingComplete, handleSubmit]);

  useEffect(() => {
    // Adjust the max-height of the terminal output based on the content height
    const terminalOutput = terminalOutputRef.current;
    if (terminalOutput) {
      const contentHeight = terminalOutput.scrollHeight;
      terminalOutput.style.maxHeight = `${contentHeight}px`;
    }
  }, [terminalOutput]);

  console.log('CommandTerminal rendering:', { selectedSpread, onSpreadSelect }); 

  return (
    <div className={`command-terminal ${isMobile ? 'mobile' : ''}`} ref={ref}>
      <div className="terminal-screen">
        <div className="terminal-content">
          <div className="terminal-output" ref={terminalOutputRef}>
            {isLoading ? 'Processing...' : terminalOutput}
          </div>
          <div className="tab-container">
            {responses.map(response => (
              <button
                key={response.id}
                className={`tab ${activeTab === response.id ? 'active' : ''}`}
                onClick={() => setActiveTab(response.id)}
              >
                Response {responses.indexOf(response) + 1}
              </button>
            ))}
          </div>
          {responses.map(response => (
            <div
              key={response.id}
              className={`tab-content ${activeTab === response.id ? 'active' : ''}`}
            >
              <div className="response-output">{response.content}</div>
            </div>
          ))}
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
          {isLoading ? 'Processing...' : drawCount >= 100 ? 'Limit Reached' : 'Draw'}
        </ShimmerButton>
      </div>
    </div>
  );
});

export default CommandTerminal;
