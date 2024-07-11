import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import './CommandTerminal.css';
import ShimmerButton from './ShimmerButton.jsx';
import SpreadSelector from './SpreadSelector.jsx';
import CardReveal from './CardReveal';
import LanguageSelector, { useLanguage } from './LanguageSelector';
import { buttonTranslations } from '../utils/translations';
import { useMistralResponse } from '../hooks/useMistralResponse';

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
  animationsComplete
}, ref) => {
  const [input, setInput] = useState('');
  const [showCards, setShowCards] = useState(false);
  const [shouldRequestCohere, setShouldRequestCohere] = useState(false);
  const { selectedLanguage } = useLanguage();
  const [isDrawing, setIsDrawing] = useState(false);
  const terminalOutputRef = useRef(null);

  const { isLoading, handleSubmit } = useMistralResponse(onNewResponse, onResponseComplete, selectedLanguage);

  const getTranslation = (key) => {
    if (!buttonTranslations[key]) {
      console.warn(`Translation key "${key}" not found`);
      return key;
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

  useEffect(() => {
    if (mostCommonCards && dealingComplete && shouldRequestCohere && animationsComplete) {
      setShowCards(true);
      handleSubmit(mostCommonCards, input);
      setShouldRequestCohere(false);
    }
  }, [mostCommonCards, dealingComplete, shouldRequestCohere, handleSubmit, animationsComplete, input]);

  const handleSpreadSelect = (newSpread) => {
    onSpreadSelect(newSpread);
  };

  const handleDrawClick = useCallback(() => {
    if (isDrawing) return;
    setIsDrawing(true);
    fetchSpread();
    setShouldRequestCohere(true);
    onNewResponse('');
  }, [isDrawing, fetchSpread, onNewResponse]);

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
      <TerminalControls
        selectedSpread={selectedSpread}
        onSpreadSelect={handleSpreadSelect}
        selectedLanguage={selectedLanguage}
        input={input}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
        getTranslation={getTranslation}
        handleDrawClick={handleDrawClick}
        isDrawing={isDrawing}
      />
    </div>
  );
});

const TerminalControls = React.memo(({
  selectedSpread,
  onSpreadSelect,
  selectedLanguage,
  input,
  handleInputChange,
  isLoading,
  getTranslation,
  handleDrawClick,
  isDrawing
}) => (
  <div className="draw-button-container">
    <div className="input-container2">
      <SpreadSelector onSpreadSelect={onSpreadSelect} selectedSpread={selectedSpread} />
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
));

export default CommandTerminal;