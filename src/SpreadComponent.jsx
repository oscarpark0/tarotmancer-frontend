import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import AnimatedGridPattern from './components/AnimatedGridPattern.tsx';
import CardReveal from './components/CardReveal';
import FloatingCards from './components/FloatingCards';
import Robot from './components/Robot';
import { API_BASE_URL } from './utils/config.tsx';
import { generateCelticCrossPositions, generateThreeCardPositions } from './utils/cardPositions.js';
import ErrorBoundary from './components/ErrorBoundary';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useLanguage } from './contexts/LanguageContext';
import { useTranslation } from './utils/translations';
import PastDrawsModal from './components/PastDrawsModal';
import { debounce } from 'lodash';

const SpreadComponent = React.memo(({ isMobile, onSpreadSelect, selectedSpread, isDarkMode, canDraw, timeUntilNextDraw, getToken, onDraw, lastDrawTime, onDrawComplete, remainingDrawsToday, setRemainingDrawsToday, lastResetTime, setLastResetTime, drawCount, setDrawCount }) => {
  const { user } = useKindeAuth();
  const { selectedLanguage } = useLanguage();
  const { getTranslation } = useTranslation();

  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dealCards, setDealCards] = useState(false);
  const [revealedCards, setRevealedCards] = useState(0);
  const [shouldDrawNewSpread, setShouldDrawNewSpread] = useState(false);
  const [mostCommonCards, setMostCommonCards] = useState('');
  const formRef = useRef(null);
  const [cards, setCards] = useState([]);
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentDrawId, setCurrentDrawId] = useState(null);
  const [isPastDrawsModalOpen, setIsPastDrawsModalOpen] = useState(false);
  const [isRobotExpanded, setIsRobotExpanded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const handleRevealCards = useCallback(() => {
    setRevealedCards(prevCards => cards.length);
  }, [cards.length]);

  const handleSubmitInput = useCallback((value) => {
    if (formRef.current) {
      formRef.current.submitInput(value);
    }
  }, []);

  const handleDealingComplete = useCallback(() => {
    handleSubmitInput(mostCommonCards);
  }, [handleSubmitInput, mostCommonCards]);

  const handleStreamingStateChange = useCallback((isStreaming) => {
    setIsStreaming(isStreaming);
  }, []);

  const debouncedFetchSpread = useMemo(
    () => debounce(async () => {
      console.log('Debounced fetchSpread called');
      if (!user || !user.id) {
        setError('User not authenticated. Please log in.');
        return;
      }
      if (!canDraw) {
        setError(`You can draw again in ${timeUntilNextDraw}`);
        return;
      }
      setIsLoading(true);
      console.log(`Initiating draw for user: ${user.id}, Current draw count: ${drawCount}`);
      try {
        const token = await getToken();
        const origin = window.location.origin;
        const newDrawId = Date.now();

        const headers = {
          'Content-Type': 'application/json',
          'Origin': origin,
          'Authorization': `Bearer ${token}`,
          'User-ID': user.id,
          'Draw-ID': newDrawId.toString(),
        };

        const endpoint = selectedSpread === 'celtic' ? 'draw_celtic_spreads' : 'draw_three_card_spread';
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
          method: 'GET',
          headers: headers,
          credentials: 'include',
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Draw completed. New draw ID: ${newDrawId}`);
        setCurrentDrawId(newDrawId);
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const positions = selectedSpread === 'celtic'
          ? generateCelticCrossPositions(data.positions.length, windowWidth, windowHeight)
          : generateThreeCardPositions(data.positions.length, windowWidth, windowHeight);

        const newPositions = positions.map((pos, index) => ({
          ...data.positions[index],
          left: pos.left,
          top: pos.top,
          tooltip: data.positions[index].position_name
        }));

        const newCards = newPositions.map(pos => ({
          name: pos.most_common_card,
          img: pos.most_common_card_img,
          orientation: pos.orientation,
          position_name: pos.position_name,
          tooltip: pos.position_name
        }));
        const formattedMostCommonCards = data.positions.map(
          (pos) => `Most common card at ${pos.position_name}: ${pos.most_common_card} - Orientation: ${pos.orientation}`
        ).join('\n');

        // Handle rate limit headers
        const remainingDrawsToday = response.headers.get('X-RateLimit-Remaining');
        const resetTime = response.headers.get('X-RateLimit-Reset');

        if (remainingDrawsToday !== null) {
          setRemainingDrawsToday(parseInt(remainingDrawsToday, 10));
          // Update drawCount based on remainingDrawsToday
          setDrawCount(5 - parseInt(remainingDrawsToday, 10));
        }

        if (resetTime !== null) {
          setLastResetTime(parseInt(resetTime, 10) * 1000);
        }

        // Update state in a single batch
        setPositions(newPositions);
        setCards(newCards);
        setDealCards(true);
        setMostCommonCards(formattedMostCommonCards);
        setCurrentDrawId(newDrawId);

        // Call onDrawComplete only once here
        console.log('Calling onDrawComplete');
        onDrawComplete();

      } catch (error) {
        console.error('Error drawing spread:', error);
        setError('Failed to draw spread. Please try again later.');
        setCards([]);
        setCurrentDrawId(null);
      } finally {
        setIsLoading(false);
        setShouldDrawNewSpread(false);
      }
    }, 300),  // 300ms debounce time
    [user, canDraw, timeUntilNextDraw, getToken, selectedSpread, setError, setCards, setPositions, setDealCards, setMostCommonCards, setCurrentDrawId, onDrawComplete, setRemainingDrawsToday, setLastResetTime, drawCount, setDrawCount]
  );

  const drawSpread = useCallback(async () => {
    setShowCards(false); // Hide the current cards
    setCards([]); // Clear the current cards array
    setPositions([]); // Clear the current positions array
  
    // Wait for a short time to allow the cards to disappear
    await new Promise(resolve => setTimeout(resolve, 300));

    setIsLoading(true);
    setError(null);
    setShouldDrawNewSpread(true);
    setDealCards(false);
    setAnimationsComplete(false);

    try {
      await debouncedFetchSpread();
      onDraw();
    } catch (error) {
      console.error('Error in drawSpread:', error);
      setError(error.message || 'An error occurred while drawing the spread.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedFetchSpread, onDraw]);

  const handleExitComplete = useCallback(() => {
    setTimeout(() => {
      handleRevealCards();
      setTimeout(() => {
        handleDealingComplete();
        setAnimationsComplete(true);
      }, 750);
    }, 500);
  }, [handleDealingComplete, handleRevealCards]);

  const handleMonitorOutput = useCallback(() => {}, []);

  const handleOpenPastDraws = useCallback(() => {
    setIsPastDrawsModalOpen(true);
  }, []);

  const handleNewResponse = useCallback(() => {
    setIsStreaming(true);
    console.log(`[handleNewResponse] setIsStreaming: ${setIsStreaming}`);
  }, []);

  const handleResponseComplete = useCallback(() => {
    setIsStreaming(false);
    console.log(`[handleResponseComplete] setIsStreaming: ${setIsStreaming}`);
  }, []);

  const handleAnimationStart = useCallback(() => {
  }, []);

  const handleToggleRobotExpand = useCallback(() => {
    setIsRobotExpanded(prev => !prev);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    console.log('FloatingCards animation completed');
    setShowCards(true); // Show the new cards
    setShouldDrawNewSpread(false);
  }, []);

  // Add this effect to force re-render when language changes
  useEffect(() => {
    // This empty dependency array ensures the effect runs when selectedLanguage changes
  }, [selectedLanguage]);

  // Add this effect to log the timeUntilNextDraw value
  useEffect(() => {
  }, [timeUntilNextDraw]);

  const memoizedRobot = useMemo(() => (
    <Robot
      dealCards={dealCards}
      cardPositions={positions}
      revealedCards={revealedCards}
      finalCardPositions={positions.map(pos => ({ left: pos.left, top: pos.top }))}
      onExitComplete={handleExitComplete}
      revealCards={handleRevealCards}
      shouldDrawNewSpread={shouldDrawNewSpread}
      onMonitorOutput={handleMonitorOutput}
      drawSpread={drawSpread}
      dealingComplete={handleDealingComplete}
      mostCommonCards={mostCommonCards}
      formRef={formRef}
      onSubmitInput={handleSubmitInput}
      isMobile={isMobile}
      cards={cards}
      selectedSpread={selectedSpread}
      onSpreadSelect={onSpreadSelect}
      fetchSpread={debouncedFetchSpread}
      onNewResponse={handleNewResponse}
      onResponseComplete={handleResponseComplete}
      animationsComplete={animationsComplete}
      isDarkMode={isDarkMode}
      onAnimationStart={handleAnimationStart}
      onStreamingStateChange={handleStreamingStateChange}
      isStreaming={isStreaming}
      canDraw={canDraw}
      timeUntilNextDraw={timeUntilNextDraw}
      currentDrawId={currentDrawId}
      setCurrentDrawId={setCurrentDrawId}
      onOpenPastDraws={handleOpenPastDraws}
      onDraw={onDraw}
      selectedLanguage={selectedLanguage}
      getTranslation={getTranslation}
      lastDrawTime={lastDrawTime}
      user={user}
      remainingDrawsToday={remainingDrawsToday}
      setRemainingDrawsToday={setRemainingDrawsToday}
      onDrawComplete={onDrawComplete}
      drawCount={drawCount}
      setDrawCount={setDrawCount}
      userId={user ? user.id : null}
      isRobotExpanded={isRobotExpanded}
      onToggleRobotExpand={handleToggleRobotExpand}
      isDrawing={isDrawing}
      setIsDrawing={setIsDrawing}
      onAnimationComplete={handleAnimationComplete}
    />
  ), [dealCards, positions, revealedCards, handleExitComplete, handleRevealCards, shouldDrawNewSpread, handleMonitorOutput, drawSpread, handleDealingComplete, mostCommonCards, handleSubmitInput, isMobile, cards, selectedSpread, onSpreadSelect, debouncedFetchSpread, handleNewResponse, handleResponseComplete, animationsComplete, isDarkMode, handleAnimationStart, handleStreamingStateChange, isStreaming, canDraw, timeUntilNextDraw, currentDrawId, handleOpenPastDraws, onDraw, selectedLanguage, getTranslation, lastDrawTime, user, remainingDrawsToday, setRemainingDrawsToday, onDrawComplete, drawCount, setDrawCount, isRobotExpanded, handleToggleRobotExpand, isDrawing, setIsDrawing, handleAnimationComplete]);

  const memoizedFloatingCards = useMemo(() => (
    <FloatingCards
      dealCards={dealCards}
      monitorPosition={{ width: window.innerWidth, height: window.innerHeight }}
      finalCardPositions={positions.map(pos => ({ left: pos.left, top: pos.top }))}
      onExitComplete={handleExitComplete}
      revealCards={handleRevealCards}
      dealingComplete={handleDealingComplete}
      shouldDrawNewSpread={shouldDrawNewSpread}
      numCards={selectedSpread === 'celtic' ? 10 : 3}
      isMobile={isMobile}
      cards={cards}
      onAnimationStart={handleAnimationStart}
      onAnimationComplete={handleAnimationComplete}
    />
  ), [dealCards, positions, handleExitComplete, handleRevealCards, handleDealingComplete, shouldDrawNewSpread, isMobile, cards, handleAnimationStart, selectedSpread, handleAnimationComplete]);

  return (
    <ErrorBoundary>
      <div className={`w-full flex flex-col justify-center fixed ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-amber-100 via-blue to-white'} min-h-screen`}>
        <AnimatedGridPattern
          className="absolute inset-0"
          color="#00ff00"
          fill="#000000"
          positions={positions}
          isDarkMode={isDarkMode}
          isMobile={isMobile}
          isPaused={isStreaming}
        />
        <div className="relative w-full h-screen overflow-hidden">
          {isLoading ? (
            <p className="text-2xl text-green-600 text-center animate-pulse z-99900">
              {getTranslation('processing')}
            </p>
          ) : error ? (
            <p className="text-4xl text-red-600 text-center z-100">{error}</p>
          ) : null}
          <div className={`flex flex-col items-center ${isMobile ? 'mobile-layout' : ''}`}>
            {memoizedRobot}
          </div>
          {positions.length > 0 && (
            <div className="relative z-10 w-full flex flex-col items-center">
              <div style={{ position: 'relative', zIndex: 1, marginTop: '30px' }}>
                <section className="relative z-10 mb-16 w-full">
                  <ErrorBoundary>
                    {memoizedFloatingCards}
                  </ErrorBoundary>
                  <CardReveal
                    cards={cards}
                    showCards={showCards}
                    isMobile={isMobile}
                  />
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
      <PastDrawsModal
        isOpen={isPastDrawsModalOpen}
        onClose={() => setIsPastDrawsModalOpen(false)}
      />
    </ErrorBoundary>
  );
});

SpreadComponent.propTypes = {
  isMobile: PropTypes.bool,
  onSpreadSelect: PropTypes.func,
  selectedSpread: PropTypes.string,
  isDarkMode: PropTypes.bool,
  canDraw: PropTypes.bool,
  timeUntilNextDraw: PropTypes.string,
  getToken: PropTypes.func.isRequired,
  onDraw: PropTypes.func.isRequired,
  lastDrawTime: PropTypes.string,
  onDrawComplete: PropTypes.func.isRequired,
  remainingDrawsToday: PropTypes.number.isRequired,
  setRemainingDrawsToday: PropTypes.func.isRequired,
  lastResetTime: PropTypes.number,
  setLastResetTime: PropTypes.func,
  drawCount: PropTypes.number.isRequired,
  setDrawCount: PropTypes.func.isRequired,
};

export default SpreadComponent;