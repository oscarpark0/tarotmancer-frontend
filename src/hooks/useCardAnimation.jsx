
import { useState, useEffect, useCallback } from 'react';

const useCardAnimation = (numCards, dealCards, revealCards) => {
  const [revealedCards, setRevealedCards] = useState(0);
  const [floatingCardsRemoved, setFloatingCardsRemoved] = useState(0);
  const [isDealing, setIsDealing] = useState(false);
  const [shouldDrawNewSpread, setShouldDrawNewSpread] = useState(false);

  useEffect(() => {
    console.log('dealCards in useCardAnimation:', dealCards);
    if (dealCards) {
      setIsDealing(true);
    }
  }, [dealCards]);

  useEffect(() => {
    console.log('revealCards in useCardAnimation:', revealCards);
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

  return { revealedCards, floatingCardsRemoved, isDealing, resetAnimation, setShouldDrawNewSpread };
};

export default useCardAnimation;
