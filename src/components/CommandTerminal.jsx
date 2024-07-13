import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import './CommandTerminal.css';
import ShimmerButton from './ShimmerButton.jsx';
import SpreadSelector from './SpreadSelector.jsx';
import CardReveal from './CardReveal';
import { useLanguage } from './LanguageSelector';
import { buttonTranslations } from '../utils/translations';

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
  fullResponse,
  handleSubmit,
  handleDrawClick, // Add this prop
  isDrawing,       // Add this prop
}, ref) => {
  const [input, setInput] = useState('');
  const [showCards, setShowCards] = useState(false);
  const [shouldRequestCohere, setShouldRequestCohere] = useState(false);
  const { selectedLanguage } = useLanguage();

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
          <div className="screen-overlay"></div>
          <div className="screen-scanline"></div>
        </div>
      </div>
      <TerminalControls
        selectedSpread={selectedSpread}
        onSpreadSelect={handleSpreadSelect}
        selectedLanguage={selectedLanguage}
        input={input}
        handleInputChange={handleInputChange}
        getTranslation={getTranslation}
        handleDrawClick={handleDrawClick} // Pass this prop
        isDrawing={isDrawing}             // Pass this prop
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
  getTranslation,
  handleDrawClick,
  isDrawing
}) => (
  <div className="draw-button-container">
    <div className="input-container2">
      <SpreadSelector onSpreadSelect={onSpreadSelect} selectedSpread={selectedSpread} />
      <div className="terminal-language-selector tooltip">
        <button disabled className="language-selector-disabled">
          {getTranslation('language')}
        </button>
        <span className="tooltiptext">{getTranslation('languageComingSoon')}</span>
      </div>
      <form onSubmit={(e) => e.preventDefault()} className="terminal-input-form">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="terminal-input"
          id="terminal-input"
          placeholder={getTranslation('inputPlaceholder')}
        />
      </form>
    </div>
    <ShimmerButton 
      onClick={handleDrawClick}
      aria-label={getTranslation('drawCardsAriaLabel')}
      label={getTranslation('draw')}
      disabled={isDrawing}
      className={isDrawing ? 'drawing' : ''}
    >
      {isDrawing ? getTranslation('drawing') : getTranslation('draw')}
    </ShimmerButton>
  </div>
));

export default CommandTerminal;