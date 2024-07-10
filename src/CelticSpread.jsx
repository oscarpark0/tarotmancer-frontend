import React, { useState, useRef, useCallback, useMemo } from 'react';
import AnimatedGridPattern from './components/AnimatedGridPattern.tsx';
import CardReveal from './components/CardReveal';
import FloatingCards from './components/FloatingCards';
import Robot from './components/Robot';
import { API_BASE_URL } from './utils/config.tsx';
import { generateCelticCrossPositions } from './utils/cardPositions.js';
import ErrorBoundary from './components/ErrorBoundary'; 
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";


const CelticSpread = React.memo(({ isMobile, onSpreadSelect, selectedSpread, isDarkMode }) => {
  const { getToken, user } = useKindeAuth();
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dealCards, setDealCards] = useState(false);
  const [revealCards, setRevealCards] = useState(false);
  const [revealedCards, setRevealedCards] = useState(0);
  const [dealingComplete, setDealingComplete] = useState(false);
  const [shouldDrawNewSpread, setShouldDrawNewSpread] = useState(false);
  const [mostCommonCards, setMostCommonCards] = useState('');
  const formRef = useRef(null);
  const [cards, setCards] = useState([]);
  const [floatingCardsComplete, setFloatingCardsComplete] = useState(false);
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [monitorOutput, setMonitorOutput] = useState('');

  const handleStreamingStateChange = useCallback((streaming) => {
    setIsStreaming(streaming);
  }, []);

  const handleSubmitInput = useCallback((value) => {
    if (formRef.current) {
      formRef.current.submitInput(value);
    }
  }, []);

  const fetchSpread = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const origin = window.location.origin;

      const headers = {
        'Content-Type': 'application/json',
        'Origin': origin,
        'Authorization': `Bearer ${token}`,
        'User-ID': user?.id,
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
    } catch (error) {
      console.error('Error drawing spread:', error);
      setError('Failed to draw spread. Please check your authentication and try again.');
      setCards([]);
    } finally {
      setIsLoading(false);
      setShouldDrawNewSpread(false);
    }
  }, [getToken, selectedSpread, user]);

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

  const drawSpread = useCallback(() => {
    setDealCards(false);
    setRevealCards(false);
    setDealingComplete(false);
    setShouldDrawNewSpread(true);
    fetchSpread();
  }, [fetchSpread]);

  const handleAnimationStart = useCallback(() => {
    setAnimationStarted(true);
  }, []);

  const handleNewResponse = useCallback((content) => {
    setMonitorOutput(prevOutput => prevOutput + content);
    setIsStreaming(true);
  }, []);

  const handleResponseComplete = useCallback(() => {
    setIsStreaming(false);
  }, []);

  const memoizedRobot = useMemo(() => (
    <Robot
      dealCards={dealCards}
      cardPositions={positions}
      revealedCards={revealedCards}
      finalCardPositions={positions.map(pos => ({ left: pos.left, top: pos.top }))}
      onExitComplete={handleExitComplete}
      revealCards={revealCards}
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
      fetchSpread={fetchSpread}
      onNewResponse={handleNewResponse}
      onResponseComplete={handleResponseComplete}
      animationsComplete={animationsComplete}
      isDarkMode={isDarkMode}
      onAnimationStart={handleAnimationStart}
      onStreamingStateChange={handleStreamingStateChange}
      isStreaming={isStreaming}
      monitorOutput={monitorOutput}
    />
  ), [dealCards, positions, revealedCards, handleExitComplete, revealCards, shouldDrawNewSpread, handleMonitorOutput, drawSpread, handleDealingComplete, mostCommonCards, handleSubmitInput, isMobile, cards, selectedSpread, onSpreadSelect, fetchSpread, animationsComplete, isDarkMode, handleAnimationStart, handleStreamingStateChange, isStreaming, handleNewResponse, handleResponseComplete, monitorOutput]);

  const memoizedFloatingCards = useMemo(() => (
    <FloatingCards
      dealCards={dealCards}
      monitorPosition={{ width: window.innerWidth, height: window.innerHeight }}
      finalCardPositions={positions.map(pos => ({ left: pos.left, top: pos.top }))}
      onExitComplete={handleExitComplete}
      revealCards={revealCards}
      dealingComplete={handleDealingComplete}
      shouldDrawNewSpread={shouldDrawNewSpread}
      numCards={10}
      isMobile={isMobile}
      cards={cards}
      onAnimationStart={handleAnimationStart}
    />
  ), [dealCards, positions, handleExitComplete, revealCards, handleDealingComplete, shouldDrawNewSpread, isMobile, cards, handleAnimationStart]);

  const memoizedCardReveal = useMemo(() => (
    <CardReveal
      cards={cards}
      revealCards={revealCards && floatingCardsComplete}
      dealingComplete={dealingComplete}
      shouldDrawNewSpread={shouldDrawNewSpread}
      isMobile={isMobile}
      className=""
      animationStarted={animationStarted}
    />
  ), [cards, revealCards, dealingComplete, shouldDrawNewSpread, isMobile, animationStarted, floatingCardsComplete]);

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
            <p className="text-2xl text-green-600 text-center animate-pulse z-99900">Shuffling the cards...</p>
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
    </ErrorBoundary>
  );
});

export default CelticSpread;