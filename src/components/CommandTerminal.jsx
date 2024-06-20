import React, { useState, useRef, useEffect, useCallback } from 'react';
import './CommandTerminal.css';
import { COHERE_API_KEY } from '../utils/config';
import ShimmerButton from './ShimmerButton.jsx';

const CommandTerminal = ({ onMonitorOutput, drawSpread, mostCommonCards, dealingComplete, onSpreadSelect, selectedSpread }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const terminalOutputRef = useRef(null);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleSpreadChange = useCallback((e) => {
    onSpreadSelect(e.target.value);
  }, [onSpreadSelect]);

  const handleSubmit = useCallback(async (mostCommonCards) => {
    setIsLoading(true);

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
      let output = '';
      let buffer = '';

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
              output += data.text;
              onMonitorOutput(output);
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      onMonitorOutput('An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }

    setInput('');
  }, [onMonitorOutput]);

  useEffect(() => {
    if (mostCommonCards && dealingComplete) {
      handleSubmit(mostCommonCards);
    }
  }, [mostCommonCards, dealingComplete, handleSubmit]);

  return (
    <div className="command-terminal">
      <div className="terminal-output" ref={terminalOutputRef} style={{ minHeight: '1em' }}>
        {isLoading ? <span>Loading...</span> : ''}
      </div>
      
      <form onSubmit={(e) => e.preventDefault()} className="terminal-input-form">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="terminal-input"
          placeholder="Set your focus. Press Draw to begin."
          id="terminal-input"
        />
      </form>
      <div className="draw-button-container">
        <ShimmerButton onClick={drawSpread} aria-label="Draw Cards" label="Draw">
          Draw
        </ShimmerButton>
        <div className="spread-selector">
          <select value={selectedSpread} onChange={handleSpreadChange}>
            <option value="celtic">Celtic Cross</option>
            <option value="threeCard">Three Card</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CommandTerminal;