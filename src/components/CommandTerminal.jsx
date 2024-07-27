/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import './CommandTerminal.css';
import ShimmerButton from './ShimmerButton.jsx';
import SpreadSelector from './SpreadSelector.jsx';
import CardReveal from './CardReveal';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../utils/translations';
import { getMistralResponse } from '../services/mistralServices';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import LanguageSelector from './LanguageSelector';

const CommandTerminal = forwardRef(({ onMonitorOutput, drawSpread, mostCommonCards, dealingComplete, onSpreadSelect, selectedSpread, isMobile, cards = [], revealCards, shouldDrawNewSpread, fetchSpread, onNewResponse, onResponseComplete, animationsComplete, canDraw, timeUntilNextDraw, currentDrawId, onOpenPastDraws, onDraw }, ref) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const terminalOutputRef = useRef(null);
  const [showCards, setShowCards] = useState(false);
  const [shouldRequestCohere, setShouldRequestCohere] = useState(false);
  const { selectedLanguage } = useLanguage();
  const { getTranslation } = useTranslation();
  const [isDrawing, setIsDrawing] = useState(false);
  const [countdown, setCountdown] = useState(timeUntilNextDraw);
  const kindeAuth = useKindeAuth();

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

    if (!currentDrawId) {
      console.warn('currentDrawId is undefined, but continuing with request');
    }

    setIsLoading(true);
    onNewResponse('');

    try {
      const staticText = `You are Tarotmancer - a wise and knowledgeable tarot card interpretation master.
Begin with a greeting that encapsulates the essence of the spread, hinting at the energies and themes present.
For each card in the spread, provide a detailed analysis:
1. Card name and associated suit/major arcana
2. Orientation (upright or reversed)
3. Position in the spread and its significance
4. Interpretation, considering:
   a) The card's inherent symbolism and meaning
   b) Its orientation
   c) Its position in the spread
   d) Its relationships and interactions with other cards
5. How the card's energy influences the querent's situation
As you interpret each card, weave a cohesive narrative that connects the individual card meanings into a holistic reading.
Draw connections between cards that have symbolic, elemental, or numerical relationships, explaining how these connections add depth to the reading.
Conclude with a comprehensive overview of the querent's spread, providing actionable insights and guidance - suggesting potential areas for growth, reflection, or caution.'
Include relevant mythological or archetypal references that enrich the reading.`;
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
      }, currentDrawId, kindeAuth.user?.id);
      
    } catch (error) {
      console.error('Error in Mistral request:', error);
      const errorMessage = getTranslation('errorMessage');
      onNewResponse(errorMessage);
      onResponseComplete(null, error);
    } finally {
      setIsLoading(false);
    }

    setInput('');
  }, [shouldRequestCohere, onNewResponse, selectedLanguage, getTranslation, onResponseComplete, input, currentDrawId, kindeAuth.user]);

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

  const handleDrawClick = useCallback(() => {
    if (isDrawing || !canDraw) return;
    setIsDrawing(true);
    drawSpread();
    setShouldRequestCohere(true);
    onNewResponse('');
  }, [isDrawing, canDraw, drawSpread, setShouldRequestCohere, onNewResponse]);

  useEffect(() => {
    if (dealingComplete) {
      setIsDrawing(false);
    }
  }, [dealingComplete]);

  const formatCountdown = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval;
    if (!canDraw && timeUntilNextDraw) {
      setCountdown(timeUntilNextDraw);
      interval = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [canDraw, timeUntilNextDraw]);

  const getButtonText = useCallback(() => {
    if (isLoading) return getTranslation('processing');
    if (isDrawing) return getTranslation('drawing');
    if (!canDraw && countdown > 0) {
      const timeString = formatCountdown(countdown);
      return getTranslation('timeRemainingUntilNextDraw').replace('{time}', timeString);
    }
    return getTranslation('draw');
  }, [isLoading, isDrawing, canDraw, countdown, getTranslation]);

  useEffect(() => {
  }, [currentDrawId]);

  const handlePastDrawsClick = () => {
    onOpenPastDraws();
  };

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
            {isLoading ? getTranslation('processing') : 
             !canDraw && timeUntilNextDraw ? `${getTranslation('nextDrawAvailable')} ${timeUntilNextDraw}` : ''}
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
        {!canDraw && countdown > 0 && (
          <div className="countdown-timer">
            Next draw available in: {formatCountdown(countdown)}
          </div>
        )}
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

export default CommandTerminal;