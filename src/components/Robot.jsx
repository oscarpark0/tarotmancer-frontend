import React, { useEffect, useLayoutEffect, memo, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import FloatingCards from './FloatingCards.jsx';
import CommandTerminal from './CommandTerminal.jsx';
import './Robot.css';
import { debounce } from 'lodash';
import { useLanguage } from './LanguageSelector';
import { useSpreadContext } from '../contexts/SpreadContext';

const adjustFontSize = () => {
  const monitorOutputElement = document.querySelector('.monitor-output');
  const screenContentElement = document.querySelector('.screen-content');

  if (monitorOutputElement && screenContentElement) {
    const screenHeight = screenContentElement.offsetHeight;
    const outputHeight = monitorOutputElement.scrollHeight;

    if (outputHeight > screenHeight) {
      let fontSize = 240;
      let step = 5;
      
      while (outputHeight > screenHeight && fontSize > 20) {
        fontSize -= step;
        monitorOutputElement.style.fontSize = `${fontSize}px`;
        if (monitorOutputElement.scrollHeight < screenHeight) {
          fontSize += step;
          step = Math.max(1, step / 2);
        }
      }
      
      monitorOutputElement.style.fontSize = `${fontSize}px`;
    }
  }
};

const debouncedAdjustFontSize = debounce(adjustFontSize, 100);

const Robot = memo(({
  isMobile,
  isDarkMode,
  cardPositions,
  finalCardPositions,
  onExitComplete,
  formRef,
  onSubmitInput,
  fetchSpread,
  onNewResponse,
  onResponseComplete,
  onAnimationStart,
  onStreamingStateChange,
  onMonitorOutput,
  input,
  isDrawing,
}) => {
  const {
    dealCards,
    handleExitComplete,
    revealCards,
    shouldDrawNewSpread,
    drawSpread,
    dealingComplete,
    mostCommonCards,
    cards,
    selectedSpread,
    animationsComplete,
    handleAnimationStart,
    isStreaming,
    handleSubmit,
    isLoadingMistral,
    handleDrawClick,
    monitorOutput,
  } = useSpreadContext();

  const commandTerminalRef = useRef(null);
  useLanguage();

  useEffect(() => {
    if (dealCards) {
      setTimeout(handleExitComplete, 2000);
    }
  }, [dealCards, handleExitComplete]);

  useEffect(() => {
    const handleResize = () => {
      if (commandTerminalRef.current) {
        debouncedAdjustFontSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useLayoutEffect(() => {
    adjustFontSize();
  }, [monitorOutput]);

  useEffect(() => {
    if (dealingComplete && mostCommonCards) {
      handleSubmit(mostCommonCards);
    }
  }, [dealingComplete, mostCommonCards, handleSubmit]);

  return (
    <motion.div
      className={`tarot-monitor ${isMobile ? 'mobile' : ''} ${isStreaming ? 'streaming' : ''}`}
      style={{
        position: 'absolute',
        zIndex: isMobile ? 1000 : 100,
        top: 0,
        left: isMobile ? 0 : '20px',
        width: isMobile ? '100%' : '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        height: 'auto',
      }}
    >
      <CRTMonitor
        monitorOutput={monitorOutput}
        isStreaming={isStreaming}
        dealCards={dealCards}
        finalCardPositions={finalCardPositions}
        revealCards={revealCards}
        onExitComplete={onExitComplete}
        shouldDrawNewSpread={shouldDrawNewSpread}
        dealingComplete={dealingComplete}
        cards={cards}
        isMobile={isMobile}
        onAnimationStart={handleAnimationStart}
      />

      <CommandTerminal
        drawSpread={drawSpread}
        mostCommonCards={mostCommonCards}
        dealingComplete={dealingComplete}
        selectedSpread={selectedSpread}
        isMobile={isMobile}
        cards={cards}
        revealCards={revealCards}
        shouldDrawNewSpread={shouldDrawNewSpread}
        ref={commandTerminalRef}
        style={{
          position: 'absolute',
          width: '100%',
          top: '100%',
          left: 0,
        }}
        animationsComplete={animationsComplete}
        onAnimationStart={handleAnimationStart}
        isStreaming={isStreaming}
        handleSubmit={handleSubmit}
        isLoading={isLoadingMistral}
        handleDrawClick={handleDrawClick}
        isDrawing={isDrawing}
      />
    </motion.div>
  );
});

const CRTMonitor = memo(({
  monitorOutput,
  isStreaming,
  dealCards,
  finalCardPositions,
  revealCards,
  onExitComplete,
  shouldDrawNewSpread,
  dealingComplete,
  cards,
  isMobile,
  onAnimationStart,
}) => {
  useEffect(() => {
    console.log("CRTMonitor monitorOutput:", monitorOutput);
  }, [monitorOutput]);

  return (
    <div className="crt-monitor">
      <div className="monitor-frame">
        <div className="screen">
          <div className="screen-content">
            <FloatingCards
              dealCards={dealCards}
              finalCardPositions={finalCardPositions}
              revealCards={revealCards}
              onExitComplete={onExitComplete}
              shouldDrawNewSpread={shouldDrawNewSpread}
              dealingComplete={dealingComplete}
              numCards={cards.length}
              isMobile={isMobile}
              onAnimationStart={onAnimationStart}
            />
            <div className={`monitor-output ${isStreaming ? 'streaming' : ''}`}>
              <pre>{monitorOutput}</pre>
            </div>
            <div className="screen-overlay"></div>
            <div className="screen-scanlines"></div>
          </div>
        </div>
      </div>
      <div className="monitor-label">tarotmancer</div>
    </div>
  );
});

Robot.propTypes = {
  dealCards: PropTypes.bool.isRequired,
  cardPositions: PropTypes.array.isRequired,
  finalCardPositions: PropTypes.array.isRequired,
  onExitComplete: PropTypes.func.isRequired,
  revealCards: PropTypes.bool.isRequired,
  shouldDrawNewSpread: PropTypes.bool.isRequired,
  drawSpread: PropTypes.func.isRequired,
  dealingComplete: PropTypes.func.isRequired,
  mostCommonCards: PropTypes.string.isRequired,
  formRef: PropTypes.object.isRequired,
  onSubmitInput: PropTypes.func.isRequired,
  selectedSpread: PropTypes.string.isRequired,
  onSpreadSelect: PropTypes.func.isRequired,
  cards: PropTypes.array,
  isMobile: PropTypes.bool.isRequired,
  fetchSpread: PropTypes.func.isRequired,
  onNewResponse: PropTypes.func.isRequired,
  onResponseComplete: PropTypes.func.isRequired,
  animationsComplete: PropTypes.bool.isRequired,
  onAnimationStart: PropTypes.func.isRequired,
  onStreamingStateChange: PropTypes.func.isRequired,
  onMonitorOutput: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  input: PropTypes.string.isRequired,
  isRequesting: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  handleDrawClick: PropTypes.func.isRequired,
  isDrawing: PropTypes.bool.isRequired,
  monitorOutput: PropTypes.string.isRequired,
};

export default Robot;