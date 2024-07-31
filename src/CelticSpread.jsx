import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import AnimatedGridPattern from './components/AnimatedGridPattern.tsx';
import CardReveal from './components/CardReveal';
import FloatingCards from './components/FloatingCards';
import Robot from './components/Robot';
import { API_BASE_URL } from './utils/config.tsx';
import { generateCelticCrossPositions } from './utils/cardPositions.js';
import ErrorBoundary from './components/ErrorBoundary'; 
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import PastDrawsModal from './components/PastDrawsModal';
import { useLanguage } from './contexts/LanguageContext';
import { useTranslation } from './utils/translations';
import PropTypes from 'prop-types';
import { IKImage } from 'imagekitio-react';

const CelticSpread = React.memo(({ isMobile, onSpreadSelect, selectedSpread, isDarkMode, canDraw, timeUntilNextDraw, getToken, onDraw, lastDrawTime, remainingDrawsToday, drawCount, setDrawCount }) => {
  const { user } = useKindeAuth();
  const { selectedLanguage } = useLanguage();
  const { getTranslation } = useTranslation();

  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dealCards, setDealCards] = useState(false);
  const [revealedCards, setRevealedCards] = useState(0);
  const [dealingComplete, setDealingComplete] = useState(false);
  const [shouldDrawNewSpread, setShouldDrawNewSpread] = useState(false);
  const [mostCommonCards, setMostCommonCards] = useState('');
  const formRef = useRef(null);
  const [cards, setCards] = useState([]);
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentDrawId, setCurrentDrawId] = useState(null);
  const [isPastDrawsModalOpen, setIsPastDrawsModalOpen] = useState(false);

  const handleRevealCards = useCallback(() => {
    setRevealedCards(prevCards => cards.length);
  }, [cards.length]);

  useEffect(() => {
    console.log('CelticSpread.jsx - remainingDrawsToday:', remainingDrawsToday);
  }, [remainingDrawsToday]);

  useEffect(() => {
    console.log('CelticSpread.jsx - canDraw changed:', canDraw);
  }, [canDraw]);

  useEffect(() => {
    console.log('CelticSpread.jsx - drawCount:', drawCount);
  }, [drawCount]);

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
    setIsLoading(true);
    try {
      const token = await getToken();
      const origin = window.location.origin;

      const headers = {
        'Content-Type': 'application/json',
        'Origin': origin,
        'Authorization': `Bearer ${token}`,
        'User-ID': user.id,
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
      if (typeof drawId === 'undefined') {
        console.warn('Draw ID not found in the response data');
        // Handle the error case appropriately
      }
      setCurrentDrawId(drawId);
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const positions = generateCelticCrossPositions(data.positions.length, windowWidth, windowHeight);
      
      const newPositions = positions.map((pos, index) => ({
        ...data.positions[index],
        left: pos.left,
        top: pos.top,
        tooltip: data.positions[index].position_name
      }));
      
      setPositions(newPositions);
      const newCards = newPositions.map(pos => ({
        name: pos.most_common_card,
        img: pos.most_common_card_img,
        orientation: pos.orientation,
        position_name: pos.position_name,
        tooltip: pos.position_name
      }));
      setCards(newCards);

      const formattedMostCommonCards = data.positions.map(
        (pos) => `Most common card at ${pos.position_name}: ${pos.most_common_card} - Orientation: ${pos.orientation}`
      ).join('\n');
      setDealCards(true); 
      setMostCommonCards(formattedMostCommonCards);
      setDrawCount(prevCount => Math.min(prevCount + 1, 5)); // Update draw count
      onDraw(); // Call onDraw to update the parent component
    } catch (error) {
      console.error('Error drawing spread:', error);
      setError('Failed to draw spread. Please check your authentication and try again.');
      setCards([]);
    } finally {
      setIsLoading(false);
      setShouldDrawNewSpread(false);
    }
  }, [getToken, selectedSpread, user, canDraw, timeUntilNextDraw, setDrawCount, onDraw]);

  const handleDealingComplete = useCallback(() => {
    setDealingComplete(true);
    handleSubmitInput(mostCommonCards);
  }, [handleSubmitInput, mostCommonCards]);

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

  const drawSpread = useCallback(() => {
    if (canDraw) {
      setDealCards(false);
      setDealingComplete(false);
      setShouldDrawNewSpread(true);
      fetchSpread();
    }
  }, [canDraw, fetchSpread]);

  const handleAnimationStart = useCallback(() => {
    setAnimationStarted(true);
  }, []);

  const handleOpenPastDraws = useCallback(() => {
    setIsPastDrawsModalOpen(true);
  }, []);

  const handleNewResponse = useCallback(() => {
    setIsStreaming(true);
  }, []);

  const handleResponseComplete = useCallback(() => {
    setIsStreaming(false);
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
      dealingComplete={dealingComplete}
      mostCommonCards={mostCommonCards}
      formRef={formRef}
      onSubmitInput={handleSubmitInput}
      isMobile={isMobile}
      cards={cards}
      selectedSpread={selectedSpread}
      onSpreadSelect={onSpreadSelect}
      fetchSpread={fetchSpread}
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
      remainingDrawsToday={remainingDrawsToday}
      drawCount={drawCount}
      setDrawCount={setDrawCount}
    />
  ), [dealCards, positions, revealedCards, handleExitComplete, handleRevealCards, shouldDrawNewSpread, handleMonitorOutput, drawSpread, dealingComplete, mostCommonCards, handleSubmitInput, isMobile, cards, selectedSpread, onSpreadSelect, fetchSpread, handleNewResponse, handleResponseComplete, animationsComplete, isDarkMode, handleAnimationStart, handleStreamingStateChange, isStreaming, canDraw, timeUntilNextDraw, currentDrawId, handleOpenPastDraws, onDraw, selectedLanguage, getTranslation, lastDrawTime, remainingDrawsToday, drawCount, setDrawCount]);

  const memoizedFloatingCards = useMemo(() => (
    <FloatingCards
      dealCards={dealCards}
      monitorPosition={{ width: window.innerWidth, height: window.innerHeight }}
      finalCardPositions={positions.map(pos => ({ left: pos.left, top: pos.top }))}
      onExitComplete={handleExitComplete}
      revealCards={handleRevealCards}
      dealingComplete={dealingComplete}
      shouldDrawNewSpread={shouldDrawNewSpread}
      numCards={10}
      isMobile={isMobile}
      cards={cards}
      onAnimationStart={handleAnimationStart}
    />
  ), [dealCards, positions, handleExitComplete, handleRevealCards, dealingComplete, shouldDrawNewSpread, isMobile, cards, handleAnimationStart]);

  const memoizedCardReveal = useMemo(() => (
    <CardReveal
      cards={cards}
      revealCards={revealedCards === cards.length}
      dealingComplete={dealingComplete}
      shouldDrawNewSpread={shouldDrawNewSpread}
      isMobile={isMobile}
      className=""
      animationStarted={animationStarted}
    >
      {cards.map((card, index) => (
        <IKImage
          key={index}
          path={card.img}
          loading="lazy"
          className={`cardImage ${card.orientation === 'reversed' ? 'reversed' : ''}`}
          alt={card.name}
        />
      ))}
    </CardReveal>
  ), [cards, revealedCards, dealingComplete, shouldDrawNewSpread, isMobile, animationStarted]);

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
          {positions.length > 0 && !isMobile && (
            <div className="relative z-10 w-full flex flex-col items-center">
            <div style={{ position: 'relative', zIndex: 1, marginTop: '30px' }}>
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
      <PastDrawsModal 
        isOpen={isPastDrawsModalOpen} 
        onClose={() => setIsPastDrawsModalOpen(false)} 
      />
    </ErrorBoundary>
  );
});

CelticSpread.propTypes = {
  isMobile: PropTypes.bool,
  onSpreadSelect: PropTypes.func,
  selectedSpread: PropTypes.string,
  isDarkMode: PropTypes.bool,
  canDraw: PropTypes.bool,
  timeUntilNextDraw: PropTypes.string,
  getToken: PropTypes.func.isRequired,
  onDraw: PropTypes.func.isRequired,
  lastDrawTime: PropTypes.string,
  remainingDrawsToday: PropTypes.number.isRequired,
  drawCount: PropTypes.number.isRequired,
  setDrawCount: PropTypes.func.isRequired,
};

export default CelticSpread;