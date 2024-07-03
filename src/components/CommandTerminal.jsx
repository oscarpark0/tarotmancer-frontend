/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useCallback, forwardRef, useContext } from 'react';
import './CommandTerminal.css';
import ShimmerButton from './ShimmerButton.jsx';
import SpreadSelector from './SpreadSelector.jsx';
import CardReveal from './CardReveal';
import LanguageSelector, { LanguageContext } from './LanguageSelector';
import { buttonTranslations } from '../utils/translations';
import { getMistralResponse } from '../services/mistralServices';

const CommandTerminal = forwardRef(({ onMonitorOutput, drawSpread, mostCommonCards, dealingComplete, onSpreadSelect, selectedSpread, isMobile, cards = [], revealCards, shouldDrawNewSpread, fetchSpread, onNewResponse, onResponseComplete, animationsComplete }, ref) => {
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
      const staticText = "You are Tarotmancer - the soul of an ancient and powerful tarot card reader. A querent has arrived seeking your guidance." +
        "Begin your response uniquely each time an interpretation is requested, offering a warm welcome to the querent. Interpret the proximity of cards/orientations to one another in each spread and the overall spread as a whole." +
        "Respond with empathy and care, you are an advocate of the querent. Provide the querent with a detailed and personalized reading that is tailored to their situation as described by the tarot." +
        "Your guidance should resonate personally with the querent. You responsd using clear language to ensure your responses are easily understood. " +
        "Avoid complex terminology and jargon - respond un-generically. Format in a manner that allows each position, card, and orientation to be clearly labeled. " +
        "Conclude your reading with a empathetic and personalized message to the querent that aids the querent in navigating based on the information provided by the tarot.";
      const languagePrefix = selectedLanguage !== 'English' ? `Please respond in ${selectedLanguage}. ` : '';
      const userQuestion = input.trim() ? `The seeker has asked the following of the tarot: ${input.trim()}` : '';
      const message = `${languagePrefix}${staticText} ${mostCommonCards.trim()} ${userQuestion}`;

      await getMistralResponse(message, onNewResponse);
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