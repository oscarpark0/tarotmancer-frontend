import React, { useEffect, useState, useCallback, useRef, useLayoutEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import FloatingCards from './FloatingCards.jsx';
import CommandTerminal from './CommandTerminal.jsx';
import './Robot.css';
import { debounce } from 'lodash';
import CardReveal from './CardReveal.jsx';
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

  const handleResponseComplete = useCallback(() => {
    onResponseComplete();
  }, [onResponseComplete]);

  const handleNewResponse = useCallback((content) => {
    setResponses(prevResponses => {
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
    setMonitorOutput(content);
    onNewResponse(content);
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
    if (screenContentRef.current && commandTerminalRef.current) {
      const screenRect = screenContentRef.current.getBoundingClientRect();
      setMonitorPosition({
        x: screenRect.x,
        y: screenRect.y,
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


  return (
    <motion.div
      className={`robot-container ${isMobile ? 'mobile' : ''}`}
      style={{
        alignItems: 'center',
        position: 'absolute',
        zIndex: isMobile ? 1000 : 100,
        top: isMobile ? '2vh' : '9vh',
        width: isMobile ? '100%' : 'auto',
        display: isMobile ? 'flex' : 'block',
        flexDirection: isMobile ? 'column' : 'unset',
      }}
    >
      <div className="robot-body">
        <div className="tarotmancer-text">tarotmancer</div>
        <div className="robot-head">
          <div className="crt-screen">
            <div className="screen-content" ref={screenContentRef}>
              <FloatingCards
                dealCards={dealCards}
                cardPositions={cardPositions}
                monitorPosition={monitorPosition}
                finalCardPositions={finalCardPositions}
                revealCards={revealCards}
                onExitComplete={onExitComplete}
                shouldDrawNewSpread={shouldDrawNewSpread}
                dealingComplete={dealingComplete}
                cards={cards}
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
        style={isMobile ? { width: '95vw', marginTop: '10px' } : {}}
        drawCount={drawCount}
        fetchSpread={fetchSpread}
        responses={responses}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewResponse={handleNewResponse}
        onResponseComplete={handleResponseComplete}
      />
      <CardReveal
        cards={cards}
        revealCards={revealCards}
        dealingComplete={dealingComplete}
        shouldDrawNewSpread={shouldDrawNewSpread}
        isMobile={isMobile}
        style={isMobile ? {
          position: 'absolute',
          top: '45vh',
          left: '2.5vw',
          width: '95vw',
          height: '50vh',
          zIndex: 1500
        } : {}}
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