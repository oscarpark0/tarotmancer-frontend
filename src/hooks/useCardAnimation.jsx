import { useState, useEffect, useCallback, useMemo } from 'react';

const useCardAnimation = (numCards, dealCards, revealCards) => {
  const [revealedCards, setRevealedCards] = useState(0);
  const [floatingCardsRemoved, setFloatingCardsRemoved] = useState(0);
  const [isDealing, setIsDealing] = useState(false);
  const [shouldDrawNewSpread, setShouldDrawNewSpread] = useState(false);

  const cardPositions = useMemo(() => {
    const isMobile = window.innerWidth <= 768;
    const baseScale = isMobile ? 0.025 : 0.018; // Increased scale for mobile
    const baseLeft = '50%';
    const topOffset = isMobile ? '60%' : '10%'; // Centered vertically on mobile
    
    if (numCards === 3) {
      // Three Card Spread
      const threeCardSpacing = isMobile ? '25vw' : '10vw'; // Increased spacing for mobile
      return [
        { top: topOffset, left: `calc(${baseLeft} - ${threeCardSpacing})`, transform: `translate(-50%, -50%) scale(${baseScale})` },
        { top: topOffset, left: baseLeft, transform: `translate(-50%, -50%) scale(${baseScale})` },
        { top: topOffset, left: `calc(${baseLeft} + ${threeCardSpacing})`, transform: `translate(-50%, -50%) scale(${baseScale})` },
      ];
    } else {
      // Celtic Cross Spread
      const crossCardScale = baseScale * 0.9;
      const celticBaseScale = isMobile ? baseScale * 0.8 : baseScale;
      const spacing = isMobile ? '30vw' : '10vw'; // Increased spacing for mobile
      const verticalSpacing = isMobile ? '10vh' : '10h'; // Adjusted for mobile
      
      return [
        { top: topOffset, left: baseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: topOffset, left: baseLeft, transform: `translate(-50%, -50%) rotate(90deg) scale(${crossCardScale * 0.7})` },
        { top: `calc(${topOffset} - ${verticalSpacing})`, left: baseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} + ${verticalSpacing})`, left: baseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: topOffset, left: `calc(${baseLeft} - 12vw)`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: topOffset, left: `calc(${baseLeft} + 12vw)`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} - ${verticalSpacing} * 1.5)`, left: `calc(${baseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} - ${verticalSpacing} * 0.5)`, left: `calc(${baseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} + ${verticalSpacing} * 0.5)`, left: `calc(${baseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} + ${verticalSpacing} * 1.5)`, left: `calc(${baseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
      ];
    }
  }, [numCards]);

  useEffect(() => {
    if (dealCards) {
      setIsDealing(true);
    }
  }, [dealCards]);

  useEffect(() => {
    if (revealCards) {
      const interval = setInterval(() => {
        setRevealedCards(prev => prev + 1);
        setFloatingCardsRemoved(prev => prev + 1);
      }, 200);

      return () => clearInterval(interval);
    }
  }, [revealCards]);

  useEffect(() => {
    if (shouldDrawNewSpread) {
      setRevealedCards(0);
      setFloatingCardsRemoved(0);
      setShouldDrawNewSpread(false);
    }
  }, [shouldDrawNewSpread]);

  const resetAnimation = useCallback(() => {
    setRevealedCards(0);
    setFloatingCardsRemoved(0);
    setIsDealing(false);
  }, []);

  return { revealedCards, floatingCardsRemoved, isDealing, resetAnimation, setShouldDrawNewSpread, cardPositions };
};

export default useCardAnimation;
