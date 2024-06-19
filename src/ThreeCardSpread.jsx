import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MagicContainer } from "./components/magic-card";
import AnimatedGridPattern from './components/AnimatedGridPattern';
import CardReveal from './components/CardReveal';
import FloatingCards from './components/FloatingCards';
import Robot from './components/Robot';
import { API_BASE_URL } from './utils/config';
import { generateCardPositions } from './utils/cardPositions.js';
import ErrorBoundary from './components/ErrorBoundary';
import useCardAnimation from './hooks/useCardAnimation';

const ThreeCardSpread = () => {
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
  const { floatingCardsRemoved, isDealing, resetAnimation } = useCardAnimation(3, dealCards, revealCards, shouldDrawNewSpread);

  useEffect(() => {
    if (dealCards) {
      resetAnimation();
    }
  }, [dealCards, resetAnimation]);

  const handleExitComplete = useCallback(() => {
    setRevealCards(true);
    setTimeout(() => setDealingComplete(true), 500);
  }, []);

  const handleMonitorOutput = useCallback((output) => {
    // Handle monitor output if needed
  }, []);

  const fetchThreeCardSpread = async () => {
    setIsLoading(true);
    try {
      const origin = window.location.origin;

      const headers = {
        'Content-Type': 'application/json',
        'Origin': origin,
      };

      const response = await fetch(`${API_BASE_URL}/draw_three_card_spread`, {
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
      const positions = generateCardPositions(data.positions.length, windowWidth, windowHeight);
      setPositions(positions.map((pos, index) => ({
        ...data.positions[index],
        left: pos.left,
        top: pos.top,
        tooltip: data.positions[index].position_name
      })));

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

    } catch (error) {
      console.error("Error drawing Three Card spread:", error);
      setError("Failed to draw Three Card spread. Please check your network connection and try again.");
    } finally {
      setIsLoading(false);
      setShouldDrawNewSpread(false);
    }
  };

  const drawSpread = () => {
    setDealCards(false);
    setRevealCards(false);
    setDealingComplete(false);
    setShouldDrawNewSpread(true);
    fetchThreeCardSpread();
  };

  const handleSubmitInput = (value) => {
    if (formRef.current) {
      formRef.current.submitInput(value);
    }
  };

  return (
    <MagicContainer className="w-full flex flex-col justify-center fixed bg-gradient-to-br from-amber-100 via-blue to-white min-h-screen">
      <AnimatedGridPattern className="absolute inset-0" color="#00ff00" fill="#000000" positions={positions} />
      <div className="relative w-full h-screen overflow-hidden">
        {isLoading ? (
          <p className="text-4xl text-green-600 text-center animate-pulse z-1900">Shuffling the cards...</p>
        ) : error ? (
          <p className="text-4xl text-red-600 text-center z-100">{error}</p>
        ) : null}
        <div className="flex flex-col items-center">
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
          />
        </div>
        {positions.length > 0 && (
          <div className="relative z-10 w-full flex flex-col items-center">
            <div style={{ position: 'relative', zIndex: 1, marginTop: '30px' }}>
              <FloatingCards
                positions={positions}
                revealedCards={revealedCards}
                dealingComplete={dealingComplete}
                cardPositions={positions.map(pos => ({ left: pos.left, top: pos.top }))}
              />
              <ErrorBoundary>
                <CardReveal
                  positions={positions}
                  revealedCards={revealedCards}
                  dealingComplete={dealingComplete}
                  cardPositions={positions.map(pos => ({ left: pos.left, top: pos.top }))}
                />
              </ErrorBoundary>
            </div>
          </div>
        )}
      </div>
    </MagicContainer>
  );
};

export default ThreeCardSpread;
