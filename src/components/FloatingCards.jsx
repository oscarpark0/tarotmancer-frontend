import React, { useState, useEffect, useMemo } from 'react';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import { motion } from 'framer-motion';
import useCardAnimation from '../hooks/useCardAnimation';
import './FloatingCards.css';

function FloatingCards({ dealCards, monitorPosition, finalCardPositions, onExitComplete, revealCards, dealingComplete, shouldDrawNewSpread, numCards, isMobile, onAnimationStart }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { resetAnimation } = useCardAnimation(numCards, dealCards, revealCards, shouldDrawNewSpread);

  useEffect(() => {
    if (dealCards) {
      setIsAnimating(true);
      onAnimationStart(); // Call this when the animation starts
    }
  }, [dealCards, onAnimationStart]);

  useEffect(() => {
    if (shouldDrawNewSpread) {
      resetAnimation();
      setIsAnimating(false);
    }
  }, [shouldDrawNewSpread, resetAnimation]);

  const cardPositions = useMemo(() => {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const isMobile = containerWidth <= 768;
    
    const baseScale = isMobile ? 0.12 : 0.02;
    const baseLeft = isMobile ? '80%' : '90%';
    const topOffset = isMobile ? '2%' : '10%';
    
    // New horizontal spacing variables
    const threeCardHorizontalSpacing = isMobile ? '25vw' : '8vw';
    const celticCrossHorizontalSpacing = isMobile ? '15vw' : '4vw';
    const celticStackHorizontalSpacing = isMobile ? '30vw' : '7vw';
    const verticalSpacing = isMobile ? '9vh' : '10vh';
    
    // New variable to move the first 5 cards to the left
    const celticCrossLeftShift = isMobile ? '15vw' : '3vw';
    
    if (numCards === 3) {
      // Three Card Spread
      return [
        { top: topOffset, left: `calc(${baseLeft} - ${threeCardHorizontalSpacing})`, transform: `translate(-50%, -50%) scale(${baseScale})` },
        { top: topOffset, left: baseLeft, transform: `translate(-50%, -50%) scale(${baseScale})` },
        { top: topOffset, left: `calc(${baseLeft} + ${threeCardHorizontalSpacing})`, transform: `translate(-50%, -50%) scale(${baseScale})` },
      ];
    } else if (numCards === 5) {
      // Elemental Insight Spread
      const radius = Math.min(containerWidth, containerHeight) * 0.3;
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;
      
      return [
        { top: `${centerY - radius}px`, left: `${centerX}px`, transform: `translate(-50%, -50%) scale(${baseScale})` },
        { top: `${centerY}px`, left: `${centerX - radius}px`, transform: `translate(-50%, -50%) scale(${baseScale})` },
        { top: `${centerY}px`, left: `${centerX + radius}px`, transform: `translate(-50%, -50%) scale(${baseScale})` },
        { top: `${centerY + radius * 0.866}px`, left: `${centerX - radius * 0.5}px`, transform: `translate(-50%, -50%) scale(${baseScale})` },
        { top: `${centerY + radius * 0.866}px`, left: `${centerX + radius * 0.5}px`, transform: `translate(-50%, -50%) scale(${baseScale})` },
      ];
    } else {
      // Celtic Cross Spread
      const crossCardScale = baseScale * 0.9;
      const celticBaseScale = isMobile ? baseScale * 0.95 : baseScale;
      
      return [
        { top: topOffset, left: `calc(${baseLeft} - ${celticCrossLeftShift})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: topOffset, left: `calc(${baseLeft} - ${celticCrossLeftShift})`, transform: `translate(-50%, -50%) rotate(90deg) scale(${crossCardScale * 0.8})` },
        { top: `calc(${topOffset} - ${verticalSpacing})`, left: `calc(${baseLeft} - ${celticCrossLeftShift})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} + ${verticalSpacing})`, left: `calc(${baseLeft} - ${celticCrossLeftShift})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: topOffset, left: `calc(${baseLeft} - ${celticCrossHorizontalSpacing} - ${celticCrossLeftShift})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: topOffset, left: `calc(${baseLeft} + ${celticCrossHorizontalSpacing} - ${celticCrossLeftShift})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})` },
        { top: `calc(${topOffset} - ${verticalSpacing} * 1.5)`, left: `calc(${baseLeft} + ${celticStackHorizontalSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale * 0.9})` },
        { top: `calc(${topOffset} - ${verticalSpacing} * 0.5)`, left: `calc(${baseLeft} + ${celticStackHorizontalSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale * 0.9})` },
        { top: `calc(${topOffset} + ${verticalSpacing} * 0.5)`, left: `calc(${baseLeft} + ${celticStackHorizontalSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale * 0.9})` },
        { top: `calc(${topOffset} + ${verticalSpacing} * 1.5)`, left: `calc(${baseLeft} + ${celticStackHorizontalSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale * 0.9})` },
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