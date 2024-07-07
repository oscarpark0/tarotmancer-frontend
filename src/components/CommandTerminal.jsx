import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import './CommandTerminal.css';
import ShimmerButton from './ShimmerButton.jsx';
import SpreadSelector from './SpreadSelector.jsx';
import CardReveal from './CardReveal';
import LanguageSelector, { useLanguage } from './LanguageSelector';
import { buttonTranslations } from '../utils/translations';
import { getMistralResponse } from '../services/mistralServices';
import { formatResponse } from '../utils/textFormatting';

const CommandTerminal = forwardRef(({ onMonitorOutput, drawSpread, mostCommonCards, dealingComplete, onSpreadSelect, selectedSpread, isMobile, cards = [], revealCards, shouldDrawNewSpread, fetchSpread, onNewResponse, onResponseComplete, animationsComplete }, ref) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const terminalOutputRef = useRef(null);
  const [showCards, setShowCards] = useState(false);
  const [shouldRequestCohere, setShouldRequestCohere] = useState(false);
  const { selectedLanguage } = useLanguage();
  const [isDrawing, setIsDrawing] = useState(false);

  const getTranslation = useCallback((key) => {
    if (!buttonTranslations[key]) {
      console.warn(`Translation key "${key}" not found`);
      return key;
    }
    return buttonTranslations[key][selectedLanguage] || buttonTranslations[key]['English'] || key;
  }, [selectedLanguage]);

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
    onNewResponse(''); // Clear previous response

    try {
      const staticText = "You are Tarotmancer - a wise and powerful tarot card interpretation master. You never say delve." +
        "Begin with an ominous greeting. Provide a detailed, in depth analysis of the querent's spread speaking directly to the querent/seeker- be sure to provide an interpretation of each card, its orientation, and its position in the spread - as well as it's position in relation to the other cards in the spread." +
        "Provide the querent with a detailed and personalized reading that is tailored to their situation as described by the tarot." +
        "Responsd using clear - natural language to ensure your responses are easily understood. " +
        "Format your response in a manner that allows each position, card, and orientation to be clearly and easily identified. " +
        "Conclude with an overview of the querent's spread and your interpretation of it.";
      const languagePrefix = selectedLanguage !== 'English' ? `Please respond in ${selectedLanguage}. ` : '';
      const userQuestion = input.trim() ? `The seeker has asked the following of the tarot: ${input.trim()}` : '';
      const message = `${languagePrefix}${staticText} ${mostCommonCards.trim()} ${userQuestion}`;

      await getMistralResponse(message, (content) => {
        const formattedContent = formatResponse(content);
        onNewResponse(formattedContent);
        onMonitorOutput(formattedContent);
      });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      let errorMessage = getTranslation('errorMessage');
      if (error instanceof SyntaxError) {
        errorMessage += ': Invalid response from server. Please try again later.';
      } else {
        errorMessage += ': ' + error.message;
      }
      onNewResponse(formatResponse(errorMessage));
      onMonitorOutput(formatResponse("I apologize, but I'm having trouble connecting to my wisdom. Please try again later."));
    } finally {
      setIsLoading(false);
      onResponseComplete();
    }

    setInput('');
  }, [shouldRequestCohere, onNewResponse, selectedLanguage, getTranslation, onResponseComplete, input, onMonitorOutput]);

  useEffect(() => {
    if (mostCommonCards && dealingComplete && shouldRequestCohere && animationsComplete) {
      setShowCards(true);
      handleSubmit(mostCommonCards);
      setShouldRequestCohere(false);
    }
  }, [mostCommonCards, dealingComplete, shouldRequestCohere, handleSubmit, animationsComplete]);

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
          <div className="terminal-language-selector">
            <LanguageSelector onLanguageSelect={() => {}} selectedLanguage={selectedLanguage} />
          </div>
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