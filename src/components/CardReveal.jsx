import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import './CardReveal.css';

const CardReveal = ({ cards, revealCards, dealingComplete, shouldDrawNewSpread, isMobile, className }) => {
  const [revealedCards, setRevealedCards] = useState(0);
  const [flippedCards, setFlippedCards] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  const cardPositions = useMemo(() => {
    const isMobile = window.innerWidth <= 768;
    
    const baseScale = isMobile ? 0.6 : 0.8;
    const centerX = '50%';
    const centerY = '50%';
    
    if (cards.length === 3) {
      // Three Card Spread
      const spacing = isMobile ? '30%' : '20%';
      return [
        { top: centerY, left: `calc(${centerX} - ${spacing})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: centerY, left: centerX, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: centerY, left: `calc(${centerX} + ${spacing})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
      ];
    } else {
      // Celtic Cross Spread
      const crossScale = baseScale * 0.9;
      const stackOffsetX = isMobile ? '35%' : '25%';
      const crossOffsetX = isMobile ? '10%' : '7%';
      const verticalSpacing = isMobile ? '15%' : '20%';
      
      return [
        { top: centerY, left: centerX, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: centerY, left: centerX, transform: `translate(-50%, -50%) rotate(90deg) scale(${crossScale})`, zIndex: 11 },
        { top: `calc(${centerY} - ${verticalSpacing})`, left: centerX, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: `calc(${centerY} + ${verticalSpacing})`, left: centerX, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: centerY, left: `calc(${centerX} - ${crossOffsetX})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: centerY, left: `calc(${centerX} + ${crossOffsetX})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: `calc(${centerY} - ${verticalSpacing})`, left: `calc(${centerX} + ${stackOffsetX})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: centerY, left: `calc(${centerX} + ${stackOffsetX})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: `calc(${centerY} + ${verticalSpacing})`, left: `calc(${centerX} + ${stackOffsetX})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: `calc(${centerY} + ${verticalSpacing} * 2)`, left: `calc(${centerX} + ${stackOffsetX})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
      ];
    }
  }, [cards.length]);

  const getTooltipPosition = (index, totalCards) => {
    if (totalCards === 3) {
      return index === 1 ? 'bottom' : 'top';
    } else {
      // Celtic Cross positioning
      if (index === 0 || index === 1) return 'bottom';
      if (index === 2) return 'left';
      if (index === 3) return 'left';
      if (index === 4) return 'bottom';
      if (index === 5) return 'top';
      return index % 2 === 0 ? 'left' : 'left';
    }
  };

  const handleMouseEnter = (index) => {
    setHoveredCard(index);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

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
          className={`card pointer-events-auto ${card.orientation === 'reversed' ? 'reversed' : ''} ${flippedCards > index ? 'flipped' : ''} ${cards.length > 3 && index === 1 ? 'cross-card' : ''} ${hoveredCard === index ? 'hovered' : ''}`}
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
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          whileHover={{
            scale: 1.1,
            zIndex: 9999,
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
          <AnimatePresence>
            {hoveredCard === index && (
              <motion.div
                className={`card-tooltip ${getTooltipPosition(index, cards.length)} ${isMobile ? 'mobile' : ''}`}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <motion.h3 
                  className="tooltip-title"
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  {card.name}
                </motion.h3>
                <motion.p 
                  className="tooltip-position"
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                >
                  {card.position}
                </motion.p>
                <motion.p 
                  className="tooltip-content"
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.2 }}
                >
                  {card.tooltip}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default CardReveal;