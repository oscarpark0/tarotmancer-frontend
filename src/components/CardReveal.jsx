import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import './CardReveal.css';

const CardReveal = ({ cards, revealCards, dealingComplete, shouldDrawNewSpread, isMobile, className }) => {
  const [revealedCards, setRevealedCards] = useState(0);
  const [flippedCards, setFlippedCards] = useState(0);

  const cardPositions = useMemo(() => {
    const containerWidth = window.innerWidth;
    const isMobile = containerWidth <= 768;
    
    const baseScale = isMobile ? 0.015 : 20; // Increased scale for mobile
    const baseLeft = isMobile ? '40%' : '40%'; // Centered horizontally on mobile
    const topOffset = isMobile ? '30%' : '140%'; // Adjusted top position for mobile
    
    if (cards.length === 3) {
      // Three Card Spread
      const threeCardSpacing = isMobile ? '13vw' : '10vw'; // Increased spacing for mobile
      return [
        { top: topOffset, left: `calc(${baseLeft} - ${threeCardSpacing})`, transform: `translate(-40%, -50%) scale(${baseScale})`, zIndex: 2000 },
        { top: topOffset, left: baseLeft, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 2000 },
        { top: topOffset, left: `calc(${baseLeft} + ${threeCardSpacing})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 2000 },
      ];
    } else {
      // Celtic Cross Spread
      const crossCardScale = baseScale * 0.9;
      const celticBaseScale = isMobile ? baseScale * 0.9 : baseScale;
      const celticBaseLeft = isMobile ? '30%' : baseLeft;
      const spacing = isMobile ? '20vw' : '15vw';
      const verticalSpacing = isMobile ? '6vh' : '10.5vh';
      
      return [
        { top: topOffset, left: celticBaseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: topOffset, left: celticBaseLeft, transform: `translate(-50%, -50%) rotate(90deg) scale(${crossCardScale * 0.7})`, zIndex: 12 },
        { top: `calc(${topOffset} - ${verticalSpacing})`, left: celticBaseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} + ${verticalSpacing})`, left: celticBaseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: topOffset, left: `calc(${celticBaseLeft} - 7vw)`, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: topOffset, left: `calc(${celticBaseLeft} + 7vw)`, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} - ${verticalSpacing} * 1.5)`, left: `calc(${celticBaseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} - ${verticalSpacing} * 0.5)`, left: `calc(${celticBaseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} + ${verticalSpacing} * 0.5)`, left: `calc(${celticBaseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} + ${verticalSpacing} * 1.5)`, left: `calc(${celticBaseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
      ];
    }
  }, [cards.length]);

  useEffect(() => {
    let timer;
    if (dealingComplete && (flippedCards < cards.length || revealedCards < cards.length)) {
      if (flippedCards < cards.length) {
        timer = setTimeout(() => {
          setFlippedCards(flippedCards + 1);
        }, 135);
      } else if (revealedCards < cards.length) {
        timer = setTimeout(() => {
          setRevealedCards(revealedCards + 1);
        }, 300);
      }
    }
    return () => clearTimeout(timer);
  }, [revealedCards, flippedCards, cards.length, dealingComplete]);

  useEffect(() => {
    if (shouldDrawNewSpread) {
      setRevealedCards(0);
      setFlippedCards(0);
    }
  }, [shouldDrawNewSpread]);

  return (
    <div className={`card-reveal ${className}`}>
      {dealingComplete && cards.map((card, index) => (
        <motion.div
          key={index}
          className={`card pointer-events-auto ${card.orientation === 'reversed' ? 'reversed' : ''} ${flippedCards > index ? 'flipped' : ''} ${cards.length > 3 && index === 1 ? 'cross-card' : ''}`}
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
  );
};

export default CardReveal;
