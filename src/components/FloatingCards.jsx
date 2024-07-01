import React, { useState, useEffect } from 'react';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import { motion, AnimatePresence } from 'framer-motion';
import useCardAnimation from '../hooks/useCardAnimation';
import './FloatingCards.css';

function FloatingCards({ dealCards, monitorPosition, finalCardPositions, onExitComplete, revealCards, dealingComplete, shouldDrawNewSpread, numCards, isMobile, cards }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { resetAnimation, cardPositions } = useCardAnimation(numCards, dealCards, revealCards, shouldDrawNewSpread);

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

  return (
    <AnimatePresence onExitComplete={() => {
      onExitComplete();
      setIsAnimating(false);
    }}>
      {isAnimating && (
        <div className={`floating-cards ${isAnimating ? 'dealing' : ''} ${isMobile ? 'mobile' : ''}`}>
          {Array.from({ length: numCards || 0 }).map((_, i) => {
            const position = cardPositions[i];
            return (
              <motion.img
                key={i}
                src={`${TAROT_IMAGE_BASE_URL}/cardback.webp`}
                alt="Tarot Card"
                className={`floating-card card-${i + 1}`}
                initial={{
                  opacity: 0,
                  x: 0,
                  y: 0,
                  scale: 0.2,
                  rotate: 0,
                }}
                animate={{
                  opacity: [0, .9, 1],
                  x: position.left,
                  y: position.top,
                  scale: 1,
                  rotate: position.transform.includes('rotate') ? 90 : [0, 45, 0],
                }}
                exit={{
                  opacity: 0,
                  scale: 0.2,
                  transition: { duration: 0.5, delay: i * 0.1 }
                }}
                transition={{
                  duration: 2,
                  times: [0, 0.6, 1],
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
                style={{
                  position: 'absolute',
                  transform: position.transform,
                  zIndex: 1,
                }}
                onAnimationComplete={() => {
                  if (i === (numCards || 0) - 1) {
                    setIsAnimating(false);
                    dealingComplete();
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

export default FloatingCards;
