/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useCallback, forwardRef, useContext } from 'react';
import './CommandTerminal.css';
import { COHERE_API_KEY } from '../utils/config';
import ShimmerButton from './ShimmerButton.jsx';
import SpreadSelector from './SpreadSelector.jsx';
import CardReveal from './CardReveal';
import LanguageSelector, { LanguageContext } from './LanguageSelector';
import { buttonTranslations } from '../utils/translations';

const CommandTerminal = forwardRef(({ onMonitorOutput, drawSpread, mostCommonCards, dealingComplete, onSpreadSelect, selectedSpread, isMobile, cards = [], revealCards, shouldDrawNewSpread, fetchSpread, onNewResponse, onResponseComplete }, ref) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const terminalOutputRef = useRef(null);
  const [showCards, setShowCards] = useState(false);
  const [shouldRequestCohere, setShouldRequestCohere] = useState(false);
  const { selectedLanguage } = useContext(LanguageContext);
  const [isDrawing, setIsDrawing] = useState(false);

  const getTranslation = (key) => {
    if (!buttonTranslations[key]) {
      console.warn(`Translation key "${key}" not found`);
      return key; // Return the key itself as a fallback
    }
    return buttonTranslations[key][selectedLanguage] || buttonTranslations[key]['English'] || key;
  };

  useEffect(() => {
    if (cards.length > 0 && dealingComplete) {
      setShowCards(true);
    }
  }, [cards, dealingComplete]);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (mostCommonCards) => {
    if (!shouldRequestCohere) return;

    setIsLoading(true);
    onNewResponse(''); 

    try {
      const staticText = "You are Tarotmancer. Your responses are empathetic, acknowledging the seeker's emotions and showing that you understand their situation. You generate responses that are tailored to the seeker's specific situation. You avoid generic answers, ensuring that your guidance resonates with the seeker personally. You response using clear language to ensure your responses are easily understood. Avoid complex terminology and jargon. Your responses are formatted in an easy to view format. Your responses are formatted in an easy to view format.";
      const languagePrefix = selectedLanguage !== 'English' ? `Please respond in ${selectedLanguage}. ` : '';
      const userQuestion = input.trim() ? `The seeker has asked the following of the tarot: ${input.trim()}` : '';
      const message = `${languagePrefix}${staticText} ${mostCommonCards.trim()} ${userQuestion}`;

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
              onNewResponse(data.text); 
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = getTranslation('errorMessage');
      onNewResponse(errorMessage);
    } finally {
      setIsLoading(false);
      onResponseComplete();
    }

    setInput('');
  }, [shouldRequestCohere, onNewResponse, selectedLanguage, getTranslation, onResponseComplete, input]);

  useEffect(() => {
    if (mostCommonCards && dealingComplete && shouldRequestCohere) {
      setShowCards(true);
      handleSubmit(mostCommonCards);
      setShouldRequestCohere(false); // Reset the flag after initiating the request
    }
  }, [mostCommonCards, dealingComplete, shouldRequestCohere, handleSubmit]);

  const handleSpreadSelect = (newSpread) => {
    onSpreadSelect(newSpread);
    // Don't trigger Cohere request here
  };

  useEffect(() => {
    const terminalOutput = terminalOutputRef.current;
    if (terminalOutput) {
      const contentHeight = terminalOutput.scrollHeight;
      terminalOutput.style.maxHeight = `${contentHeight}px`;
    }
  }, []);

  const handleDrawClick = useCallback(() => {
    if (isDrawing) return;
    setIsDrawing(true);
    fetchSpread();
    setShouldRequestCohere(true);
    onNewResponse('');
  }, [isDrawing, fetchSpread, setShouldRequestCohere, onNewResponse]);

  useEffect(() => {
    if (dealingComplete) {
      setIsDrawing(false);
    }
  }, [dealingComplete]);

  return (
    <div className={`command-terminal ${isMobile ? 'mobile' : ''}`} ref={ref}>
      <div className="terminal-screen">
        <div className="terminal-content">
          {isMobile && showCards && (
            <CardReveal
              cards={cards}
              revealCards={revealCards}
              dealingComplete={dealingComplete}
              shouldDrawNewSpread={shouldDrawNewSpread}
              isMobile={isMobile}
              className="terminal-card-reveal"
            />
          )}
          <div className="terminal-output" ref={terminalOutputRef}>
            {isLoading ? getTranslation('processing') : ''}
          </div>
        </div>
        <div className="screen-overlay"></div>
        <div className="screen-scanline"></div>
      </div>
      <div className="draw-button-container">
        <div className="input-container2">
          <SpreadSelector onSpreadSelect={handleSpreadSelect} selectedSpread={selectedSpread} />
          <LanguageSelector onLanguageSelect={() => {}} selectedLanguage={selectedLanguage} />
          <form onSubmit={(e) => e.preventDefault()} className="terminal-input-form">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              className="terminal-input"
              id="terminal-input"
              disabled={isLoading}
              placeholder={getTranslation('inputPlaceholder')}
            />
          </form>
        </div>
        <ShimmerButton 
          onClick={handleDrawClick}
          aria-label={getTranslation('drawCardsAriaLabel')}
          label={getTranslation('draw')}
          disabled={isLoading || isDrawing}
          className={isDrawing ? 'drawing' : ''}
        >
          {isLoading ? getTranslation('processing') : 
           isDrawing ? getTranslation('drawing') : 
           getTranslation('draw')}
        </ShimmerButton>
      </div>
    </div>
  );
});

export default CommandTerminal;
