import React, { useEffect, useState, useCallback, useRef, useLayoutEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import FloatingCards from './FloatingCards.jsx';
import CommandTerminal from './CommandTerminal.jsx';
import './Robot.css';
import { debounce } from 'lodash';
import { useLanguage } from './LanguageSelector';

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
  onMonitorOutput,
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
  const [monitorPosition, setMonitorPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [monitorOutput, setMonitorOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const screenContentRef = useRef(null);
  const commandTerminalRef = useRef(null);
  const [responses, setResponses] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const robotRef = useRef(null);
  useLanguage();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetMonitorOutput = useCallback(
    debounce((newText) => {
      setMonitorOutput(prevOutput => prevOutput + newText);
    }, 100),
    []
  );

  const handleNewResponse = useCallback((response) => {
    console.log('New response received:', response);
    setMonitorOutput(prevOutput => {
      const newOutput = prevOutput + response;
      console.log('Updated monitor output:', newOutput);
      return newOutput;
    });
    setIsStreaming(true);
  }, []);

  useEffect(() => {
    onNewResponse(handleNewResponse);
    return () => {
      setIsStreaming(false);
      onResponseComplete();
    };
  }, [onNewResponse, handleNewResponse, onResponseComplete]);

  const completeCurrentResponse = useCallback(() => {
    setResponses(prevResponses => {
      if (prevResponses.length > 0) {
        const updatedResponses = [...prevResponses];
        updatedResponses[updatedResponses.length - 1].complete = true;
        return updatedResponses;
      }
      return prevResponses;
    });
  }, []);

  useEffect(() => {
    if (dealingComplete) {
      completeCurrentResponse();
    }
  }, [dealingComplete, completeCurrentResponse]);

  useEffect(() => {
    if (dealCards) {
      setTimeout(onExitComplete, 2000);
    }
  }, [dealCards, onExitComplete]);

  useEffect(() => {
    if (screenContentRef.current && robotRef.current) {
      const screenRect = screenContentRef.current.getBoundingClientRect();
      const robotRect = robotRef.current.getBoundingClientRect();
      setMonitorPosition({
        x: screenRect.x - robotRect.x,
        y: screenRect.y - robotRect.y,
        width: screenRect.width,
        height: screenRect.height,
      });
    }
  }, []);

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

  const handleMonitorOutput = useCallback((output) => {
    debouncedSetMonitorOutput(output);
    onMonitorOutput(output);
  }, [debouncedSetMonitorOutput, onMonitorOutput]);

  useLayoutEffect(() => {
    adjustFontSize();
  }, [monitorOutput]);

  useEffect(() => {
    if (dealingComplete && mostCommonCards) {
      onSubmitInput(mostCommonCards);
    }
  }, [dealingComplete, mostCommonCards, onSubmitInput]);

  useEffect(() => {
  }, [selectedSpread]);

  useEffect(() => {
    if (robotRef.current) {
      const robotHeight = robotRef.current.offsetHeight;
      document.documentElement.style.setProperty('--robot-height', `${robotHeight}px`);
    }
  }, []);

  const handleAnimationStart = useCallback(() => {
    onAnimationStart();
  }, [onAnimationStart]);

  useEffect(() => {
    // This effect will run whenever isStreaming changes
    // You can use it to trigger any actions that should occur when streaming starts or stops
    if (isStreaming) {
      console.log('Streaming started');
      // Add any actions you want to occur when streaming starts
    } else {
      console.log('Streaming stopped');
      // Add any actions you want to occur when streaming stops
    }
  }, [isStreaming]);

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
                dealingComplete={() => {
                  if (typeof dealingComplete === 'function') {
                    dealingComplete();
                  }
                }}
                numCards={cards.length}
                isMobile={isMobile}
                onAnimationStart={handleAnimationStart}
              />
              <div className="monitor-output" dangerouslySetInnerHTML={{ __html: monitorOutput }}></div>
              <div className="screen-overlay"></div>
              <div className="screen-glass"></div>
              <div className="screen-frame"></div>
              <div className="screen-scanlines"></div>
            </div>
          </div>
        </div>
      </div>

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
        responses={responses}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewResponse={handleNewResponse}
        onResponseComplete={() => {
          setIsStreaming(false);
          onResponseComplete();
        }}
        animationsComplete={animationsComplete}
        onAnimationStart={handleAnimationStart}
        isStreaming={isStreaming}
      />
    </motion.div>
  );
});

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
};

export default Robot;