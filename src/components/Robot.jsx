import React, { useEffect, useState, useCallback, useRef, useLayoutEffect, memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import FloatingCards from './FloatingCards.jsx';
import CommandTerminal from './CommandTerminal.jsx';
import AnonymousTimer from './AnonymousTimer.tsx';
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
    isDrawing,
    setIsDrawing,
    onAnimationComplete = () => {},
    cardRevealComponent, 
  } = props; 
  

  console.log('Robot: onAnimationComplete type:', typeof onAnimationComplete);

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
  const [isExpanded, setIsExpanded] = useState(false); 
  const robotBodyRef = useRef(null);
  const [showCards, setShowCards] = useState(false); 

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
    if (canDraw && !isDrawing) {
      setIsDrawing(true);
      setMonitorOutput(''); // Clear the monitor output
      setResponses([]); // Clear previous responses
      setIsStreaming(false);
      setActiveTab(null);
      debouncedDrawSpread();
    }
  }, [canDraw, isDrawing, setIsDrawing, debouncedDrawSpread]);

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
      setTimeout(() => {
        onExitComplete();
        // Set showCards to true after animations complete
        setShowCards(true);
      }, 2000);
    } else {
      setShowCards(false);
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
    props.onMonitorOutput(output); 
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

  useEffect(() => {
  }, [selectedLanguage]);

  useEffect(() => {
  }, [props.remainingDrawsToday]);

  useEffect(() => {
    if (user) {
    }
  }, [user]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prevState) => {
      const newState = !prevState;
      console.log('Robot: toggleExpand called, new state:', newState);
      
      // Update CSS variable for mobile height
      if (isMobile) {
        document.documentElement.style.setProperty('--robot-height', newState ? '60vh' : '40vh');
      }
      
      return newState;
    });
  }, [isExpanded, isMobile]);
  
  // Effect to handle mobile-specific layout adjustments
  useEffect(() => {
    if (isMobile) {
      // Set initial robot height CSS variable for mobile
      document.documentElement.style.setProperty('--robot-height', isExpanded ? '60vh' : '40vh');
    } else {
      // Reset to desktop styles
      document.documentElement.style.removeProperty('--robot-height');
    }
    
    return () => {
      // Clean up CSS variables
      document.documentElement.style.removeProperty('--robot-height');
    };
  }, [isMobile, isExpanded]);

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
      isDrawing={isDrawing}
      setIsDrawing={setIsDrawing}
      handleDrawSpread={handleDrawSpread}
    />
  ), [handleMonitorOutput, handleDrawSpread, onSubmitInput, mostCommonCards, dealingComplete, props.formRef, props.cards, props.revealCards, props.shouldDrawNewSpread, onSpreadSelect, selectedSpread, isMobile, fetchSpread, responses, activeTab, handleNewResponse, handleResponseComplete, animationsComplete, handleAnimationStart, isStreaming, canDraw, lastDrawTime, userId, currentDrawId, setCurrentDrawId, onOpenPastDraws, onDraw, getTranslation, remainingDrawsToday, drawCount, setDrawCount, setRemainingDrawsToday, user, isDrawing, setIsDrawing]);

  // Determine if the user is anonymous (not logged in)
  const isAnonymousUser = !user || !user.id || user.id.startsWith('anon_');
  
  // Get the remaining draw time from local storage for anonymous users
  const getAnonTimeRemaining = () => {
    if (!isAnonymousUser) return null;
    
    try {
      const drawData = localStorage.getItem('anonDrawData');
      if (!drawData) return null;
      
      const parsedData = JSON.parse(drawData);
      const now = new Date().getTime();
      
      if (parsedData.nextDrawTime && now < parsedData.nextDrawTime) {
        const hoursRemaining = Math.floor((parsedData.nextDrawTime - now) / (1000 * 60 * 60));
        const minutesRemaining = Math.floor(((parsedData.nextDrawTime - now) % (1000 * 60 * 60)) / (1000 * 60));
        return `${hoursRemaining}h ${minutesRemaining}m`;
      }
    } catch (error) {
      console.error('Error getting anonymous time remaining:', error);
    }
    
    return null;
  };
  
  const anonTimeRemaining = getAnonTimeRemaining();

  return (
    <motion.div
      className={`robot-container ${isMobile ? 'mobile' : ''} ${isStreaming ? 'streaming' : ''} ${user && !user.id.startsWith('anon_') ? 'user-logged-in' : 'anonymous-user'} ${isExpanded ? 'expanded' : ''}`}
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
        <div className="tarotmancer-text">
          {getTranslation('tarotmancer')}
          {isAnonymousUser && <AnonymousTimer />}
        </div>
        <div className="robot-head">
          <div className="crt-screen">
            <div className={`screen-content ${isExpanded ? 'expanded' : ''}`} ref={screenContentRef}>
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
                onAnimationComplete={onAnimationComplete}
              />
              {/* Card reveal container */}
              {isMobile && showCards && (
                <div className="card-reveal-container">
                  {cardRevealComponent}
                </div>
              )}
              <div ref={monitorOutputRef} className={`monitor-output ${isExpanded ? 'expanded' : ''}`}>
                {!isMobile || !showCards ? monitorOutput : ''}
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

      <div className="command-terminal-wrapper">
        {memoizedCommandTerminal}
      </div>
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
  lastDrawTime: PropTypes.object,
  remainingDrawsToday: PropTypes.number.isRequired, 
  drawCount: PropTypes.number.isRequired, 
  setDrawCount: PropTypes.func.isRequired, 
  setRemainingDrawsToday: PropTypes.func.isRequired,
  userId: PropTypes.string, 
  isRobotExpanded: PropTypes.bool.isRequired, 
  onToggleRobotExpand: PropTypes.func.isRequired,
  isDrawing: PropTypes.bool.isRequired,
  setIsDrawing: PropTypes.func.isRequired,
  onAnimationComplete: PropTypes.func.isRequired, 
};

export default Robot;
