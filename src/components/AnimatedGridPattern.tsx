import React, { useCallback, useEffect, useId, useRef, useState, useMemo } from 'react';
import { cn } from '../utils';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import './AnimatedGridPattern.css';

const tarotCards: string[] = [
  'c01.webp', 'c02.webp', 'c03.webp', 'c04.webp', 'c05.webp', 'c06.webp', 'c07.webp', 'c08.webp', 'c09.webp', 'c10.webp',
  'c11.webp', 'c12.webp', 'c13.webp', 'c14.webp', 'cardback.webp', 'm00.webp', 'm01.webp', 'm02.webp',
  'm03.webp', 'm04.webp', 'm05.webp', 'm06.webp', 'm07.webp', 'm08.webp', 'm09.webp', 'm10.webp', 'm11.webp', 'm12.webp',
  'm13.webp', 'm14.webp', 'm15.webp', 'm16.webp', 'm17.webp', 'm18.webp', 'm19.webp', 'm20.webp', 'm21.webp', 'p01.webp',
  'p02.webp', 'p03.webp', 'p04.webp', 'p05.webp', 'p06.webp', 'p07.webp', 'p08.webp', 'p09.webp', 'p10.webp', 'p11.webp',
  'p12.webp', 'p13.webp', 'p14.webp', 's01.webp', 's02.webp', 's03.webp', 's04.webp', 's05.webp', 's06.webp', 's07.webp',
  's08.webp', 's09.webp', 's10.webp', 's11.webp', 's12.webp', 's13.webp', 's14.webp', 'w01.webp', 'w02.webp', 'w03.webp',
  'w04.webp', 'w05.webp', 'w06.webp', 'w07.webp', 'w08.webp', 'w09.webp', 'w10.webp', 'w11.webp', 'w12.webp', 'w13.webp',
  'w14.webp',
];

const CARD_LIMIT = 20;
const INITIAL_CARD_COUNT = 5;
const CARD_INCREMENT = 3;
const CARD_INCREMENT_INTERVAL = 5;

interface Dimensions {
  width: number;
  height: number;
}

interface Card {
  id: number;
  tarotCard: string;
  randomRotation: number;
  randomDelay: number;
  randomDuration: number;
  posX: number;
  posY: number;
  newPosX: number;
  newPosY: number;
  randomHue: number;
}

const getRandomValue = (min: number, max: number): number => Math.random() * (max - min) + min;

interface AnimatedGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: number;
  numCards?: number;
  className?: string;
  maxOpacity?: number;
  isDarkMode?: boolean;
  isMobile?: boolean;
  isPaused: boolean;
}

const AnimatedGridPattern: React.FC<AnimatedGridPatternProps> = React.memo(({
  width = 22,
  height = 42,
  x = -1,
  y = -1,
  strokeDasharray = 19,
  numCards = 10,
  className,
  maxOpacity = 0.9,
  isDarkMode = false,
  isMobile = false,
  isPaused,
  ...props
}) => {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [visibleCardCount, setVisibleCardCount] = useState(INITIAL_CARD_COUNT);

  const generateCards = useCallback((count: number): Card[] => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      tarotCard: tarotCards[Math.floor(Math.random() * tarotCards.length)],
      randomRotation: getRandomValue(-5, 5), // Further reduced rotation range
      randomDelay: getRandomValue(0, 20),
      randomDuration: getRandomValue(20, 30), // Increased duration range for slower movement
      posX: getRandomValue(0, 100), // Use percentage for better scaling
      posY: getRandomValue(0, 100), // Use percentage for better scaling
      newPosX: getRandomValue(0, 100), // Use percentage for better scaling
      newPosY: getRandomValue(0, 100), // Use percentage for better scaling
      randomHue: Math.floor(Math.random() * 360),
    })), []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCards(generateCards(CARD_LIMIT));
  }, [generateCards]);

  useEffect(() => {
    const handleStreamingStateChange = (e: CustomEvent<boolean>) => setIsStreaming(e.detail);
    window.addEventListener('streamingStateChange', handleStreamingStateChange as EventListener);
    return () => window.removeEventListener('streamingStateChange', handleStreamingStateChange as EventListener);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => setIsTabActive(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (visibleCardCount < CARD_LIMIT) {
      const timer = setTimeout(() => {
        setVisibleCardCount(prev => Math.min(prev + CARD_INCREMENT, CARD_LIMIT));
      }, CARD_INCREMENT_INTERVAL);
      return () => clearTimeout(timer);
    }
  }, [visibleCardCount]);

  const effectiveNumCards = useMemo(() => {
    const baseCount = Math.min(visibleCardCount, numCards);
    if (!isTabActive) return Math.floor(baseCount / 4);
    if (isStreaming) return Math.floor(baseCount / 2);
    return baseCount;
  }, [isTabActive, isStreaming, visibleCardCount, numCards]);

  if (isMobile) return null;

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', 
        isDarkMode ? 'fill-gray-700/30 stroke-gray-700/30' : 'fill-gray-400/30 stroke-gray-400/30', 
        className)}
      {...props}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.3333 ${height}V.444H${width}`} fill="none" strokeDasharray={strokeDasharray.toString()} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg width="100%" height="100%" className="overflow-visible">
        {cards.slice(0, effectiveNumCards).map((card) => (
          <g
            key={card.id}
            className={`card-container ${isPaused ? '' : 'animate'}`}
            style={{
              '--random-rotation': `${card.randomRotation}deg`,
              '--animation-delay': `${card.randomDelay}s`,
              '--animation-duration': `${card.randomDuration}s`,
              '--random-scale': getRandomValue(0.5, 0.8), // Reduced scale for smaller cards
              '--random-opacity': getRandomValue(0.5, 0.8), // Reduced opacity
              '--pos-x': `${card.posX}%`,
              '--pos-y': `${card.posY}%`,
              '--new-pos-x': `${card.newPosX}%`,
              '--new-pos-y': `${card.newPosY}%`,
              filter: `hue-rotate(${card.randomHue}deg)`,
            } as React.CSSProperties}
          >
            <image
              href={`${TAROT_IMAGE_BASE_URL}/${card.tarotCard}`}
              width={width}
              height={height}
              className="tarot-card"
              x={`calc(${card.posX}% - ${width / 2}px)`}
              y={`calc(${card.posY}% - ${height / 2}px)`}
            />
          </g>
        ))}
      </svg>
    </svg>
  );
});

export default AnimatedGridPattern;