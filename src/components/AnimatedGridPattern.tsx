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

const CARD_LIMIT = 20; // Maximum number of cards to render
const INITIAL_CARD_COUNT = 5; // Start with a small number of cards
const CARD_INCREMENT = 3; // Number of cards to add in each step
const CARD_INCREMENT_INTERVAL = 5000; // Time in ms between adding new cards

interface Dimensions {
  width: number;
  height: number;
}

interface Card {
  id: number;
  pos: [number, number];
  tarotCard: string;
  randomScale: number;
  randomOpacity: number;
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
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [visibleCardCount, setVisibleCardCount] = useState(INITIAL_CARD_COUNT);

  const getPos = useCallback((): [number, number] => [
    Math.floor(Math.random() * (dimensions.width / width)),
    Math.floor(Math.random() * (dimensions.height / height)),
  ], [dimensions, width, height]);

  const generateCards = useCallback((count: number): Card[] => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      pos: getPos(),
      tarotCard: tarotCards[Math.floor(Math.random() * tarotCards.length)],
      randomScale: getRandomValue(0.5, 2.0),
      randomOpacity: Math.random() * maxOpacity,
    })), [getPos, maxOpacity]);

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
    if (dimensions.width && dimensions.height) setCards(generateCards(CARD_LIMIT));
  }, [dimensions, generateCards]);

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

  const updateCardPosition = useCallback((id: number) => {
    setCards(currentCards => currentCards.map(card => 
      card.id === id ? { ...card, pos: getPos() } : card
    ));
  }, [getPos]);

  if (isMobile) return null;

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn('pointer-events-none relative inset-0 h-full w-full', 
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
      <svg x={x} y={y} className="overflow-visible">
        {cards.slice(0, effectiveNumCards).map((card) => (
          <g
            key={`${card.id}-${card.pos[0]}-${card.pos[1]}`}
            className={`card-container ${isPaused ? '' : 'animate'}`}
            style={{
              '--random-scale': card.randomScale,
              '--random-opacity': card.randomOpacity,
              '--animation-delay': `${card.id * getRandomValue(0.5, 1.0)}s`,
              transform: `translate(${card.pos[0] * width}px, ${card.pos[1] * height}px)`,
            } as React.CSSProperties}
            onAnimationIteration={() => {
              if (!isStreaming && !isPaused) {
                updateCardPosition(card.id);
              }
            }}
          >
            <image
              href={`${TAROT_IMAGE_BASE_URL}/${card.tarotCard}`}
              width={width - 1}
              height={height - 1}
              className="tarot-card"
            />
            <image
              href={`${TAROT_IMAGE_BASE_URL}/cardback.webp`}
              width={width - 1}
              height={height - 1}
              className="tarot-card-back"
            />
          </g>
        ))}
      </svg>
    </svg>
  );
});

export default AnimatedGridPattern;