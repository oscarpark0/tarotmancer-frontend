import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import './CardReveal.css';

const CardReveal = ({ cards = [], revealCards, dealingComplete, shouldDrawNewSpread, isMobile }) => {
  const [revealedCards, setRevealedCards] = useState(0);
  const [flippedCards, setFlippedCards] = useState(0);
  const [isDealing, setIsDealing] = useState(false);
  const [exitAnimation, setExitAnimation] = useState(false);

  const cardPositions = useMemo(() => {
    if (!cards || cards.length === 0) return [];

    if (isMobile) {
      // Adjust positions for mobile, placing cards within the terminal output
      return cards.map((_, index) => ({
        top: `${10 + index * 30}%`,
        left: '50%',
        transform: 'translate(-50%, -50%) scale(0.7)',
        zIndex: 10 + index
      }));
    } else {
      // Existing desktop positions
      const isMobile = window.innerWidth <= 768;
      if (cards.length === 3) {
        return [
          { top: isMobile ? '60%' : '30%', left: isMobile ? '25%' : '33%', transform: 'translate(-50%, -50%) scale(0.7)', zIndex: 10 },
          { top: isMobile ? '60%' : '30%', left: '50%', transform: 'translate(-50%, -50%) scale(0.7)', zIndex: 10 },
          { top: isMobile ? '60%' : '30%', left: isMobile ? '75%' : '67%', transform: 'translate(-50%, -50%) scale(0.7)', zIndex: 10 },
        ];
      } else {
        return [
          { top: isMobile ? '60%' : '30%', left: '45%', transform: 'translate(-50%, -50%) scale(0.5)', zIndex: 10 },
          { top: isMobile ? '60%' : '30%', left: '45%', transform: 'translate(-50%, -50%) rotate(90deg) scale(0.5)', zIndex: 12 },
          { top: isMobile ? '52%' : '11%', left: '45%', transform: 'translate(-50%, -50%) scale(0.5)', zIndex: 10 },
          { top: isMobile ? '68%' : '50%', left: '45%', transform: 'translate(-50%, -50%) scale(0.5)', zIndex: 10 },
          { top: isMobile ? '60%' : '30%', left: '33%', transform: 'translate(-50%, -50%) scale(0.5)', zIndex: 10 },
          { top: isMobile ? '60%' : '30%', left: '57%', transform: 'translate(-50%, -50%) scale(0.5)', zIndex: 10 },
          { top: isMobile ? '50%' : '1%', left: isMobile ? '80%' : '75%', transform: 'translate(-50%, -50%) scale(0.5)', zIndex: 10 },
          { top: isMobile ? '56%' : '21%', left: isMobile ? '80%' : '75%', transform: 'translate(-50%, -50%) scale(0.5)', zIndex: 10 },
          { top: isMobile ? '62%' : '41%', left: isMobile ? '80%' : '75%', transform: 'translate(-50%, -50%) scale(0.5)', zIndex: 10 },
          { top: isMobile ? '68%' : '61%', left: isMobile ? '80%' : '75%', transform: 'translate(-50%, -50%) scale(0.5)', zIndex: 10 },
        ];
      }
    }
  }, [cards, isMobile]);

  useEffect(() => {
    let timer;
    if (dealingComplete && (flippedCards < cards.length || revealedCards < cards.length)) {
      setIsDealing(true);
      if (flippedCards < cards.length) {
        timer = setTimeout(() => {
          setFlippedCards(flippedCards + 1);
        }, 135);
      } else if (revealedCards < cards.length) {
        timer = setTimeout(() => {
          setRevealedCards(revealedCards + 1);
        }, 300);
      }
    } else {
      setIsDealing(false);
    }
    return () => clearTimeout(timer);
  }, [revealedCards, flippedCards, cards.length, dealingComplete]);

  useEffect(() => {
    if (shouldDrawNewSpread) {
      setExitAnimation(true);
      setTimeout(() => {
        setExitAnimation(false);
        setRevealedCards(0);
        setFlippedCards(0);
      }, 1000);
    }
  }, [shouldDrawNewSpread]);

  if (!cards || cards.length === 0) {
    return null; // or return a loading state
  }

  return (
    <div className={`card-reveal-container ${isMobile ? 'mobile' : ''} ${isDealing ? 'dealing' : ''} ${dealingComplete ? 'active' : ''} ${exitAnimation ? 'exit-animation' : ''}`}>
      <div className="card-container">
        {dealingComplete && cards.map((card, index) => (
          <motion.div
            key={index}
            className={`card ${card.orientation === 'reversed' ? 'reversed' : ''} ${flippedCards > index ? 'flipped' : ''} ${cards.length > 3 && index === 1 ? 'cross-card' : ''}`}
            initial={{ opacity: 0, x: -200, y: -1, scale: 1 }}
            animate={{
              opacity: 1,
              x: cardPositions[index].left,
              y: cardPositions[index].top,
              scale: 1,
              zIndex: cardPositions[index].zIndex,
              transition: { duration: 0.5, delay: index * 0.1, ease: 'easeIn', opacity: { duration: 2, ease: 'linear' } }
            }}
            exit={{
              opacity: 0,
              x: cardPositions[index].left,
              y: cardPositions[index].top,
              scale: 0.1,
              zIndex: 1,
              filter: 'blur(5px)',
              transition: { duration: 0.5, delay: index * 0.1, ease: 'easeOut' }
            }}
            style={cardPositions[index]}
            data-tooltip={`${card.tooltip}`} 
            data-name={`${card.name}`} 
          >
            <div className="card-inner">
              <div
                className="card-front"
                style={{
                  backgroundImage: `url(${card.img})`,
                  backgroundSize: 'cover'
                }}
              ></div>
              <div
                className="card-back"
                style={{
                  backgroundImage: `url(${TAROT_IMAGE_BASE_URL}/cardback.webp)`,
                  backgroundSize: 'cover'
                }}
              ></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CardReveal;
