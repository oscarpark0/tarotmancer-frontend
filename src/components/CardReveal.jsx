import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import './CardReveal.css';

const CardReveal = ({ cards, revealCards, dealingComplete, shouldDrawNewSpread, isMobile }) => {
  const [revealedCards, setRevealedCards] = useState(0);
  const [flippedCards, setFlippedCards] = useState(0);
  const [isDealing, setIsDealing] = useState(false);
  const [exitAnimation, setExitAnimation] = useState(false);

  const cardPositions = useMemo(() => {
    const containerWidth = window.innerWidth;
    const isMobile = containerWidth <= 768;
    
    const baseScale = isMobile ? 0.02 : 20;
    const baseLeft = isMobile ? '35%' : '40%'; // Adjusted from '25%' to '40%'
    const spacing = isMobile ? '20vw' : '10vw'; // Adjusted from '15vw' to '10vw'
    const topOffset = isMobile ? '55%' : '30%';
    const verticalSpacing = isMobile ? '6vh' : '11vh';
    
    if (cards.length === 3) {
      return [
        { top: topOffset, left: `calc(${baseLeft} - ${spacing})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 2000 },
        { top: topOffset, left: baseLeft, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 2000 },
        { top: topOffset, left: `calc(${baseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 2000 },
      ];
    } else {
      const crossCardScale = baseScale * 0.9;
      return [
        { top: topOffset, left: baseLeft, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: topOffset, left: baseLeft, transform: `translate(-50%, -50%) rotate(90deg) scale(${crossCardScale})`, zIndex: 12 },
        { top: `calc(${topOffset} - ${verticalSpacing})`, left: baseLeft, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} + ${verticalSpacing})`, left: baseLeft, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: topOffset, left: `calc(${baseLeft} - 6vw)`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: topOffset, left: `calc(${baseLeft} + 6vw)`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} - ${verticalSpacing} * 1.5)`, left: `calc(${baseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} - ${verticalSpacing} * 0.5)`, left: `calc(${baseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} + ${verticalSpacing} * 0.5)`, left: `calc(${baseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
        { top: `calc(${topOffset} + ${verticalSpacing} * 1.5)`, left: `calc(${baseLeft} + ${spacing})`, transform: `translate(-50%, -50%) scale(${baseScale})`, zIndex: 10 },
      ];
    }
  }, [cards.length]);

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

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${isMobile ? 'z-[2000]' : ''}`}>
      <div className={`card-reveal-container ${isDealing ? 'dealing' : ''} ${dealingComplete ? 'active' : ''} ${exitAnimation ? 'exit-animation' : ''}`}>
        <div className="card-container">
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
      </div>
    </div>
  );
};

export default CardReveal;
