import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IKImage } from 'imagekitio-react';
import './CardReveal.css';

const CardReveal = ({ cards, revealCards, dealingComplete, shouldDrawNewSpread, isMobile, className }) => {
  const [revealedCards, setRevealedCards] = useState(0);
  const [flippedCards, setFlippedCards] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  const cardPositions = useMemo(() => {
    const containerWidth = window.innerWidth;
    const isMobile = containerWidth <= 768;

    const baseScale = isMobile ? 0.8 : 1; // Adjust scale for mobile
    const baseLeft = isMobile ? '50%' : '40%';
    const topOffset = isMobile ? '15%' : '50%'; // Adjust top offset for mobile

    // Adjust spacing for mobile
    const threeCardHorizontalSpacing = isMobile ? '20vw' : '8vw';
    const celticCrossHorizontalSpacing = isMobile ? '7vw' : '5vw';
    const celticStackHorizontalSpacing = isMobile ? '18vw' : '12vw';

    if (cards.length === 3) {
      // Three Card Spread
      return [
        { top: topOffset, left: `calc(${baseLeft} - ${threeCardHorizontalSpacing})`, zIndex: 2000 },
        { top: topOffset, left: baseLeft, zIndex: 2000 },
        { top: topOffset, left: `calc(${baseLeft} + ${threeCardHorizontalSpacing})`, zIndex: 2000 },
      ];
    } else {
      // Celtic Cross Spread
      const crossCardScale = baseScale * 0.9;
      const celticBaseLeft = isMobile ? '30%' : baseLeft;
      const verticalSpacing = isMobile ? '5.9vh' : '9.5vh';

      return [
        { top: topOffset, left: celticBaseLeft, zIndex: 10 },
        { top: topOffset, left: celticBaseLeft, transform: `rotate(90deg) scale(${crossCardScale * 0.7})`, zIndex: 12 },
        { top: `calc(${topOffset} - ${verticalSpacing})`, left: celticBaseLeft, zIndex: 10 },
        { top: `calc(${topOffset} + ${verticalSpacing})`, left: celticBaseLeft, zIndex: 10 },
        { top: topOffset, left: `calc(${celticBaseLeft} - ${celticCrossHorizontalSpacing})`, zIndex: 10 },
        { top: topOffset, left: `calc(${celticBaseLeft} + ${celticCrossHorizontalSpacing})`, zIndex: 10 },
        { top: `calc(${topOffset} - ${verticalSpacing} * 1.5)`, left: `calc(${celticBaseLeft} + ${celticStackHorizontalSpacing})`, zIndex: 10 },
        { top: `calc(${topOffset} - ${verticalSpacing} * 0.5)`, left: `calc(${celticBaseLeft} + ${celticStackHorizontalSpacing})`, zIndex: 10 },
        { top: `calc(${topOffset} + ${verticalSpacing} * 0.5)`, left: `calc(${celticBaseLeft} + ${celticStackHorizontalSpacing})`, zIndex: 10 },
        { top: `calc(${topOffset} + ${verticalSpacing} * 1.5)`, left: `calc(${celticBaseLeft} + ${celticStackHorizontalSpacing})`, zIndex: 10 },
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
    <div className={`card-reveal ${className} ${cards.length === 3 ? 'three-card' : 'celtic-cross'}`}>
      {dealingComplete && cards.map((card, index) => (
        <motion.div
          key={index}
          className={`card pointer-events-auto ${card.orientation === 'reversed' ? 'reversed' : ''} ${flippedCards > index ? 'flipped' : ''} ${cards.length > 3 && index === 1 ? 'cross-card' : ''} ${hoveredCard === index ? 'hovered' : ''}`}
          initial={{ opacity: 0, x: '-100vw', y: cardPositions[index].top, scale: 0.5 }}
          animate={{
            opacity: 1,
            x: cardPositions[index].left,
            y: cardPositions[index].top,
            scale: 1,
            zIndex: cardPositions[index].zIndex,
            transition: { duration: 0.8, delay: index * 0.1, ease: 'easeOut', opacity: { duration: 0.5, ease: 'linear' } }
          }}
          exit={{
            opacity: 0,
            x: cardPositions[index].left,
            y: cardPositions[index].top,
            scale: 0.5,
            zIndex: 1,
            transition: { duration: 0.5, delay: index * 0.1, ease: 'easeOut' }
          }}
          style={{
            position: 'absolute',
            left: cardPositions[index].left,
            top: cardPositions[index].top,
            transform: `${cardPositions[index].transform || 'translate(-50%, -50%)'}`,
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="card-inner">
            <div className="card-front">
              <IKImage
                path={card.img}
                loading="lazy"
                alt={card.name || "Tarot card front"}
                className="card-image"
              />
            </div>
            <div className="card-back">
              <IKImage
                path="cardback.webp"
                loading="lazy"
                alt="Tarot card back"
                className="card-image"
              />
            </div>
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