import React, { useEffect, useState } from 'react';
import { IKImage } from 'imagekitio-react';
import './CardReveal.css';

// Removed unused debounce function

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
  insideMonitor?: boolean;
  inTerminal?: boolean;
  className?: string;
}

// Removed unused type: TooltipPosition

const CardReveal: React.FC<CardRevealProps> = ({ cards, showCards, isMobile, insideMonitor = false, inTerminal = false, className = '' }) => {
  const [localShowCards, setLocalShowCards] = useState<boolean>(showCards);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [tappedCard, setTappedCard] = useState<number | null>(null);

  useEffect(() => {
    // When showCards changes, update localShowCards with shorter delay
    if (!showCards) {
      setLocalShowCards(false);
    } else {
      // Clear any existing timers to prevent race conditions
      const timer = setTimeout(() => {
        setLocalShowCards(true);
      }, 500); // Shorter delay for showing cards
      return () => clearTimeout(timer);
    }
  }, [showCards]);
  
  // Reset local state when cards array changes (new draw)
  useEffect(() => {
    if (cards.length === 0) {
      setLocalShowCards(false);
    }
  }, [cards]);
  
  // Less verbose logging
  useEffect(() => {
    if (cards.length > 0 && !cards.every(card => 
      card.name && card.img && card.orientation && card.position && card.tooltip
    )) {
      console.error('CardReveal: Some cards missing required properties', cards);
    }
  }, [cards, showCards, localShowCards]);

  const handleMouseEnter = (index: number): void => {
    if (!isMobile) {
      setHoveredCard(index);
    }
  };

  const handleMouseLeave = (): void => {
    if (!isMobile) {
      setHoveredCard(null);
    }
  };

  // Handle tap for mobile devices
  const handleTap = (index: number): void => {
    if (isMobile) {
      if (tappedCard === index) {
        // If tapping the same card, close it
        setTappedCard(null);
      } else {
        // Otherwise, show the tapped card
        setTappedCard(index);
      }
      
      // Add vibration feedback for mobile if available
      if ('vibrate' in navigator) {
        try {
          // Enhanced vibration pattern for better feedback
          if (inTerminal) {
            // Terminal-specific vibration pattern - more pronounced
            navigator.vibrate([30, 20, 50]); // Pattern: vibrate, pause, vibrate longer
          } else {
            navigator.vibrate(50); // Standard vibration
          }
        } catch (e) {
          console.log('Vibration not supported');
        }
      }
    }
  };
  
  // Clear tapped card when cards change
  useEffect(() => {
    setTappedCard(null);
  }, [cards]);

  // Removed unused getTooltipPosition function

  return (
    <div className={`card-reveal ${cards.length === 3 ? 'three-card' : 'celtic-cross'} ${isMobile ? 'mobile' : ''} ${localShowCards ? 'show' : ''} ${insideMonitor ? 'inside-monitor' : ''} ${inTerminal ? 'in-terminal' : ''} ${className}`}>
      {/* Use a more unique key that changes with each draw but without Math.random() which causes unnecessary rerenders */}
        {localShowCards && cards.length > 0 ? (
          <div key={`card-container-${cards.map(c => c.name).join('-')}`} className="cards-container">
            {cards.map((card, index) => (
              <div
                key={`${card.name}-${index}-${card.position}`}
                className={`card ${card.orientation === 'reversed' ? 'reversed' : ''} ${tappedCard === index ? 'tapped' : ''} ${inTerminal ? 'in-terminal-card' : ''}`}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleTap(index)}
                style={{
                  willChange: 'transform', // Improves performance with hardware acceleration
                  ...(tappedCard === index && (insideMonitor || inTerminal) ? { 
                    zIndex: inTerminal ? 30 : 10
                  } : {})
                }}
              >
                <IKImage
                  path={card.img.startsWith('http') ? card.img.split('tarotmancer/')[1] : card.img}
                  loading="lazy"
                  alt={card.name || "Tarot card"}
                  className="card-image"
                  urlEndpoint="https://ik.imagekit.io/tarotmancer"
                />
                {/* Use visibility instead of opacity for the card name overlay */}
                <div 
                  className={`card-name-overlay ${card.orientation === 'reversed' ? 'reversed' : ''}`}
                  style={{ 
                    visibility: (hoveredCard === index || tappedCard === index) ? 'visible' : 'hidden',
                    opacity: (hoveredCard === index || tappedCard === index) ? 1 : 0,
                    transition: 'none'
                  }}
                >
                  {card.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div key="empty-container" className="empty-cards-container" />
        )}
      {/* End of card container */}
    </div>
  );
};

export default CardReveal;