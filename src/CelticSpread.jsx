import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import AnimatedGridPattern from './components/AnimatedGridPattern.tsx';
import CardReveal from './components/CardReveal';
import FloatingCards from './components/FloatingCards';
import Robot from './components/Robot';
import { API_BASE_URL } from './utils/config';
import { generateCelticCrossPositions } from './utils/cardPositions.js';
import ErrorBoundary from './components/ErrorBoundary'; 
import { getKindeAccessToken } from './utils/kindeApi';

const CelticSpread = React.memo(({ isMobile, onSpreadSelect, selectedSpread, drawCount, incrementDrawCount, setDrawCount, setLastResetTime, cohereRequestCount, incrementCohereRequestCount, resetCohereRequestCount, lastCohereResetTime, canAccessCohere, setCanAccessCohere }) => {
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

  useEffect(() => {
    const checkCohereAccess = async () => {
      try {
        const accessToken = await getKindeAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/feature-flags/cohere-api-access`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCanAccessCohere(data.value === true);
        } else {
          throw new Error('Failed to check Cohere API access');
        }
      } catch (error) {
        console.error('Error checking Cohere API access:', error);
        setCanAccessCohere(false);
      }
    };
    
    checkCohereAccess();
  }, [setCanAccessCohere]);

  const handleSubmitInput = useCallback((value) => {
    if (formRef.current) {
      formRef.current.submitInput(value);
    }
  }, []);

  const fetchSpread = useCallback(async () => {
    if (!canAccessCohere) {
      setError('You do not have access to this feature.');
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = await getKindeAccessToken();
      const origin = window.location.origin;

      const headers = {
        'Content-Type': 'application/json',
        'Origin': origin,
        'Authorization': `Bearer ${accessToken}`,
      };

      const endpoint = selectedSpread === 'celtic' ? 'draw_celtic_spreads' : 'draw_three_card_spread';
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'GET',
        headers: headers,
      });

      if (response.status === 429) {
        setError('You have reached the maximum number of requests for today. Please try again tomorrow.');
        return;
      }

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
  }, [selectedSpread, handleSubmitInput, incrementDrawCount, canAccessCohere]);

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
          ) : !canAccessCohere ? (
            <p className="text-4xl text-red-600 text-center z-100">You do not have access to this feature.</p>
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