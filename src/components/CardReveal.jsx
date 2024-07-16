import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import './CardReveal.css';
import { useSpreadContext } from '../contexts/SpreadContext';

const CardReveal = React.memo(({ isMobile, className }) => {
  const {
    cards,
    revealCards,
    dealingComplete,
    shouldDrawNewSpread,
  } = useSpreadContext();

  const [revealedCards, setRevealedCards] = useState(0);
  const [flippedCards, setFlippedCards] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  const cardPositions = useMemo(() => {
    const containerWidth = window.innerWidth;
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
    } else {
      // Celtic Cross Spread
      const crossCardScale = baseScale * 0.9;
      const celticBaseScale = isMobile ? baseScale * 0.8 : baseScale;
      const celticBaseLeft = isMobile ? '30%' : baseLeft;
      const verticalSpacing = isMobile ? '5.9vh' : '12.5vh';
      
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

  const getTooltipPosition = useCallback((index, totalCards) => {
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
  }, []);

  const handleMouseEnter = useCallback((index) => {
    setHoveredCard(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCard(null);
  }, []);

  useEffect(() => {
    let timer;
    if (revealCards && (flippedCards < cards.length || revealedCards < cards.length)) {
      if (flippedCards < cards.length) {
        timer = setTimeout(() => {
          setFlippedCards(prev => prev + 1);
        }, 135);
      } else if (revealedCards < cards.length) {
        timer = setTimeout(() => {
          setRevealedCards(prev => prev + 1);
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
                initial={{ opacity: 0, y: isMobile ? 5 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: isMobile ? 5 : 10 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="tooltip-title">{card.name}</h3>
                <p className="tooltip-position">{card.position}</p>
                <p className="tooltip-content">{card.tooltip}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
});

export default CardReveal;