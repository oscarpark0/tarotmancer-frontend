import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import { motion } from 'framer-motion';
import useCardAnimation from '../hooks/useCardAnimation';
import './FloatingCards.css';
import { useSpreadContext } from '../contexts/SpreadContext';

function FloatingCards({ monitorPosition, isMobile }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const {
    dealCards,
    onExitComplete,
    revealCards,
    shouldDrawNewSpread,
    cards,
  } = useSpreadContext();

  const numCards = cards.length;
  const { resetAnimation } = useCardAnimation(numCards, dealCards, revealCards, shouldDrawNewSpread);

  useEffect(() => {
    if (dealCards) {
      setIsAnimating(true);
    }
  }, [dealCards]);

  useEffect(() => {
    if (shouldDrawNewSpread) {
      resetAnimation();
      setIsAnimating(false);
    }
  }, [shouldDrawNewSpread, resetAnimation]);

  const cardPositions = useMemo(() => {
    const isMobile = window.innerWidth <= 768;
    const baseScale = isMobile ? 0.01 : 0.015;
    const baseLeft = '-50%';
    const topOffset = '6%';

    if (numCards === 3) {
      // Three Card Spread
      const threeCardSpacing = isMobile ? '8vw' : '6vw';
      return [
        { top: topOffset, left: `calc(${baseLeft} - ${threeCardSpacing} + 2vw)`, transform: `translate(-50%, -50%) scale(${baseScale})` },
        { top: topOffset, left: `calc(${baseLeft} + 2vw)`, transform: `translate(-50%, -50%) scale(${baseScale})` },
        { top: topOffset, left: `calc(${baseLeft} + ${threeCardSpacing} + 2vw)`, transform: `translate(-50%, -50%) scale(${baseScale})` },
      ];
    } else {
      // Celtic Cross Spread
      const crossCardScale = baseScale * 0.9;
      const celticBaseScale = isMobile ? baseScale * 0.9 : baseScale;
      const spacing = isMobile ? '12vw' : '9vw';
      const verticalSpacing = isMobile ? '8vh' : '12vh';

      return [
        { top: topOffset, left: baseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: topOffset, left: baseLeft, transform: `translate(-50%, -50%) rotate(90deg) scale(${crossCardScale * 0.7})` },
        { top: `calc(${topOffset} - ${verticalSpacing})`, left: baseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} + ${verticalSpacing})`, left: baseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: topOffset, left: `calc(${baseLeft} - 4vw)`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: topOffset, left: `calc(${baseLeft} + 4vw)`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} - ${verticalSpacing} * 1.5)`, left: `calc(${baseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} - ${verticalSpacing} * 0.5)`, left: `calc(${baseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} + ${verticalSpacing} * 0.5)`, left: `calc(${baseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} + ${verticalSpacing} * 1.5)`, left: `calc(${baseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
      ];
    }
  }, [numCards]);

  const handleAnimationComplete = useCallback((index) => {
    if (index === numCards - 1) {
      setIsAnimating(false);
      if (typeof onExitComplete === 'function') {
        onExitComplete();
      } else {
        console.error('onExitComplete is not a function');
      }
    }
  }, [numCards, onExitComplete]);

  function animationCompleteHandler(index) {
    try {
      handleAnimationComplete(index);
    } catch (error) {
      console.error('Error in handleAnimationComplete:', error);
    }
  }

  if (typeof onExitComplete !== 'function') {
    console.error('onExitComplete is not a function');
    return null; // or some fallback UI
  }

  return (
    <div className={`floating-cards ${isAnimating ? 'dealing' : ''} ${isMobile ? 'mobile' : ''}`}>
      {isAnimating && cardPositions && Array.from({ length: numCards }).map((_, index) => {
        const position = cardPositions[index];
        if (!position) {
          console.error(`No position found for index ${index}`);
          return null;
        }
        return (
          <motion.img
            key={index}
            src={`${TAROT_IMAGE_BASE_URL}/cardback.webp`}
            alt="Tarot Card"
            className={`floating-card card-${index + 1}`}
            initial={{
              opacity: 0,
              x: '50%',
              y: '50%',
              scale: 0.2,
              rotate: 0,
            }}
            animate={{
              opacity: [0, 1, 1],
              x: position.left,
              y: position.top,
              scale: 1,
              rotate: position.transform.includes('rotate') ? 90 : 0,
            }}
            transition={{
              duration: 2,
              times: [0, 0.5, 1],
              delay: index * 0.1,
              ease: "easeInOut",
            }}
            style={{
              position: 'absolute',
              transform: position.transform,
            }}
            onAnimationComplete={() => animationCompleteHandler(index)}
          />
        );
      })}
    </div>
  );
}

export default React.memo(FloatingCards);