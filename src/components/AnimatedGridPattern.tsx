import React, { useCallback, useEffect, useId, useRef, useState, useMemo } from 'react';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import debounce from 'lodash.debounce';
import './AnimatedGridPattern.css';

// List of tarot card images
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

// Interface for dimensions
interface Dimensions {
  width: number;
  height: number;
}

// Debounced resize handler to update dimensions
const debounceResizeHandler = debounce((entries: ResizeObserverEntry[], setDimensions: React.Dispatch<React.SetStateAction<Dimensions>>) => {
  const { width, height } = entries[0].contentRect;
  setDimensions({ width, height });
}, 200);

// Utility function to get a random value within a range
const getRandomValue = (min: number, max: number): number => Math.random() * (max - min) + min;

// Interface for AnimatedGridPatternProps
interface AnimatedGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: number;
  strokeOpacity?: number;
  numCards?: number;
  className?: string;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
  isDarkMode?: boolean;
  isMobile?: boolean;
  isPaused: boolean;
}

// Interface for Card
interface Card {
  id: number;
  pos: [number, number];
  tarotCard: string;
  randomScale: number;
  randomOpacity: number;
  rotation: number; // New property for card rotation
  order: number; // New property for stack order
}

// AnimatedGridPattern component
const AnimatedGridPattern: React.FC<AnimatedGridPatternProps> = React.memo(({
  width = 22,
  height = 42,
  x = -1,
  y = -1,
  strokeDasharray = 19,
  strokeOpacity = 1,
  numCards = 0,
  className,
  maxOpacity = 0.9,
  duration = 6,
  repeatDelay = 10,
  isDarkMode = false,
  isMobile = false,
  isPaused,
  ...props
}) => {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [animationState, setAnimationState] = useState<'grid' | 'stack' | 'shuffle' | 'fan'>('grid');
  const [isStreaming] = useState(false);
  const [isTabActive] = useState(true);

  // Move effectiveNumCards calculation
  const effectiveNumCards = useMemo(() => 
    isTabActive ? (isStreaming ? Math.floor(numCards / 2) : numCards) : Math.floor(numCards / 4),
    [isTabActive, isStreaming, numCards]
  );

  const [cards, setCards] = useState<Card[]>([]);

  // Move this after the cards state declaration
  const visibleCards = useMemo(() => 
    cards.slice(0, Math.min(effectiveNumCards, 20)),
    [cards, effectiveNumCards]
  );

  const loadedImages = useRef<Set<string>>(new Set());

  // Preload essential images
  useEffect(() => {
    const essentialImages = ['cardback.webp'];
    essentialImages.forEach(img => {
      const image = new Image();
      image.src = `${TAROT_IMAGE_BASE_URL}/${img}`;
      loadedImages.current.add(img);
    });
  }, []);

  // Lazy load images
  const lazyLoadImage = useCallback((card: string) => {
    if (!loadedImages.current.has(card)) {
      const image = new Image();
      image.src = `${TAROT_IMAGE_BASE_URL}/${card}`;
      loadedImages.current.add(card);
    }
  }, []);

  // Callback to generate a random position within the grid
  const getPos = useCallback((): [number, number] => [
    Math.floor((Math.random() * dimensions.width) / width),
    Math.floor((Math.random() * dimensions.height) / height),
  ], [dimensions.width, dimensions.height, width, height]);

  // Callback to generate a list of cards with random properties
  const generateCards = useCallback((count: number): Card[] =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      pos: getPos(),
      tarotCard: tarotCards[Math.floor(Math.random() * tarotCards.length)],
      randomScale: getRandomValue(0.5, 2.0),
      randomOpacity: Math.random() * maxOpacity,
      rotation: 0,
      order: i,
    })), [getPos, maxOpacity]);

  // Effect to set up a resize observer for the container
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => debounceResizeHandler(entries, setDimensions));
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Effect to generate cards when dimensions change
  useEffect(() => {
    if (dimensions.width && dimensions.height) setCards(generateCards(numCards));
  }, [dimensions, numCards, generateCards]);

  // Memoize getDeckPosition
  const getDeckPosition = useCallback((): [number, number] => [
    Math.floor(dimensions.width / (2 * width)),
    Math.floor(dimensions.height / (2 * height)),
  ], [dimensions.width, dimensions.height, width, height]);

  // Update cardVariants to use visibleCards
  const cardVariants = useMemo(() => ({
    grid: (custom: Card) => ({
      x: custom.pos[0] * width,
      y: custom.pos[1] * height,
      opacity: custom.randomOpacity,
      rotateY: isPaused ? 0 : [0, 180],
      scale: isPaused ? 1 : custom.randomScale,
      z: isPaused ? 0 : [0, 50, 0],
      transition: {
        duration: isPaused ? 0 : duration + getRandomValue(0, 30),
        repeat: isPaused ? 0 : Infinity,
        delay: custom.id * getRandomValue(0.5, 1.0),
        repeatType: 'reverse',
        ease: [0.645, 0.045, 0.355, 1],
      },
    }),
    stack: (custom: Card) => {
      const [deckX, deckY] = getDeckPosition();
      return {
        x: deckX * width,
        y: deckY * height,
        z: custom.order,
        rotateY: 0,
        scale: 1,
        opacity: 1,
        transition: { duration: 1, delay: custom.order * 0.05 },
      };
    },
    shuffle: (custom: Card) => ({
      x: getRandomValue(0, dimensions.width - width),
      y: getRandomValue(0, dimensions.height - height),
      z: custom.order,
      rotateZ: getRandomValue(-180, 180),
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, delay: custom.order * 0.02 },
    }),
    fan: (custom: Card) => {
      const [centerX, centerY] = getDeckPosition();
      const angle = (custom.order / visibleCards.length) * 180 - 90;
      const radius = Math.min(dimensions.width, dimensions.height) * 0.4;
      return {
        x: centerX * width + radius * Math.cos(angle * Math.PI / 180),
        y: centerY * height + radius * Math.sin(angle * Math.PI / 180),
        rotateZ: angle,
        scale: 1,
        opacity: 1,
        transition: { duration: 1, delay: custom.order * 0.05 },
      };
    },
  }), [getDeckPosition, dimensions, width, height, visibleCards.length, duration, isPaused]);

  // Function to trigger the animation sequence
  const triggerAnimationSequence = useCallback(() => {
    const sequence = async () => {
      setAnimationState('stack');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAnimationState('shuffle');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAnimationState('fan');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAnimationState('grid');
    };
    sequence();
  }, []);

  // Effect to start the animation sequence periodically
  useEffect(() => {
    if (!isPaused && isTabActive && !isStreaming) {
      const intervalId = setInterval(triggerAnimationSequence, 30000); // Trigger every 30 seconds
      return () => clearInterval(intervalId);
    }
  }, [isPaused, isTabActive, isStreaming, triggerAnimationSequence]);

  if (isMobile) {
    return null;
  }

  // Memoized motion components for better performance
  const MemoizedMotionG = motion.g;
  const MemoizedMotionImage = motion.image;

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
        <AnimatePresence>
          {visibleCards.map((card) => (
            <MemoizedMotionG
              key={`${card.id}-${card.pos[0]}-${card.pos[1]}`}
              custom={card}
              variants={cardVariants}
              initial="grid"
              animate={animationState}
              style={{ transformStyle: 'preserve-3d', transformOrigin: 'center', perspective: '1000px' }}
              onLayoutEffect={() => lazyLoadImage(card.tarotCard)}
            >
              <MemoizedMotionImage
                href={`${TAROT_IMAGE_BASE_URL}/${card.tarotCard}`}
                width={width - 1}
                height={height - 1}
                className="tarot-card"
              />
              <MemoizedMotionImage
                href={`${TAROT_IMAGE_BASE_URL}/cardback.webp`}
                width={width - 1}
                height={height - 1}
                className="tarot-card-back"
              />
            </MemoizedMotionG>
          ))}
        </AnimatePresence>
      </svg>
    </svg>
  );
});

export default AnimatedGridPattern;