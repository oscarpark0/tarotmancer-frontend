import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import AnimatedGridPattern from './components/AnimatedGridPattern';
import CardReveal from './components/CardReveal';
import FloatingCards from './components/FloatingCards';
import Robot from './components/Robot';
import { API_BASE_URL } from './utils/config';
import { generateCelticCrossPositions } from './utils/cardPositions.js';
import ErrorBoundary from './components/ErrorBoundary'; 
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const CelticSpread = React.memo(({ isMobile, onSpreadSelect, selectedSpread, drawCount, incrementDrawCount, setDrawCount, setLastResetTime }) => {
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
  const [shouldDrawSpread, setShouldDrawSpread] = useState(false);
  const [cards, setCards] = useState([]);

  const handleSubmitInput = useCallback((value) => {
    if (formRef.current) {
      formRef.current.submitInput(value);
    }
  }, []);

  const fetchSpread = useCallback(async () => {
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
        'User-ID': user?.id || 'anonymous'
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

      // Handle rate limit headers
      const remainingDraws = response.headers.get('X-RateLimit-Remaining');
      const resetTime = response.headers.get('X-RateLimit-Reset');
      
      console.log('Received headers - Remaining draws:', remainingDraws, 'Reset time:', resetTime);

      // Ensure we're working with numbers
      const remainingDrawsNum = parseInt(remainingDraws, 100);
      if (!isNaN(remainingDrawsNum)) {
        console.log('Setting drawCount to:', 100 - remainingDrawsNum);
        setDrawCount(10 - remainingDrawsNum);
      } else {
        console.warn('Invalid remaining draws value:', remainingDraws);
      }

      const resetTimeNum = parseInt(resetTime, 100);
      if (!isNaN(resetTimeNum)) {
        setLastResetTime(resetTimeNum * 1000);
      }

      setTimeout(() => {
        setRevealCards(true);
        setRevealedCards(data.positions.length);
        setTimeout(() => {
          setDealingComplete(true);
          handleSubmitInput(formattedMostCommonCards);
        }, 750);
      }, 1100);

      incrementDrawCount();
    } catch (error) {
      console.error('Error drawing spread:', error);
      setError('Failed to draw spread. Please check your authentication and try again.');
      setCards([]);
    } finally {
      setIsLoading(false);
      setShouldDrawNewSpread(false);
    }
  }, [getToken, selectedSpread, handleSubmitInput, drawCount, incrementDrawCount, setDrawCount, setLastResetTime, user]);

  useEffect(() => {
    if (shouldDrawSpread) {
      fetchSpread();
      setShouldDrawSpread(false);
    }
  }, [fetchSpread, shouldDrawSpread]);

  const handleExitComplete = useCallback(() => {
    setRevealCards(true);
    setTimeout(() => setDealingComplete(true), 500);
  }, []);

  const handleMonitorOutput = useCallback(() => {}, []);

  const drawSpread = useCallback(() => {
    setDealCards(false);
    setRevealCards(false);
    setDealingComplete(false);
    setShouldDrawNewSpread(true);
    fetchSpread();
  }, [fetchSpread]);

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
      dealingComplete={dealingComplete}
      mostCommonCards={mostCommonCards}
      formRef={formRef}
      onSubmitInput={handleSubmitInput}
      isMobile={isMobile}
      cards={cards}
      selectedSpread={selectedSpread}
      onSpreadSelect={onSpreadSelect}
      drawCount={drawCount}
      fetchSpread={fetchSpread}
      onNewResponse={(response) => {
      }}
      onResponseComplete={() => {
      }}
    />
  ), [dealCards, positions, revealedCards, handleExitComplete, revealCards, shouldDrawNewSpread, handleMonitorOutput, drawSpread, dealingComplete, mostCommonCards, handleSubmitInput, isMobile, cards, selectedSpread, onSpreadSelect, drawCount, fetchSpread]);

  const memoizedFloatingCards = useMemo(() => (
    <FloatingCards
      dealCards={dealCards}
      monitorPosition={{ width: window.innerWidth, height: window.innerHeight }}
      finalCardPositions={positions.map(pos => ({ left: pos.left, top: pos.top }))}
      onExitComplete={handleExitComplete}
      revealCards={revealCards}
      dealingComplete={dealingComplete}
      shouldDrawNewSpread={shouldDrawNewSpread}
      cards={cards}
    />
  ), [dealCards, positions, handleExitComplete, revealCards, dealingComplete, shouldDrawNewSpread, cards]);

  const memoizedCardReveal = useMemo(() => (
    <CardReveal
      cards={cards}
      revealCards={revealCards}
      dealingComplete={dealingComplete}
      shouldDrawNewSpread={shouldDrawNewSpread}
    />
  ), [cards, revealCards, dealingComplete, shouldDrawNewSpread]);

  return (
    <ErrorBoundary>
      <div className="w-full flex flex-col justify-center fixed bg-gradient-to-br from-amber-100 via-blue to-white min-h-screen">
        <AnimatedGridPattern className="absolute inset-0" color="#00ff00" fill="#000000" positions={positions} />
        <div className="relative w-full h-screen overflow-hidden">
          {isLoading ? (
            <p className="text-4xl text-green-600 text-center animate-pulse z-1900">Shuffling the cards...</p>
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
                  {!isMobile && memoizedCardReveal}
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