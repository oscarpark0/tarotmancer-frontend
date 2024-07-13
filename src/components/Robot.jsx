import React, { useEffect, useCallback, useRef, useLayoutEffect, memo, useState } from 'react';
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
import { useMistralResponse } from '../hooks/useMistralResponse';

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
  onMonitorOutput,
  selectedLanguage,
  input,
  isRequesting,
  handleSubmit,
  isLoading,
  isDrawing,
}) => {
  const [shouldRequestCohere, setShouldRequestCohere] = useState(false);
  const [, setShowCards] = useState(false);

  const { isStreaming, handleNewResponse, handleResponseComplete } = useStreamingState(
    onNewResponse,
    onResponseComplete,
    onStreamingStateChange,
    onMonitorOutput
  );
  
  const { monitorOutput, handleMonitorOutput } = useMonitorOutput(onMonitorOutput);
  
  const { monitorPosition, robotRef, screenContentRef } = useRobotDimensions();
  
  const commandTerminalRef = useRef(null);
  useLanguage();

  const { isLoading: isLoadingMistral, handleSubmit: handleSubmitMistral, resetResponse } = useMistralResponse(
    (content) => {
      handleNewResponse(content);
      handleMonitorOutput(content);
    },
    handleResponseComplete
  );

  const handleDrawClick = useCallback(() => {
    resetResponse();
    fetchSpread().then(() => {
      handleSubmitMistral(mostCommonCards);
    });
  }, [fetchSpread, handleSubmitMistral, mostCommonCards, resetResponse]);

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
      handleSubmit(mostCommonCards);
    }
  }, [dealingComplete, mostCommonCards, handleSubmit]);

  const handleAnimationStart = useCallback(() => {
    onAnimationStart();
  }, [onAnimationStart]);

  useEffect(() => {
    if (mostCommonCards && dealingComplete && shouldRequestCohere && animationsComplete) {
      setShowCards(true);
      handleSubmit(mostCommonCards, input);
      setShouldRequestCohere(false);
    }
  }, [mostCommonCards, dealingComplete, animationsComplete, handleSubmit, shouldRequestCohere, input]);

  // Use handleMonitorOutput in a useEffect to update the monitor output when new content is received
  useEffect(() => {
    const updateMonitorOutput = (content) => {
      handleMonitorOutput(content);
    };

    // Add event listener for new content
    window.addEventListener('new-content', updateMonitorOutput);

    // Clean up the event listener
    return () => {
      window.removeEventListener('new-content', updateMonitorOutput);
    };
  }, [handleMonitorOutput]);

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
        onNewResponse={handleNewResponse}
        onResponseComplete={handleResponseComplete}
        animationsComplete={animationsComplete}
        onAnimationStart={handleAnimationStart}
        isStreaming={isStreaming}
        handleSubmit={handleSubmitMistral}
        isLoading={isLoadingMistral}
        handleDrawClick={handleDrawClick}
        isDrawing={isLoading}
      />
    </motion.div>
  );
});

const CRTMonitor = memo(({
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
}) => {
  return (
    <div ref={robotRef} className="crt-monitor">
      <div className="monitor-frame">
        <div className="screen">
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
              <pre>
                Response is streamed here:
                {monitorOutput}
              </pre>
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
};

export default Robot;