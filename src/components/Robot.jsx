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
import { useLanguage } from '../contexts/LanguageContext';

const Robot = memo((props) => {
  const { selectedLanguage } = useLanguage(); 
  const { getTranslation } = useTranslation(); 

  const { 
    canDraw, drawSpread, onResponseComplete, onStreamingStateChange, 
    onNewResponse, dealingComplete, onExitComplete, mostCommonCards, 
    onSubmitInput, selectedSpread, onSpreadSelect, isMobile, 
    fetchSpread, animationsComplete, onAnimationStart, 
    user, currentDrawId, setCurrentDrawId, 
    onOpenPastDraws, onDraw,
    dealCards, lastDrawTime, remainingDrawsToday,
    drawCount,
    setDrawCount,
    setRemainingDrawsToday,
    userId,
  } = props; // Destructure props

  const [monitorPosition, setMonitorPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [monitorOutput, setMonitorOutput] = useState('');
  const screenContentRef = useRef(null);
  const monitorOutputRef = useRef(null);
  const commandTerminalRef = useRef(null);
  const [responses, setResponses] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const robotRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [localCanDraw, setLocalCanDraw] = useState(canDraw);
  const [isExpanded, setIsExpanded] = useState(false); // Added isExpanded state
  const robotBodyRef = useRef(null); // Added robotBodyRef

  useEffect(() => {
    setLocalCanDraw(canDraw);
  }, [canDraw]);

  const debouncedDrawSpread = useMemo(
    () => debounce(() => {
      if (localCanDraw) {
        drawSpread();
        setLocalCanDraw(false);
      }
    }, 300),
    [drawSpread, localCanDraw]
  );

  const handleDrawSpread = useCallback(() => {
    debouncedDrawSpread();
  }, [debouncedDrawSpread]);

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



  const handleDealingComplete = useCallback(() => {
    if (typeof dealingComplete === 'function') {
      dealingComplete();
    }
  }, [dealingComplete]);

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

  const adjustFontSize = useCallback(() => {
    const monitorOutputElement = monitorOutputRef.current;
    const screenContentElement = screenContentRef.current;

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
  }, []);

  const debouncedAdjustFontSize = useMemo(
    () => debounce(adjustFontSize, 100),
    [adjustFontSize]
  );

  useEffect(() => {
    const handleResize = () => {
      if (monitorOutputRef.current) {
        debouncedAdjustFontSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      debouncedAdjustFontSize.cancel();
    };
  }, [debouncedAdjustFontSize]);

  useLayoutEffect(() => {
    adjustFontSize();
  }, [monitorOutput, adjustFontSize]);

  const handleMonitorOutput = useCallback((output) => {
    setMonitorOutput(output);
    props.onMonitorOutput(output); // Destructure props to avoid using props directly
  }, [props]);

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

  useEffect(() => {
  }, [props.remainingDrawsToday]);

  useEffect(() => {
    if (user) {
      // You could also use this to set some user-specific state or trigger some user-specific logic
    }
  }, [user]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prevState) => !prevState);
    console.log('Robot: toggleExpand called, new state:', !isExpanded);
  }, [isExpanded]);

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
      revealCards={typeof props.revealCards === 'function' ? props.revealCards : () => props.revealCards}
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
      canDraw={canDraw} 
      lastDrawTime={lastDrawTime}
      userId={userId} // Add userId prop
      currentDrawId={currentDrawId}
      setCurrentDrawId={setCurrentDrawId}
      onOpenPastDraws={onOpenPastDraws}
      onDraw={onDraw}
      getTranslation={getTranslation}
      remainingDrawsToday={remainingDrawsToday} 
      drawCount={drawCount} 
      setDrawCount={setDrawCount} 
      setRemainingDrawsToday={setRemainingDrawsToday} 
      user={user} 
    />
  ), [handleMonitorOutput, handleDrawSpread, onSubmitInput, mostCommonCards, dealingComplete, props.formRef, props.cards, props.revealCards, props.shouldDrawNewSpread, onSpreadSelect, selectedSpread, isMobile, fetchSpread, responses, activeTab, handleNewResponse, handleResponseComplete, animationsComplete, handleAnimationStart, isStreaming, canDraw, lastDrawTime, userId, currentDrawId, setCurrentDrawId, onOpenPastDraws, onDraw, getTranslation, remainingDrawsToday, drawCount, setDrawCount, setRemainingDrawsToday, user]);

  return (
    <motion.div
      className={`robot-container ${isMobile ? 'mobile' : ''} ${isStreaming ? 'streaming' : ''} ${user ? 'user-logged-in' : ''} ${isExpanded ? 'expanded' : ''}`}
      ref={robotRef}
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
      <div ref={robotBodyRef} className={`robot-body ${isExpanded ? 'expanded' : ''}`}>
        <div className="tarotmancer-text">{getTranslation('tarotmancer')}</div>
        <div className="robot-head">
          <div className="crt-screen">
            <div className="screen-content" ref={screenContentRef}>
              <FloatingCards
                dealCards={dealCards}
                monitorPosition={monitorPosition}
                finalCardPositions={props.finalCardPositions}
                revealCards={typeof props.revealCards === 'function' ? props.revealCards : () => props.revealCards}
                onExitComplete={onExitComplete}
                shouldDrawNewSpread={props.shouldDrawNewSpread}
                dealingComplete={handleDealingComplete}
                numCards={props.cards.length}
                isMobile={isMobile}
                onAnimationStart={handleAnimationStart}
              />
              <div ref={monitorOutputRef} className="monitor-output">
                {monitorOutput}
              </div>
              <div className="screen-overlay"></div>
              <div className="screen-glass"></div>
              <div className="screen-frame"></div>
              <div className="screen-scanlines"></div>
            </div>
          </div>
        </div>
        
        {/* Expand button */}
        <button 
          className="expand-button" 
          onClick={toggleExpand}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
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
  revealCards: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]).isRequired,
  shouldDrawNewSpread: PropTypes.bool.isRequired,
  onMonitorOutput: PropTypes.func.isRequired,
  drawSpread: PropTypes.func.isRequired,
  dealingComplete: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]).isRequired,
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
  user: PropTypes.object.isRequired,
  currentDrawId: PropTypes.number,
  setCurrentDrawId: PropTypes.func.isRequired,
  onOpenPastDraws: PropTypes.func.isRequired,
  onDraw: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  getTranslation: PropTypes.func.isRequired,
  lastDrawTime: PropTypes.object, // Add lastDrawTime prop type
  remainingDrawsToday: PropTypes.number.isRequired, // Add remainingDrawsToday prop type
  drawCount: PropTypes.number.isRequired, // Add drawCount prop type
  setDrawCount: PropTypes.func.isRequired, // Add setDrawCount prop type
  setRemainingDrawsToday: PropTypes.func.isRequired, // Add setRemainingDrawsToday prop type
  userId: PropTypes.string, // Add userId prop type
  isRobotExpanded: PropTypes.bool.isRequired, // Added isRobotExpanded prop type
  onToggleRobotExpand: PropTypes.func.isRequired, // Added onToggleRobotExpand prop type
};

export default Robot;