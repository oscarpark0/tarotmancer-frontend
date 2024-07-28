import React, { useEffect, useState, useCallback, useRef, useLayoutEffect, memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import FloatingCards from './FloatingCards.jsx';
import CommandTerminal from './CommandTerminal.jsx';
import './Robot.css';
import { debounce } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { formatResponse } from '../utils/textFormatting';
import { useTranslation } from '../utils/translations';
import { useLanguage } from '../contexts/LanguageContext'; // Import useLanguage

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

const Robot = memo((props) => {
  const { selectedLanguage } = useLanguage(); // Use useLanguage hook
  const { getTranslation } = useTranslation(); // Use getTranslation hook

  const { 
    canDraw, drawSpread, onResponseComplete, onStreamingStateChange, 
    onNewResponse, dealingComplete, onExitComplete, mostCommonCards, 
    onSubmitInput, selectedSpread, onSpreadSelect, isMobile, 
    fetchSpread, animationsComplete, onAnimationStart, 
    timeUntilNextDraw, user, currentDrawId, onOpenPastDraws, onDraw, 
    dealCards // Destructure dealCards from props
  } = props; // Destructure props

  const [monitorPosition, setMonitorPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [monitorOutput, setMonitorOutput] = useState('');
  const screenContentRef = useRef(null);
  const commandTerminalRef = useRef(null);
  const [responses, setResponses] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const robotRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [localCanDraw, setLocalCanDraw] = useState(canDraw);

  useEffect(() => {
    setLocalCanDraw(canDraw);
  }, [canDraw]);

  const handleDrawSpread = useCallback(() => {
    if (localCanDraw) {
      drawSpread();
      setLocalCanDraw(false);
    }
  }, [drawSpread, localCanDraw]);

  const handleResponseComplete = useCallback(() => {
    onResponseComplete();
    setIsStreaming(false);
    if (onStreamingStateChange) {
      onStreamingStateChange(false);
    }
  }, [onResponseComplete, onStreamingStateChange]); // Include onStreamingStateChange

  const handleNewResponse = useCallback((content) => {
    if (content === '') {
      setResponses([]);
      setMonitorOutput('');
      setIsStreaming(false);
      if (onStreamingStateChange) {
        onStreamingStateChange(false);
      }
      return;
    }

    setResponses(prevResponses => {
      if (prevResponses.length === 0 || prevResponses[prevResponses.length - 1].complete) {
        const newResponse = { id: uuidv4(), content: formatResponse(content), complete: false };
        setActiveTab(newResponse.id);
        return [...prevResponses, newResponse];
      } else {
        const updatedResponses = [...prevResponses];
        const lastResponse = updatedResponses[updatedResponses.length - 1];
        lastResponse.content += formatResponse(content);
        return updatedResponses;
      }
    });
    setMonitorOutput(prevOutput => prevOutput + formatResponse(content));
    onNewResponse(content);
    setIsStreaming(true);
    if (onStreamingStateChange) {
      onStreamingStateChange(true);
    }
  }, [onNewResponse, onStreamingStateChange]);

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
  }, [dealingComplete, completeCurrentResponse]); // Remove dealCards if not needed

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
    props.onMonitorOutput(output); // Destructure props to avoid using props directly
  }, [props]);

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
    if (isStreaming) {
    }
  }, [isStreaming]);

  useEffect(() => {
  }, [currentDrawId]);

  // Add this effect to force re-render when language changes
  useEffect(() => {
    // This empty dependency array ensures the effect runs when selectedLanguage changes
  }, [selectedLanguage]);

  const memoizedCommandTerminal = useMemo(() => (
    <CommandTerminal
      onMonitorOutput={handleMonitorOutput}
      drawSpread={handleDrawSpread}
      onSubmitInput={onSubmitInput}
      mostCommonCards={mostCommonCards}
      dealingComplete={dealingComplete}
      formRef={props.formRef}
      onSpreadSelect={onSpreadSelect}
      selectedSpread={selectedSpread}
      isMobile={isMobile}
      cards={props.cards}
      revealCards={props.revealCards}
      shouldDrawNewSpread={props.shouldDrawNewSpread}
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
      onResponseComplete={handleResponseComplete}
      animationsComplete={animationsComplete}
      onAnimationStart={handleAnimationStart}
      isStreaming={isStreaming}
      canDraw={localCanDraw}
      timeUntilNextDraw={timeUntilNextDraw}
      userId={user?.id}
      currentDrawId={currentDrawId}
      onOpenPastDraws={onOpenPastDraws}
      onDraw={onDraw}
      getTranslation={getTranslation}
    />
  ), [handleMonitorOutput, handleDrawSpread, onSubmitInput, mostCommonCards, dealingComplete, props.formRef, onSpreadSelect, selectedSpread, isMobile, props.cards, props.revealCards, props.shouldDrawNewSpread, fetchSpread, responses, activeTab, setActiveTab, handleNewResponse, handleResponseComplete, animationsComplete, handleAnimationStart, isStreaming, localCanDraw, timeUntilNextDraw, user, currentDrawId, onOpenPastDraws, onDraw, getTranslation]);

  console.log('Robot - canDraw:', canDraw, 'timeUntilNextDraw:', timeUntilNextDraw); // Added this line

  return (
    <motion.div
      className={`robot-container ${isMobile ? 'mobile' : ''} ${isStreaming ? 'streaming' : ''}`}
      style={{
        position: 'absolute',
        top: 0,
        left: isMobile ? 0 : '20px',
        width: isMobile ? '100%' : '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        height: 'auto',
        zIndex: 1001,
      }}
    >
      <div ref={robotRef} className="robot-body">
        <div className="tarotmancer-text">{getTranslation('tarotmancer')}</div>
        <div className="robot-head">
          <div className="crt-screen">
            <div className="screen-content" ref={screenContentRef}>
              <FloatingCards
                dealCards={dealCards}
                monitorPosition={monitorPosition}
                finalCardPositions={props.finalCardPositions}
                revealCards={props.revealCards}
                onExitComplete={onExitComplete}
                shouldDrawNewSpread={props.shouldDrawNewSpread}
                dealingComplete={() => {
                  if (typeof dealingComplete === 'function') {
                    dealingComplete();
                  }
                }}
                numCards={props.cards.length}
                isMobile={isMobile}
                onAnimationStart={handleAnimationStart}
              />
              <div className="monitor-output">
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

      {memoizedCommandTerminal}
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
  canDraw: PropTypes.bool.isRequired,
  timeUntilNextDraw: PropTypes.number,
  user: PropTypes.object,
  currentDrawId: PropTypes.number,
  onOpenPastDraws: PropTypes.func.isRequired,
  onDraw: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  getTranslation: PropTypes.func.isRequired,
};

export default Robot;