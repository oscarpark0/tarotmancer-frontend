import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import './CardReveal.css';

const cardPositions = [
  { top: '30%', left: '45%', transform: 'translate(-50%, -50%)', zIndex: 10 }, 
  { top: '30%', left: '45%', transform: 'translate(-50%, -50%) rotate(90deg)', zIndex: 12 }, 
  { top: '11%', left: '45%', transform: 'translate(-50%, -50%)', zIndex: 10 }, 
  { top: '50%', left: '45%', transform: 'translate(-50%, -50%)', zIndex: 10 }, 
  { top: '30%', left: '33%', transform: 'translate(-50%, -50%)', zIndex: 10 }, 
  { top: '30%', left: '57%', transform: 'translate(-50%, -50%)', zIndex: 10 }, 
  { top: '1%', left: '75%', transform: 'translate(-50%, -50%)', zIndex: 10 }, 
  { top: '21%', left: '75%', transform: 'translate(-50%, -50%)', zIndex: 10 },
  { top: '41%', left: '75%', transform: 'translate(-50%, -50%)', zIndex: 10 }, 
  { top: '61%', left: '75%', transform: 'translate(-50%, -50%)', zIndex: 10 }, 
];

const CardReveal = ({ cards = [], revealCards, dealingComplete, shouldDrawNewSpread, className }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (revealCards && dealingComplete) {
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
    }
  }, [revealCards, dealingComplete]);

  useEffect(() => {
    if (shouldDrawNewSpread) {
      setIsRevealed(false);
    }
  }, [shouldDrawNewSpread]);

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (custom) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: custom * 0.2, duration: 0.5 },
    }),
  };

  return (
    <div className={`card-reveal ${className}`}>
      {cards.map((card, index) => (
        <motion.div
          key={card.name}
          className="card-container"
          custom={index}
          initial="hidden"
          animate={isRevealed ? 'visible' : 'hidden'}
          variants={cardVariants}
        >
          <img
            src={`${TAROT_IMAGE_BASE_URL}${card.img}`}
            alt={card.name}
            className={`card ${card.orientation === 'reversed' ? 'reversed' : ''}`}
          />
          <div className="card-label">
            <h3>{card.name}</h3>
            <p>{card.position_name}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CardReveal;
