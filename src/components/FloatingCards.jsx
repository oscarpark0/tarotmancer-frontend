import React, { useState, useEffect } from 'react';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import { motion } from 'framer-motion';
import useCardAnimation from '../hooks/useCardAnimation';
import './FloatingCards.css';

function FloatingCards({ dealCards, monitorPosition, finalCardPositions, onExitComplete, revealCards, dealingComplete, shouldDrawNewSpread, numCards, isMobile }) {
  const [cardPositions, setCardPositions] = useState(finalCardPositions);
  const { isDealing, resetAnimation } = useCardAnimation(numCards, dealCards, revealCards, shouldDrawNewSpread);

  useEffect(() => {
    setCardPositions(finalCardPositions);
  }, [finalCardPositions]);

  useEffect(() => {
    if (shouldDrawNewSpread) {
      resetAnimation();
    }
  }, [shouldDrawNewSpread, resetAnimation]);

  return (
    <div className={`floating-cards ${dealCards ? 'dealing' : ''} ${isMobile ? 'mobile' : ''}`}>
      {!dealingComplete && cardPositions.map((position, i) => (
        <motion.img
          key={i}
          src={`${TAROT_IMAGE_BASE_URL}/cardback.webp`}
          alt="Tarot Card"
          className={`floating-card card-${i + 1} ${isDealing ? 'fly-out' : ''}`}
          initial={{
            opacity: 0,
            x: '50%',
            y: '50%',
            scale: 0.5,
            rotate: Math.random() * 20 - 10,
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: ['50%', '50%', '100%', '150%'],
            y: ['50%', '50%', '50%', '50%'],
            scale: [0.5, 1, 1, 0.5],
            rotate: [Math.random() * 20 - 10, 0, 0, Math.random() * 20 - 10],
          }}
          transition={{
            duration: 3,
            times: [0, 0.2, 0.8, 1],
            delay: i * 0.1,
          }}
          style={{
            position: 'absolute',
            width: isMobile ? 'clamp(30px, 6vw, 60px)' : 'clamp(40px, 8vw, 80px)',
            height: isMobile ? 'clamp(45px, 9vw, 90px)' : 'clamp(60px, 12vw, 120px)',
          }}
          onAnimationComplete={() => {
            if (i === cardPositions.length - 1) {
              onExitComplete();
            }
          }}
        />
      ))}
    </div>
  );
}

export default FloatingCards;
