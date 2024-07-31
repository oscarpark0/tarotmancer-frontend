/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import './CommandTerminal.css';
import ShimmerButton from './ShimmerButton.jsx';
import SpreadSelector from './SpreadSelector.jsx';
import CardReveal from './CardReveal';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../utils/translations';
import { getMistralResponse } from '../services/mistralServices';
import LanguageSelector from './LanguageSelector';
import PropTypes from 'prop-types';

const CommandTerminal = forwardRef(({ 
  onMonitorOutput, 
  drawSpread, 
  mostCommonCards, 
  dealingComplete, 
  onSpreadSelect, 
  selectedSpread, 
  isMobile, 
  cards = [], 
  revealCards, 
  shouldDrawNewSpread, 
  fetchSpread, 
  onNewResponse, 
  onResponseComplete, 
  animationsComplete, 
  canDraw, 
  onDraw, 
  remainingDrawsToday,
  drawCount,
  setDrawCount,
  currentDrawId,
  userId,
  onOpenPastDraws,
  isCardsDealingComplete,
}, ref) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const terminalOutputRef = useRef(null);
  const [showCards, setShowCards] = useState(false);
  const [shouldRequestCohere, setShouldRequestCohere] = useState(false);
  const { selectedLanguage } = useLanguage();
  const { getTranslation } = useTranslation();
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    console.log('Component language updated:', selectedLanguage);
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
    console.log("handleSubmit called with:", mostCommonCards); // Add this log
    if (!currentDrawId) {
      console.warn('currentDrawId is undefined, but continuing with request');
    }

    setIsLoading(true);
    onNewResponse('');

    try {
      const staticText = `You are Tarotmancer - a wise and knowledgeable tarot card interpretation master.
Begin with a greeting that encapsulates the essence of the spread, hinting at the energies and themes present.
For each card in the spread, provide a detailed analysis:
1. Interpretation, considering:
   a) The card's inherent symbolism and meaning
   b) Its orientation
   c) Its position in the spread
   d) Its relationships and interactions with other cards
2. How the card's energy influences the querent's situation
As you interpret each card, weave a cohesive narrative that connects the individual card meanings into a holistic reading.
Draw connections between cards that have symbolic, elemental, or numerical relationships, explaining how these connections add depth to the reading.`;
      const languagePrefix = selectedLanguage !== 'English' ? `Please respond in ${selectedLanguage}. ` : '';
      const userQuestion = input.trim() ? `The seeker has asked the following of the tarot: ${input.trim()}` : '';
      const message = `${languagePrefix}${staticText} ${mostCommonCards.trim()} ${userQuestion}`;

      await getMistralResponse(message, onNewResponse, (fullResponse, error) => {
        if (error) {
          console.error('Error storing Mistral response:', error);
          // Handle error (e.g., show error message to user)
        } else {
          console.log('Mistral response stored successfully');
        }
        onResponseComplete(fullResponse);
      }, currentDrawId, userId);
      
    } catch (error) {
      console.error('Error in Mistral request:', error);
      const errorMessage = getTranslation('errorMessage');
      onNewResponse(errorMessage);
      onResponseComplete(null, error);
    } finally {
      setIsLoading(false);
    }

    setInput('');
  }, [shouldRequestCohere, onNewResponse, selectedLanguage, getTranslation, onResponseComplete, input, currentDrawId, userId]);

  useEffect(() => {
    if (isCardsDealingComplete && mostCommonCards && dealingComplete) {
      console.log("CommandTerminal: Triggering Mistral request");
      const timer = setTimeout(() => {
        handleSubmit(mostCommonCards);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isCardsDealingComplete, mostCommonCards, dealingComplete]);

  useEffect(() => {
    if (isCardsDealingComplete && mostCommonCards && dealingComplete) {
      handleSubmit(mostCommonCards);
    }
  }, [handleSubmit]);

  const handleSpreadSelect = (newSpread) => {
    onSpreadSelect(newSpread);
  };

  useEffect(() => {
    const terminalOutput = terminalOutputRef.current;
    if (terminalOutput) {
      const contentHeight = terminalOutput.scrollHeight;
      terminalOutput.style.maxHeight = `${contentHeight}px`;
    }
  }, []);

  const handleDrawClick = useCallback(() => {
    if (isDrawing || !canDraw) return;
    setIsDrawing(true);
    drawSpread();
    setShouldRequestCohere(true);
    onNewResponse('');
    onDraw();
    setDrawCount(prevCount => Math.min(prevCount + 1, 5));
  }, [isDrawing, canDraw, drawSpread, setShouldRequestCohere, onNewResponse, onDraw, setDrawCount]);

  useEffect(() => {
    if (dealingComplete) {
      setIsDrawing(false);
    }
  }, [dealingComplete]);

  const getButtonText = useCallback(() => {
    if (isLoading) return getTranslation('processing');
    if (isDrawing) return getTranslation('drawing');
    return `${getTranslation('draw')} (${remainingDrawsToday} ${getTranslation('remainingDrawsToday')})`;
  }, [isLoading, isDrawing, getTranslation, remainingDrawsToday]);

  const handlePastDrawsClick = () => {
    onOpenPastDraws();
  };

  useEffect(() => {
    console.log('CommandTerminal.jsx - drawCount:', drawCount);
  }, [drawCount]);

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
            {isLoading ? getTranslation('processing') : `${getTranslation('remainingDrawsToday')}: ${remainingDrawsToday}`}
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
            <button
              className="past-draws-button"
              onClick={handlePastDrawsClick}
            >
              {getTranslation('pastDraws')}
            </button>
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
          disabled={isLoading || isDrawing || !canDraw}
          className={`${isDrawing ? 'drawing' : ''} text-sm`}
        >
          {getButtonText()}
        </ShimmerButton>
      </div>
    </div>
  );
});


CommandTerminal.propTypes = {
  onMonitorOutput: PropTypes.func.isRequired,
  drawSpread: PropTypes.func.isRequired,
  mostCommonCards: PropTypes.string.isRequired,
  dealingComplete: PropTypes.bool.isRequired,
  onSpreadSelect: PropTypes.func.isRequired,
  selectedSpread: PropTypes.string.isRequired,
  isMobile: PropTypes.bool.isRequired,
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  revealCards: PropTypes.func.isRequired,
  shouldDrawNewSpread: PropTypes.bool.isRequired,
  fetchSpread: PropTypes.func.isRequired,
  onNewResponse: PropTypes.func.isRequired,
  onResponseComplete: PropTypes.func.isRequired,
  animationsComplete: PropTypes.bool.isRequired,
  canDraw: PropTypes.bool.isRequired,
  onDraw: PropTypes.func.isRequired,
  remainingDrawsToday: PropTypes.number.isRequired,
  drawCount: PropTypes.number.isRequired,
  setDrawCount: PropTypes.func.isRequired,
  currentDrawId: PropTypes.string,
  userId: PropTypes.string,
  onOpenPastDraws: PropTypes.func.isRequired,
  isCardsDealingComplete: PropTypes.bool.isRequired,
};

export default CommandTerminal;