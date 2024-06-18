import React, { useState, useEffect } from 'react';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import { generateCardPositions } from '../utils/cardPositions';
import { motion } from 'framer-motion';
import useCardAnimation from '../hooks/useCardAnimation';
import './FloatingCards.css';

function FloatingCards({ dealCards, monitorPosition, finalCardPositions, onExitComplete, revealCards, dealingComplete, shouldDrawNewSpread }) {
  const [cardPositions, setCardPositions] = useState(() => generateCardPositions(10, monitorPosition.width, monitorPosition.height));
  const { revealedCards, floatingCardsRemoved, isDealing, resetAnimation } = useCardAnimation(10, dealCards, revealCards, shouldDrawNewSpread);

  useEffect(() => {
    setCardPositions(generateCardPositions(10, monitorPosition.width, monitorPosition.height));
  }, [monitorPosition]);

  useEffect(() => {
    if (shouldDrawNewSpread) {
      resetAnimation();
    }
  }, [shouldDrawNewSpread, resetAnimation]);

  return (
    <div className={`floating-cards ${dealCards ? 'dealing' : ''}`}>
      {!dealingComplete && cardPositions.slice(revealedCards, cardPositions.length - floatingCardsRemoved).map((position, i) => (
        revealedCards <= i && (
          <motion.img
            key={i}
            src={`${TAROT_IMAGE_BASE_URL}/cardback.webp`}
            alt="Tarot Card"
            className={`floating-card card-${i + 1} ${isDealing ? 'fly-out' : ''}`}
            initial={{ 
              opacity: 0, 
              x: monitorPosition.x + monitorPosition.width / 2 - 50, 
              y: monitorPosition.y + monitorPosition.height / 2, 
              zIndex: 10, 
              scale: 0.8,
              rotate: Math.random() * 20 - 10, 
            }}
            animate={{
              x: revealCards ? finalCardPositions[i].left : monitorPosition.x + monitorPosition.width / 1 - 50,
              y: revealCards ? finalCardPositions[i].top : monitorPosition.y + monitorPosition.height / 1,
              opacity: revealCards ? 0 : 1,
              zIndex: revealCards ? 0 : 10,
              scale: revealCards ? 0.5 : 1,
              rotate: 0, 
              transition: { duration: 1.2, delay: i * 0.15, ease: [0.43, 0.13, 0.23, 0.96] },
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 320,
            }}
            style={{
              width: '3vw',
              height: '10vh',
              transform: 'translate(-50%, -50%)',
            }}
            data-tooltip={position.tooltip}
          />
        )
      ))}
    </div>
  );
};

export default FloatingCards;