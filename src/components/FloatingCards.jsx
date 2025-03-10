import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IKImage } from 'imagekitio-react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import useCardAnimation from '../hooks/useCardAnimation';
import './FloatingCards.css';

function FloatingCards({ dealCards, onExitComplete, revealCards, shouldDrawNewSpread, numCards, isMobile, onAnimationStart, onAnimationComplete = () => {} }) {
  // Set a default empty function for onAnimationComplete if it's not provided
  const [isAnimating, setIsAnimating] = useState(false);
  // Create a counter ref instead of state to track animated cards
  const cardsAnimatedRef = useRef(0);
  const { resetAnimation } = useCardAnimation(numCards, dealCards, revealCards, shouldDrawNewSpread);

  useEffect(() => {
    if (dealCards) {
      setIsAnimating(true);
      onAnimationStart();
    } else {
      setIsAnimating(false);
    }
  }, [dealCards, onAnimationStart]);

  useEffect(() => {
    if (shouldDrawNewSpread) {
      resetAnimation();
      setIsAnimating(false);
      cardsAnimatedRef.current = 0; // Reset card animation counter
    }
  }, [shouldDrawNewSpread, resetAnimation]);

  const cardPositions = useMemo(() => {
    // Adjusted scaling to ensure cards aren't cut off
    const baseScale = isMobile ? 0.01 : 0.015;
    const baseLeft = '-30%';
    const topOffset = '10%'; // Increased from 6% to allow more space for cards
    
    if (numCards === 3) {
      // Three Card Spread
      const threeCardSpacing = isMobile ? '8vw' : '6vw';
      return [
        { top: topOffset, left: `calc(${baseLeft} - ${threeCardSpacing} + 2vw)`, transform: `translate(-50%, -50%) scale(${baseScale})` },
        { top: topOffset, left: `calc(${baseLeft} + 2vw)`, transform: `translate(-50%, -50%) scale(${baseScale})` },
        { top: topOffset, left: `calc(${baseLeft} + ${threeCardSpacing} + 2vw)`, transform: `translate(-50%, -50%) scale(${baseScale})` },
      ];
    } else {
      const crossCardScale = baseScale * 0.9;
      const celticBaseScale = isMobile ? baseScale * 0.9 : baseScale;
      const verticalSpacing = isMobile ? '13vh' : '9vh'; // Increased from 12vh/8vh
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
  }, [numCards, isMobile]);

  return (
    <div className={`floating-cards ${isAnimating ? 'dealing' : ''} ${isMobile ? 'mobile' : ''}`}>
      {isAnimating && Array.from({ length: numCards }).map((_, i) => {
        const position = cardPositions[i];
        return (
          <motion.div
            key={i}
            className={`floating-card card-${i + 1}`}
            initial={{
              opacity: 0,
              x: '0%', // Start from the center of the robot
              y: '0%', // Start from the center of the robot
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
              duration: 2.5,
              times: [0, 0.3, 1],
              delay: i * 0.15, // Slightly longer delay between cards
              ease: "easeOut",
            }}
            style={{
              position: 'absolute',
              transform: position.transform,
            }}
            onAnimationComplete={() => {
              // Track each card animation completion using ref
              cardsAnimatedRef.current += 1;
              
              // When all cards have been animated, trigger the next step
              if (cardsAnimatedRef.current >= numCards) {
                setTimeout(() => {
                  setIsAnimating(false);
                  onExitComplete();
                  onAnimationComplete(true); // Pass true for last card
                  // Reset counter for next animation cycle
                  cardsAnimatedRef.current = 0;
                }, 300);
              }
            }}
          >
            <IKImage
              path="cardback.webp"
              loading="lazy"
              alt="Tarot card back"
              className="floating-card-image"
              urlEndpoint="https://ik.imagekit.io/tarotmancer"
            />
          </motion.div>
        );
      })}
    </div>
  );
}

FloatingCards.propTypes = {
  dealCards: PropTypes.bool,
  onExitComplete: PropTypes.func,
  revealCards: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  shouldDrawNewSpread: PropTypes.bool,
  numCards: PropTypes.number,
  isMobile: PropTypes.bool,
  cards: PropTypes.array,
  onAnimationStart: PropTypes.func,
  onAnimationComplete: PropTypes.func,
};

export default FloatingCards;