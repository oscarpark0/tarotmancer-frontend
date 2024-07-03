import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import './CardReveal.css';

const CardReveal = ({ cards, revealCards, dealingComplete, shouldDrawNewSpread, isMobile, className }) => {
  const [revealedCards, setRevealedCards] = useState(0);
  const [flippedCards, setFlippedCards] = useState(0);

  const cardPositions = useMemo(() => {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const isMobile = containerWidth <= 768;
    
    const baseScale = isMobile ? 0.01 : 20; 
    const baseLeft = isMobile ? '50%' : '40%'; 
    const topOffset = isMobile ? '30%' : '140%'; 
    
    // New horizontal spacing variables
    const threeCardHorizontalSpacing = isMobile ? '25vw' : '10vw';
    const celticCrossHorizontalSpacing = isMobile ? '9vw' : '7vw';
    const celticStackHorizontalSpacing = isMobile ? '22vw' : '15vw';
    
    if (cards.length === 3) {
      // Three Card Spread
      return [
        { top: topOffset, left: `calc(${baseLeft} - ${threeCardHorizontalSpacing})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 2000 },
        { top: topOffset, left: baseLeft, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 2000 },
        { top: topOffset, left: `calc(${baseLeft} + ${threeCardHorizontalSpacing})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 2000 },
      ];
    } else if (cards.length === 5) {
      // Elemental Insight Spread
      const radius = Math.min(containerWidth, containerHeight) * 0.3;
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;
      
      return [
        { top: `${centerY - radius}px`, left: `${centerX}px`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: `${centerY}px`, left: `${centerX - radius}px`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: `${centerY}px`, left: `${centerX + radius}px`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: `${centerY + radius * 0.866}px`, left: `${centerX - radius * 0.5}px`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: `${centerY + radius * 0.866}px`, left: `${centerX + radius * 0.5}px`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
      ];
    } else {
      // Celtic Cross Spread
      const crossCardScale = baseScale * 0.9;
      const celticBaseScale = isMobile ? baseScale * 0.8 : baseScale;
      const celticBaseLeft = isMobile ? '30%' : baseLeft;
      const verticalSpacing = isMobile ? '5.9vh' : '10.5vh';
      
      return [
        { top: topOffset, left: celticBaseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: topOffset, left: celticBaseLeft, transform: `translate(-50%, -50%) rotate(90deg) scale(${crossCardScale * 0.7})`, zIndex: 12 },
        { top: `calc(${topOffset} - ${verticalSpacing})`, left: celticBaseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} + ${verticalSpacing})`, left: celticBaseLeft, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: topOffset, left: `calc(${celticBaseLeft} - ${celticCrossHorizontalSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: topOffset, left: `calc(${celticBaseLeft} + ${celticCrossHorizontalSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} - ${verticalSpacing} * 1.5)`, left: `calc(${celticBaseLeft} + ${celticStackHorizontalSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} - ${verticalSpacing} * 0.5)`, left: `calc(${celticBaseLeft} + ${celticStackHorizontalSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} + ${verticalSpacing} * 0.5)`, left: `calc(${celticBaseLeft} + ${celticStackHorizontalSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} + ${verticalSpacing} * 1.5)`, left: `calc(${celticBaseLeft} + ${celticStackHorizontalSpacing})`, transform: `translate(-50%, -50%) scale(${celticBaseScale})`, zIndex: 10 },
      ];
    }
  }, [cards.length]);

  useEffect(() => {
    let timer;
    if (revealCards && (flippedCards < cards.length || revealedCards < cards.length)) {
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
  }, [revealedCards, flippedCards, cards.length, revealCards]);

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
            transition: { duration: 0.5, delay: index * 0.1, ease: 'easeOut' }
          }}
          style={cardPositions[index]}
          data-tooltip={`${card.tooltip}`} 
          data-name={`${card.name}`} 
          whileHover={{
            zIndex: cards.length > 3 && index === 0 ? 15 : cardPositions[index].zIndex,
            scale: 1.1,
            transition: { duration: 0.2 }
          }}
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
