import React, { useEffect, useCallback, useRef, useLayoutEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import FloatingCards from './FloatingCards.jsx';
import CommandTerminal from './CommandTerminal.jsx';
import './Robot.css';
import { debounce } from 'lodash';
import { useLanguage } from './LanguageSelector';
import { useMonitorOutput } from '../hooks/useRobotMonitor';
import { useRobotDimensions } from '../hooks/useRobotLayout';
import { useStreamingState } from '../hooks/useRobotStreamingState';

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
  dealCards,
  cardPositions,
  finalCardPositions,
  onExitComplete,
  revealCards,
  shouldDrawNewSpread,
  MonitorOutput,
  drawSpread,
  dealingComplete,
  mostCommonCards,
  formRef,
  onSubmitInput,
  selectedSpread,
  onSpreadSelect,
  cards = [],
  isMobile,
  fetchSpread,
  onNewResponse,
  onResponseComplete,
  animationsComplete,
  onAnimationStart,
  onStreamingStateChange,
}) => {
  const { monitorOutput, handleMonitorOutput } = useMonitorOutput(MonitorOutput);
  console.log("Robot received monitorOutput:", monitorOutput);
  const { monitorPosition, robotRef, screenContentRef } = useRobotDimensions();
  const { isStreaming, handleResponseComplete } = useStreamingState(onNewResponse, onResponseComplete, onStreamingStateChange);
  
  const commandTerminalRef = useRef(null);
  useLanguage();

  useEffect(() => {
    if (dealCards) {
      setTimeout(onExitComplete, 2000);
    }
  }, [dealCards, onExitComplete]);

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
      onSubmitInput(mostCommonCards);
    }
  }, [dealingComplete, mostCommonCards, onSubmitInput]);

  const handleAnimationStart = useCallback(() => {
    onAnimationStart();
  }, [onAnimationStart]);

  return (
    <motion.div
      className={`robot-container ${isMobile ? 'mobile' : ''} ${isStreaming ? 'streaming' : ''}`}
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
      <RobotBody
        robotRef={robotRef}
        screenContentRef={screenContentRef}
        monitorPosition={monitorPosition}
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
        onMonitorOutput={handleMonitorOutput}
        drawSpread={drawSpread}
        onSubmitInput={onSubmitInput}
        mostCommonCards={mostCommonCards}
        dealingComplete={dealingComplete}
        formRef={formRef}
        onSpreadSelect={onSpreadSelect}
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
        fetchSpread={fetchSpread}
        onNewResponse={onNewResponse}
        onResponseComplete={handleResponseComplete}
        animationsComplete={animationsComplete}
        onAnimationStart={handleAnimationStart}
        isStreaming={isStreaming}
      />
    </motion.div>
  );
});

const RobotBody = memo(({
  robotRef,
  screenContentRef,
  monitorPosition,
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
}) => (
  <div ref={robotRef} className="robot-body">
    <div className="tarotmancer-text">tarotmancer</div>
    <div className="robot-head">
      <div className="crt-screen">
        <div className="screen-content" ref={screenContentRef}>
          <FloatingCards
            dealCards={dealCards}
            monitorPosition={monitorPosition}
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
            {monitorOutput}
          </div>
          <div className="screen-overlay"></div>
          <div className="screen-glass"></div>
          <div className="screen-frame"></div>
          <div className="screen-scanlines"></div>
        </div>
      </div>
    </div>
  </div>
));

Robot.propTypes = {
  dealCards: PropTypes.bool.isRequired,
  cardPositions: PropTypes.array.isRequired,
  finalCardPositions: PropTypes.array.isRequired,
  onExitComplete: PropTypes.func.isRequired,
  revealCards: PropTypes.bool.isRequired,
  shouldDrawNewSpread: PropTypes.bool.isRequired,
  onMonitorOutput: PropTypes.func.isRequired,
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
  monitorOutput: PropTypes.string.isRequired,
  isStreaming: PropTypes.bool.isRequired,
};

export default Robot;