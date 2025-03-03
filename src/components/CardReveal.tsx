import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IKImage } from 'imagekitio-react';
import './CardReveal.css';

interface Card {
  name: string;
  img: string;
  orientation: 'upright' | 'reversed';
  position: string;
  tooltip: string;
}

interface CardRevealProps {
  cards: Card[];
  showCards: boolean;
  isMobile: boolean;
}

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

const CardReveal: React.FC<CardRevealProps> = ({ cards, showCards, isMobile }) => {
  const [localShowCards, setLocalShowCards] = useState<boolean>(showCards);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    // When showCards changes, update localShowCards with appropriate delay
    if (!showCards) {
      setLocalShowCards(false);
    } else {
      // Clear any existing timers to prevent race conditions
      const timer = setTimeout(() => {
        setLocalShowCards(true);
      }, 2000); // Delay showing cards to allow for animation
      return () => clearTimeout(timer);
    }
  }, [showCards]);
  
  // Reset local state when cards array changes (new draw)
  useEffect(() => {
    if (cards.length === 0) {
      setLocalShowCards(false);
    }
  }, [cards]);
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log('CardReveal: cards or showCards changed', { 
      cards: cards.length, 
      cardObjects: cards,
      showCards, 
      localShowCards 
    });
    
    // Check if cards have all required properties
    if (cards.length > 0) {
      const cardCheck = cards.map(card => ({
        hasName: !!card.name,
        hasImg: !!card.img,
        hasOrientation: !!card.orientation,
        hasPosition: !!card.position,
        hasTooltip: !!card.tooltip
      }));
      console.log('Card property check:', cardCheck);
    }
  }, [cards, showCards, localShowCards]);

  const handleMouseEnter = (index: number): void => {
    setHoveredCard(index);
  };

  const handleMouseLeave = (): void => {
    setHoveredCard(null);
  };

  const getTooltipPosition = (index: number, totalCards: number, orientation: string): TooltipPosition => {
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
      {/* Use a more unique key that changes with each draw */}
      <AnimatePresence mode="wait" initial={false}>
        {localShowCards && cards.length > 0 ? (
          <div key={`card-container-${cards.map(c => c.name).join('-')}`} className="cards-container">
            {cards.map((card, index) => (
              <motion.div
                key={`${card.name}-${index}-${Math.random()}`}
                className={`card ${card.orientation === 'reversed' ? 'reversed' : ''}`}
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: -50 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <IKImage
                  path={card.img.startsWith('http') ? card.img.split('tarotmancer/')[1] : card.img.startsWith('tarot/') ? card.img : `tarot/${card.img}`}
                  loading="lazy"
                  alt={card.name || "Tarot card"}
                  className="card-image"
                  urlEndpoint="https://ik.imagekit.io/tarotmancer"
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
          </div>
        ) : (
          <div key="empty-container" className="empty-cards-container" />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardReveal;