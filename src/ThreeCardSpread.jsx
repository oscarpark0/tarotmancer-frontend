import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MagicContainer } from "./components/magic-card";
import AnimatedGridPattern from './components/AnimatedGridPattern';
import CardReveal from './components/CardReveal';
import FloatingCards from './components/FloatingCards';
import Robot from './components/Robot';
import { API_BASE_URL } from './utils/config';
import { generateThreeCardPositions } from './utils/cardPositions.js';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth0 } from '@auth0/auth0-react';

const ThreeCardSpread = ({ onSpreadSelect, selectedSpread, isMobile }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dealCards, setDealCards] = useState(false);
  const [revealCards, setRevealCards] = useState(false);
  const [revealedCards, setRevealedCards] = useState(0);
  const [dealingComplete, setDealingComplete] = useState(false);
  const [shouldDrawNewSpread, setShouldDrawNewSpread] = useState(false);
  const [mostCommonCards, setMostCommonCards] = useState('');
  const [cards, setCards] = useState([]); // Initialize cards as an empty array
  const formRef = useRef(null);
  const [shouldDrawSpread, setShouldDrawSpread] = useState(false);

  const fetchThreeCardSpread = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const origin = window.location.origin;

      const headers = {
        'Content-Type': 'application/json',
        'Origin': origin,
        'Authorization': `Bearer ${token}`
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
      const positions = generateThreeCardPositions(data.positions.length, windowWidth, windowHeight);
      setPositions(positions.map((pos, index) => ({
        ...data.positions[index],
        left: pos.left,
        top: pos.top,
        tooltip: data.positions[index].position_name
      })));
      const newCards = positions.map(pos => ({
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

    } catch (error) {
      console.error("Error drawing Three Card spread:", error);
      setError("Failed to draw Three Card spread. Please check your authentication and try again.");
      setCards([]); // Reset cards to an empty array in case of error
    } finally {
      setIsLoading(false);
      setShouldDrawNewSpread(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (selectedSpread === 'threeCard' && shouldDrawSpread) {
      fetchThreeCardSpread();
      setShouldDrawSpread(false);
    }
  }, [fetchThreeCardSpread, selectedSpread, shouldDrawSpread]);

  const handleExitComplete = useCallback(() => {
    setRevealCards(true);
    setTimeout(() => setDealingComplete(true), 500);
  }, []);

  const handleMonitorOutput = useCallback((output) => {
  }, []);

  const handleSubmitInput = (value) => {
    if (formRef.current) {
      formRef.current.submitInput(value);
    }
  };

  const handleDrawSpread = () => {
    setDealCards(false);
    setRevealCards(false);
    setDealingComplete(false);
    setShouldDrawNewSpread(true);
    setShouldDrawSpread(true);
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
          <div className={`flex flex-col items-center ${isMobile ? 'mobile-layout' : ''}`}>
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
              dealingComplete={dealingComplete}
              mostCommonCards={mostCommonCards}
              formRef={formRef}
              onSubmitInput={handleSubmitInput}
              onSpreadSelect={onSpreadSelect}
              selectedSpread={selectedSpread}
              isMobile={isMobile}
              cards={cards} // This will now always be defined, even if it's an empty array
            />
            {positions.length > 0 && (
              <div className="relative z-10 w-full flex flex-col items-center">
                <div style={{ position: 'relative', zIndex: 1, marginTop: isMobile ? '10px' : '30px' }}>
                  <section className="relative z-10 mb-16 w-full">
                    <ErrorBoundary>
                      <FloatingCards
                        dealCards={dealCards}
                        monitorPosition={{ width: window.screen.width, height: window.screen.height }}
                        finalCardPositions={positions.map(pos => ({ left: pos.left, top: pos.top }))}
                        onExitComplete={handleExitComplete}
                        revealCards={revealCards}
                        dealingComplete={dealingComplete}
                        shouldDrawNewSpread={shouldDrawNewSpread}
                        cards={positions.map(pos => ({
                          name: pos.most_common_card,
                          img: pos.most_common_card_img,
                          orientation: pos.orientation,
                          position_name: pos.position_name,
                          tooltip: pos.position_name
                        }))}
                      />
                    </ErrorBoundary>
                    <CardReveal
                      cards={positions.map(pos => ({
                        name: pos.most_common_card,
                        img: pos.most_common_card_img,
                        orientation: pos.orientation,
                        position_name: pos.position_name,
                        tooltip: pos.position_name
                      }))}
                      revealCards={revealCards}
                      dealingComplete={dealingComplete}
                      shouldDrawNewSpread={shouldDrawNewSpread}
                      isMobile={isMobile}
                      className="md:hidden"
                    />
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </MagicContainer>
  );
};

export default ThreeCardSpread;
