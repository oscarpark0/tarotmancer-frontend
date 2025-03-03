import React, { useEffect, useState } from 'react';
import { IKImage } from 'imagekitio-react';
import './CardReveal.css';

// Add debounce function for better mobile performance
function debounce(func: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

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

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

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
          navigator.vibrate(50); // Short vibration
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
    <div className={`card-reveal ${cards.length === 3 ? 'three-card' : 'celtic-cross'} ${isMobile ? 'mobile' : ''} ${localShowCards ? 'show' : ''} ${insideMonitor ? 'inside-monitor' : ''} ${inTerminal ? 'in-terminal' : ''} ${className}`}>
      {/* Use a more unique key that changes with each draw */}
      {/* Removed AnimatePresence to prevent animations */}
        {localShowCards && cards.length > 0 ? (
          <div key={`card-container-${cards.map(c => c.name).join('-')}`} className="cards-container">
            {cards.map((card, index) => (
              <div
                key={`${card.name}-${index}-${Math.random()}`}
                className={`card ${card.orientation === 'reversed' ? 'reversed' : ''} ${tappedCard === index ? 'tapped' : ''} ${inTerminal ? 'in-terminal-card' : ''}`}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleTap(index)}
                style={tappedCard === index && (insideMonitor || inTerminal) ? { animation: inTerminal ? 'terminalCardPulse 2s infinite' : 'cardPulse 2s infinite' } : undefined}
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