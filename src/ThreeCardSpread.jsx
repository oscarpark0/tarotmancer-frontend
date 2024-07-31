import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import AnimatedGridPattern from './components/AnimatedGridPattern.tsx';
import CardReveal from './components/CardReveal';
import FloatingCards from './components/FloatingCards';
import Robot from './components/Robot';
import { API_BASE_URL } from './utils/config.tsx';
import { generateThreeCardPositions } from './utils/cardPositions.js';
import ErrorBoundary from './components/ErrorBoundary';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useLanguage } from './contexts/LanguageContext';
import { useTranslation } from './utils/translations'; // Import useTranslation
import PastDrawsModal from './components/PastDrawsModal';


const ThreeCardSpread = React.memo(({ isMobile, onSpreadSelect, selectedSpread, drawCount, setDrawCount, setLastResetTime, isDarkMode, canDraw, timeUntilNextDraw, lastDrawTime }) => {
  const { getToken, user } = useKindeAuth();
  const { selectedLanguage } = useLanguage();
  const { getTranslation } = useTranslation(); // Use the hook

  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dealCards, setDealCards] = useState(false);
  const [revealCards, setRevealCards] = useState(false);
  const [revealedCards, setRevealedCards] = useState(0);
  const [dealingComplete, setDealingComplete] = useState(false);
  const [shouldDrawNewSpread, setShouldDrawNewSpread] = useState(false);
  const [mostCommonCards, setMostCommonCards] = useState('');
  const [cards, setCards] = useState([]);
  const formRef = useRef(null);
  const [floatingCardsComplete, setFloatingCardsComplete] = useState(false);
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentDrawId, setCurrentDrawId] = useState(null);
  const [isPastDrawsModalOpen, setIsPastDrawsModalOpen] = useState(false);

  const handleStreamingStateChange = useCallback((streaming) => {
    setIsStreaming(streaming);
  }, []);

  const handleSubmitInput = useCallback((value) => {
    if (formRef.current) {
      formRef.current.submitInput(value);
    }
  }, []);

  const fetchSpread = useCallback(async () => {
    if (!user || !user.id) {
      setError('User not authenticated. Please log in.');
      return;
    }

    if (!canDraw) {
      setError(`You can draw again in ${timeUntilNextDraw}`);
      return;
    }

    if (drawCount >= 100) {
      setError('You have reached the maximum number of draws for today. Please try again tomorrow.');
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      const origin = window.location.origin;

      const headers = {
        'Content-Type': 'application/json',
        'Origin': origin,
        'Authorization': `Bearer ${token}`,
        'User-ID': user.id
      };

      const endpoint = selectedSpread === 'celtic' ? 'draw_celtic_spreads' : 'draw_three_card_spread';
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const drawId = data.id || data.drawId || data.draw_id;
      setCurrentDrawId(drawId);
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const positions = generateThreeCardPositions(data.positions.length, windowWidth, windowHeight);
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
      

      // Ensure we're working with numbers
      const remainingDrawsTodayNum = parseInt(remainingDrawsToday, 100);
      if (!isNaN(remainingDrawsTodayNum)) {
        setDrawCount(10 - remainingDrawsTodayNum);
      } else {
        console.warn('Invalid remaining draws value:', remainingDrawsToday);
      }

      const resetTimeNum = parseInt(resetTime, 100);
      if (!isNaN(resetTimeNum)) {
        setLastResetTime(resetTimeNum * 1000);
      }

      setPositions(newPositions);
      setCards(newCards);
      setDealCards(true);
      setMostCommonCards(formattedMostCommonCards);
      setCurrentDrawId(data.id); // Ensure this is set

    } catch (error) {
      console.error('Error drawing spread:', error);
      setError('Failed to draw spread. Please check your authentication and try again.');
      setCards([]);
    } finally {
      setIsLoading(false);
      setShouldDrawNewSpread(false);
    }
  }, [getToken, selectedSpread, drawCount, setDrawCount, setLastResetTime, canDraw, timeUntilNextDraw, user]);

  const handleDealingComplete = useCallback(() => {
    setDealingComplete(true);
    handleSubmitInput(mostCommonCards);
  }, [handleSubmitInput, mostCommonCards]);

  const handleExitComplete = useCallback(() => {
    setFloatingCardsComplete(true);
    setTimeout(() => {
      setRevealCards(true);
      setRevealedCards(cards.length);
      setTimeout(() => {
        handleDealingComplete();
        setAnimationsComplete(true);
      }, 750);
    }, 500);
  }, [cards.length, handleDealingComplete]);

  const handleMonitorOutput = useCallback(() => {}, []);

  const handleDrawSpread = useCallback(() => {
    if (canDraw) {
      setDealCards(false);
      setRevealCards(false);
      setDealingComplete(false);
      setShouldDrawNewSpread(true);
      fetchSpread();
    }
  }, [canDraw, fetchSpread]);

  const handleOpenPastDraws = useCallback(() => {
    setIsPastDrawsModalOpen(true);
  }, []);

  const handleAnimationStart = useCallback(() => {
    // Add your animation start logic here
  }, []);

  const handleDraw = useCallback(() => {
    // Add your draw logic here
    handleDrawSpread();
  }, [handleDrawSpread]);

  // Add this effect to force re-render when language changes
  useEffect(() => {
    // This empty dependency array ensures the effect runs when selectedLanguage changes
  }, [selectedLanguage]);

  const memoizedRobot = useMemo(() => (
    <Robot
      dealCards={dealCards}
      cardPositions={positions}
      revealedCards={revealedCards}
      finalCardPositions={positions}
      onExitComplete={handleExitComplete}
      revealCards={revealCards}
      shouldDrawNewSpread={shouldDrawNewSpread}
      onMonitorOutput={handleMonitorOutput}
      drawSpread={handleDrawSpread}
      dealingComplete={handleDealingComplete}
      mostCommonCards={mostCommonCards}
      formRef={formRef}
      onSubmitInput={handleSubmitInput}
      cards={cards}
      selectedSpread={selectedSpread}
      onSpreadSelect={onSpreadSelect}
      isMobile={isMobile}
      drawCount={drawCount}
      fetchSpread={fetchSpread}
      onNewResponse={(response) => {
        setIsStreaming(true);
      }}
      onResponseComplete={() => {
        setIsStreaming(false);
      }}
      animationsComplete={animationsComplete}
      isDarkMode={isDarkMode}
      onStreamingStateChange={handleStreamingStateChange}
      isStreaming={isStreaming}
      canDraw={canDraw}
      timeUntilNextDraw={timeUntilNextDraw}
      lastDrawTime={lastDrawTime}
      userId={user?.id}
      currentDrawId={currentDrawId}
      onOpenPastDraws={handleOpenPastDraws}
      onAnimationStart={handleAnimationStart}
      onDraw={handleDraw}
      selectedLanguage={selectedLanguage}
      getTranslation={getTranslation}
    />
  ), [dealCards, positions, revealedCards, handleExitComplete, revealCards, shouldDrawNewSpread, handleMonitorOutput, handleDrawSpread, handleDealingComplete, mostCommonCards, handleSubmitInput, cards, selectedSpread, onSpreadSelect, isMobile, drawCount, fetchSpread, animationsComplete, isDarkMode, handleStreamingStateChange, isStreaming, canDraw, timeUntilNextDraw, lastDrawTime, user?.id, currentDrawId, handleOpenPastDraws, handleAnimationStart, handleDraw, selectedLanguage, getTranslation]);

  const memoizedFloatingCards = useMemo(() => (
    <FloatingCards
      dealCards={dealCards}
      monitorPosition={{ width: window.innerWidth, height: window.innerHeight }}
      finalCardPositions={positions.map(pos => ({ left: pos.left, top: pos.top }))}
      onExitComplete={handleExitComplete}
      revealCards={revealCards}
      dealingComplete={handleDealingComplete}
      shouldDrawNewSpread={shouldDrawNewSpread}
      numCards={3}
      isMobile={isMobile}
    />
  ), [dealCards, positions, handleExitComplete, revealCards, handleDealingComplete, shouldDrawNewSpread, isMobile]);

  const memoizedCardReveal = useMemo(() => (
    <CardReveal
      cards={cards}
      revealCards={revealCards && floatingCardsComplete}
      dealingComplete={dealingComplete}
      shouldDrawNewSpread={shouldDrawNewSpread}
      isMobile={isMobile}
      className="md:hidden"
    />
  ), [cards, revealCards, dealingComplete, shouldDrawNewSpread, isMobile, floatingCardsComplete]);

  return (
    <ErrorBoundary>
      <div className={`w-full flex flex-col justify-center fixed ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-amber-100 via-blue to-white'} min-h-screen`}>
        <AnimatedGridPattern className="absolute inset-0" color="#00ff00" fill="#000000" positions={positions} isDarkMode={isDarkMode} isMobile={isMobile} isPaused={isStreaming} />
        <div className="relative w-full h-screen overflow-hidden">
          {isLoading ? (
            <p className="text-4xl text-green-600 text-center animate-pulse z-1900">
              {getTranslation('processing')}
            </p>
          ) : error ? (
            <p className="text-4xl text-red-600 text-center z-100">{error}</p>
          ) : null}
          <div className={`flex flex-col items-center ${isMobile ? 'mobile-layout' : ''}`}>
            {memoizedRobot}
            {positions.length > 0 && !isMobile && (
              <div className="relative z-10 w-full flex flex-col items-center">
                <div style={{ position: 'relative', zIndex: 1, marginTop: isMobile ? '10px' : '30px' }}>
                  <section className="relative z-10 mb-16 w-full">
                    <ErrorBoundary>
                      {memoizedFloatingCards}
                    </ErrorBoundary>
                    {memoizedCardReveal}
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <PastDrawsModal 
        isOpen={isPastDrawsModalOpen} 
        onClose={() => setIsPastDrawsModalOpen(false)} 
      />
    </ErrorBoundary>
  );
});

export default ThreeCardSpread;