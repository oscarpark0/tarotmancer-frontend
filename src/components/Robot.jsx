import React, { useEffect, useState, useCallback, useRef, useLayoutEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import FloatingCards from './FloatingCards.jsx';
import CommandTerminal from './CommandTerminal.jsx';
import './Robot.css';
import { debounce } from 'lodash';
import { v4 as uuidv4 } from 'uuid';


const adjustFontSize = () => {
  const monitorOutputElement = document.querySelector('.monitor-output');
  const screenContentElement = document.querySelector('.screen-content');

  if (monitorOutputElement && screenContentElement) {
    const screenHeight = screenContentElement.offsetHeight;
    const outputHeight = monitorOutputElement.scrollHeight;

    if (outputHeight > screenHeight) {
      let fontSize = 240;
      let step = 10;
      
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
  drawCount,
  fetchSpread,
  onNewResponse,
  onResponseComplete,
}) => {
  const [monitorPosition, setMonitorPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [monitorOutput, setMonitorOutput] = useState('');
  const screenContentRef = useRef(null);
  const commandTerminalRef = useRef(null);
  const [responses, setResponses] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const robotRef = useRef(null);

  const handleResponseComplete = useCallback(() => {
    onResponseComplete();
  }, [onResponseComplete]);

  const handleNewResponse = useCallback((content) => {
    setResponses(prevResponses => {
      if (content === '') {
        // Clear all responses when an empty string is received
        return [];
      }
      if (prevResponses.length === 0 || prevResponses[prevResponses.length - 1].complete) {
        const newResponse = { id: uuidv4(), content, complete: false };
        setActiveTab(newResponse.id);
        return [...prevResponses, newResponse];
      } else {
        const updatedResponses = [...prevResponses];
        const lastResponse = updatedResponses[updatedResponses.length - 1];
        lastResponse.content = content;
        return updatedResponses;
      }
    });
    setMonitorOutput(content); // This updates the Robot's display
    onNewResponse(content); // This notifies the parent component
  }, [onNewResponse]);

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
    setMonitorOutput(output);
    onMonitorOutput(output);
  }, [onMonitorOutput]);

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

  return (
    <motion.div
      className={`robot-container ${isMobile ? 'mobile' : ''}`}
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
                dealingComplete={dealingComplete}
                numCards={cards.length}
                isMobile={isMobile}
              />
              <div className="monitor-output">
                {monitorOutput}
              </div>
            </div>
            <div className="screen-overlay"></div>
            <div className="screen-glass"></div>
            <div className="screen-frame"></div>
            <div className="screen-scanlines"></div>
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
        drawCount={drawCount}
        fetchSpread={fetchSpread}
        responses={responses}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewResponse={handleNewResponse}
        onResponseComplete={handleResponseComplete}
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
  dealingComplete: PropTypes.bool.isRequired,
  mostCommonCards: PropTypes.string.isRequired,
  formRef: PropTypes.object.isRequired,
  onSubmitInput: PropTypes.func.isRequired,
  selectedSpread: PropTypes.string.isRequired,
  onSpreadSelect: PropTypes.func.isRequired,
  cards: PropTypes.array,
  isMobile: PropTypes.bool.isRequired,
  drawCount: PropTypes.number.isRequired,
  fetchSpread: PropTypes.func.isRequired,
  onNewResponse: PropTypes.func.isRequired,
  onResponseComplete: PropTypes.func.isRequired,
};

export default Robot;