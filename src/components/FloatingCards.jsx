
import React, { useState, useEffect, useMemo } from 'react';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import { motion } from 'framer-motion';
import useCardAnimation from '../hooks/useCardAnimation';
import './FloatingCards.css';

function FloatingCards({ dealCards, monitorPosition, finalCardPositions, onExitComplete, revealCards, dealingComplete, shouldDrawNewSpread, numCards, isMobile }) {
  const [isAnimating, setIsAnimating] = useState(false);
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
    const baseScale = isMobile ? 0.01 : 0.015; // Reduced scale for smaller cards
    const baseLeft = '-30%';
    const topOffset = '6%'; // Moved up from 50% to 40%
    
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
      const verticalSpacing = isMobile ? '12vh' : '8vh';
      const horizontalSpacing = isMobile ? '14vw' : '4vw';
      const rightColumnSpacing = isMobile ? '25vw' : '11vw';
      
      return [
        { top: topOffset, left: baseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: topOffset, left: baseLeft, transform: `translate(-50%, -50%) rotate(90deg) scale(${crossCardScale * 0.7})` },
        { top: `calc(${topOffset} - ${verticalSpacing})`, left: baseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} + ${verticalSpacing})`, left: baseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: topOffset, left: `calc(${baseLeft} - ${horizontalSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: topOffset, left: `calc(${baseLeft} + ${horizontalSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} - ${verticalSpacing} * 1.5)`, left: `calc(${baseLeft} + ${rightColumnSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} - ${verticalSpacing} * 0.5)`, left: `calc(${baseLeft} + ${rightColumnSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} + ${verticalSpacing} * 0.5)`, left: `calc(${baseLeft} + ${rightColumnSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} + ${verticalSpacing} * 1.5)`, left: `calc(${baseLeft} + ${rightColumnSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
      ];
    }
  }, [numCards]);

  return (
    <div className={`floating-cards ${isAnimating ? 'dealing' : ''} ${isMobile ? 'mobile' : ''}`}>
      {isAnimating && Array.from({ length: numCards || 0 }).map((_, i) => {
        const position = cardPositions[i];
        return (
          <motion.img
            key={i}
            src={`${TAROT_IMAGE_BASE_URL}/cardback.webp`}
            alt="Tarot Card"
            className={`floating-card card-${i + 1}`}
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
              delay: i * 0.1,
              ease: "easeInOut",
            }}
            style={{
              position: 'absolute',
              transform: position.transform,
            }}
            onAnimationComplete={() => {
              if (i === (numCards || 0) - 1) {
                setIsAnimating(false);
                onExitComplete();
              }
            }}
          />
        );
      })}
    </div>
  );
}

export default FloatingCards;
