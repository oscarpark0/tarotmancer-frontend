import React, { useState, useCallback, forwardRef } from 'react';
import './CommandTerminal.css';
import ShimmerButton from './ShimmerButton.jsx';
import SpreadSelector from './SpreadSelector.jsx';
import CardReveal from './CardReveal';
import { useLanguage } from './LanguageSelector';
import { buttonTranslations } from '../utils/translations';
import { useSpreadContext } from '../contexts/SpreadContext';

const CommandTerminal = forwardRef(({ isMobile }, ref) => {
  const [input, setInput] = useState('');
  const { selectedLanguage } = useLanguage();
  const {
    mostCommonCards,
    dealingComplete,
    cards,
    revealCards,
    shouldDrawNewSpread,
    handleSubmit,
    handleDrawClick,
    isRequesting
  } = useSpreadContext();

  const getTranslation = useCallback((key) => {
    if (!buttonTranslations[key]) {
      console.warn(`Translation key "${key}" not found`);
      return key;
    }
    return buttonTranslations[key][selectedLanguage] || buttonTranslations[key]['English'] || key;
  }, [selectedLanguage]);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleSubmitWrapper = useCallback((e) => {
    e.preventDefault();
    handleSubmit(mostCommonCards, input);
    setInput('');
  }, [handleSubmit, mostCommonCards, input]);

  return (
    <div className={`command-terminal ${isMobile ? 'mobile' : ''}`} ref={ref}>
      <div className="terminal-screen">
        <div className="terminal-content">
          {isMobile && dealingComplete && (
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
        selectedLanguage={selectedLanguage}
        input={input}
        handleInputChange={handleInputChange}
        getTranslation={getTranslation}
        handleDrawClick={handleDrawClick}
        isDrawing={isRequesting}
        handleSubmit={handleSubmitWrapper}
      />
    </div>
  );
});

const TerminalControls = React.memo(({
  selectedLanguage,
  input,
  handleInputChange,
  getTranslation,
  handleDrawClick,
  isDrawing,
  handleSubmit
}) => (
  <div className="draw-button-container">
    <div className="input-container2">
      <SpreadSelector />
      <div className="terminal-language-selector tooltip">
        <button disabled className="language-selector-disabled">
          {getTranslation('language')}
        </button>
        <span className="tooltiptext">{getTranslation('languageComingSoon')}</span>
      </div>
      <form onSubmit={handleSubmit} className="terminal-input-form">
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