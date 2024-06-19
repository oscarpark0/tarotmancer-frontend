import { useState, useEffect } from 'react';

const useCardAnimation = (numCards, dealCards, revealCards, shouldDrawNewSpread) => {
  const [revealedCards, setRevealedCards] = useState(0);
  const [floatingCardsRemoved, setFloatingCardsRemoved] = useState(0);
  const [isDealing, setIsDealing] = useState(false);

  useEffect(() => {
    if (dealCards) {
      setIsDealing(true);
    }
  }, [dealCards]);

  useEffect(() => {
    if (revealCards) {
      const interval = setInterval(() => {
        setRevealedCards((prevRevealedCards) => prevRevealedCards + 1);
        setFloatingCardsRemoved((prevFloatingCardsRemoved) => prevFloatingCardsRemoved + 1);
      }, 200);

      return () => clearInterval(interval);
    }
  }, [revealCards]);

  useEffect(() => {
    if (shouldDrawNewSpread) {
      setRevealedCards(0);
      setFloatingCardsRemoved(0);
    }
  }, [shouldDrawNewSpread]);

  const resetAnimation = () => {
    setRevealedCards(0);
    setFloatingCardsRemoved(0);
    setIsDealing(false);
  };

  return { revealedCards, floatingCardsRemoved, isDealing, resetAnimation };
};

export default useCardAnimation;
