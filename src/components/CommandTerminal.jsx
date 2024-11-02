/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useCallback, forwardRef, useMemo } from 'react';
import './CommandTerminal.css';
import ShimmerButton from './ShimmerButton.jsx';
import SpreadSelector from './SpreadSelector.jsx';
import CardReveal from './CardReveal';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../utils/translations';
import { getMistralResponse } from '../services/mistralServices';
import LanguageSelector from './LanguageSelector';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

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
  userId,
  onOpenPastDraws,
  setRemainingDrawsToday,
  currentDrawId,
  setCurrentDrawId,
}, ref) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const terminalOutputRef = useRef(null);
  const [showCards, setShowCards] = useState(false);
  const [shouldRequestCohere, setShouldRequestCohere] = useState(false);
  const { selectedLanguageName } = useLanguage();
  const { getTranslation } = useTranslation();
  const [isDrawing, setIsDrawing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prevState) => !prevState);
  }, [isExpanded]);

  useEffect(() => {
    if (cards.length > 0 && dealingComplete) {
      setShowCards(true);
    }
  }, [cards, dealingComplete]);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (mostCommonCards) => {
    if (!shouldRequestCohere) {
      return;
    }

    if (!userId) {
      console.warn('User ID not available, but continuing with request');
    }

    if (!currentDrawId) {
      console.error('Current Draw ID is not available');
      onNewResponse('Error: Unable to process request. Please try drawing again.');
      return;
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

      const languagePrefix = selectedLanguageName !== 'English' ? `Please respond in ${selectedLanguageName}. ` : '';
      const userQuestion = input.trim() ? `The seeker has asked the following of the tarot: ${input.trim()}` : '';
      const message = `${languagePrefix}${staticText} ${mostCommonCards.trim()} ${userQuestion}`;

      await getMistralResponse(message, onNewResponse, (fullResponse, error) => {
        if (error) {
          console.error('Error storing Mistral response:', error);
          onNewResponse('Error: Failed to store response. Please try again.');
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
  }, [shouldRequestCohere, onNewResponse, selectedLanguageName, getTranslation, onResponseComplete, input, userId, currentDrawId]);

  useEffect(() => {
    if (mostCommonCards && dealingComplete && shouldRequestCohere && animationsComplete) {
      handleSubmit(mostCommonCards);
      setShouldRequestCohere(false);
    }
  }, [mostCommonCards, dealingComplete, shouldRequestCohere, animationsComplete, handleSubmit]);

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

  const debouncedDrawSpread = useMemo(
    () => debounce(() => {
      console.log('Debounced drawSpread called');
      drawSpread();
      setShouldRequestCohere(true);
      onNewResponse('');
      onDraw();
    }, 300),
    [drawSpread, setShouldRequestCohere, onNewResponse, onDraw]
  );

  const handleDrawClick = useCallback(() => {
    console.log('handleDrawClick called');
    if (isDrawing || !canDraw || remainingDrawsToday <= 0) {
      if (remainingDrawsToday <= 0) {
        setErrorMessage(getTranslation('noDrawsLeft'));
      }
      return;
    }
    setErrorMessage('');
    setIsDrawing(true);
    debouncedDrawSpread();
  }, [isDrawing, canDraw, remainingDrawsToday, debouncedDrawSpread, getTranslation, setErrorMessage, setIsDrawing]);

  useEffect(() => {
    if (dealingComplete) {
      setIsDrawing(false);
    }
  }, [dealingComplete]);

  const getButtonText = useCallback(() => {
    if (isLoading) return getTranslation('processing');
    if (isDrawing) return getTranslation('drawing');
    if (remainingDrawsToday <= 0) return getTranslation('noDrawsLeft');
    return `${getTranslation('draw')} (${remainingDrawsToday} ${getTranslation('remainingDrawsToday')})`;
  }, [isLoading, isDrawing, getTranslation, remainingDrawsToday]);

  const handlePastDrawsClick = () => {
    onOpenPastDraws();
  };

  useEffect(() => {
  }, [drawCount]);

  useEffect(() => {
    if (typeof setRemainingDrawsToday === 'function') {
      setRemainingDrawsToday(remainingDrawsToday);
    }
  }, [remainingDrawsToday, setRemainingDrawsToday]);

  return (
    <div className={`command-terminal ${isMobile ? 'mobile' : ''}`} ref={ref}>
      <div className={`terminal-screen ${isExpanded ? 'expanded' : ''}`}>
        <div className="ct-expand-button-container">
          <button 
            className="ct-expand-button" 
            onClick={toggleExpand}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
        <div className="terminal-content">
          {isMobile && showCards && (
            <div className="terminal-card-reveal-container">
              <CardReveal
                cards={cards}
                revealCards={revealCards}
                dealingComplete={dealingComplete}
                shouldDrawNewSpread={shouldDrawNewSpread}
                isMobile={isMobile}
                className={`terminal-card-reveal ${isMobile ? 'mobile' : ''}`}
              />
            </div>
          )}
          <div className="terminal-output" ref={terminalOutputRef}>
            {errorMessage ? (
              <div className="error-message">{errorMessage}</div>
            ) : isLoading ? (
              getTranslation('processing')
            ) : (
              `${getTranslation('remainingDrawsToday')}: ${remainingDrawsToday}`
            )}
          </div>
        </div>
        <div className="screen-overlay"></div>
        <div className="screen-scanline"></div>
      </div>
      <div className="draw-button-container">
        <div className="input-container2">
          <SpreadSelector onSpreadSelect={handleSpreadSelect} selectedSpread={selectedSpread} />
          <div className="terminal-language-selector">
            <LanguageSelector onLanguageSelect={() => {}} selectedLanguage={selectedLanguageName} />
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
        <div className="draw-button-wrapper">
          <ShimmerButton 
            onClick={handleDrawClick}
            aria-label={getTranslation('drawCardsAriaLabel')}
            label={getTranslation('draw')}
            disabled={isLoading || isDrawing || !canDraw || remainingDrawsToday <= 0}
            className={`${isDrawing ? 'drawing' : ''} text-sm draw-button`}
          >
            {getButtonText()}
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
});


CommandTerminal.propTypes = {
  onMonitorOutput: PropTypes.func.isRequired,
  drawSpread: PropTypes.func.isRequired,
  mostCommonCards: PropTypes.string.isRequired,
  dealingComplete: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]).isRequired,
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
  userId: PropTypes.string.isRequired,
  onOpenPastDraws: PropTypes.func.isRequired,
  setRemainingDrawsToday: PropTypes.func.isRequired,
  currentDrawId: PropTypes.number,
  setCurrentDrawId: PropTypes.func.isRequired,
};

export default CommandTerminal;