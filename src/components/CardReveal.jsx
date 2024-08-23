import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IKImage } from 'imagekitio-react';
import './CardReveal.css';

const CardReveal = ({ cards, showCards, isMobile }) => {
  const [localShowCards, setLocalShowCards] = useState(showCards);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    if (!showCards) {
      setLocalShowCards(false);
    } else {
      const timer = setTimeout(() => {
        setLocalShowCards(true);
      }, 2000); // Delay showing cards to allow for animation
      return () => clearTimeout(timer);
    }
  }, [showCards]);

  useEffect(() => {
    if (!showCards) {
      setLocalShowCards(false);
    }
  }, [showCards]);

  useEffect(() => {
    console.log('CardReveal: cards or showCards changed', { cards, showCards });
  }, [cards, showCards]);

  const handleMouseEnter = (index) => {
    setHoveredCard(index);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  const getTooltipPosition = (index, totalCards, orientation) => {
    if (totalCards === 3) {
      return index === 1 ? 'bottom' : 'top';
    } else {
      // Celtic Cross positioning
      if (index === 0 || index === 1) return orientation === 'reversed' ? 'top' : 'bottom';
      if (index === 2) return 'left';
      if (index === 3) return 'left';
      if (index === 4) return orientation === 'reversed' ? 'top' : 'bottom';
      if (index === 5) return orientation === 'reversed' ? 'bottom' : 'top';
      return index % 2 === 0 ? 'left' : 'left';
    }
  };

  return (
    <div className={`card-reveal ${cards.length === 3 ? 'three-card' : 'celtic-cross'} ${isMobile ? 'mobile' : ''} ${localShowCards ? 'show' : ''}`}>
      <AnimatePresence>
        {localShowCards && cards.map((card, index) => (
          <motion.div
            key={`${card.name}-${index}-${showCards}`}
            className={`card ${card.orientation === 'reversed' ? 'reversed' : ''}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <IKImage
              path={card.img}
              loading="lazy"
              alt={card.name || "Tarot card"}
              className="card-image"
            />
            <AnimatePresence>
              {hoveredCard === index && (
                <motion.div
                  className={`card-tooltip ${getTooltipPosition(index, cards.length, card.orientation)} ${isMobile ? 'mobile' : ''}`}
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
      </AnimatePresence>
    </div>
  );
};

export default CardReveal;