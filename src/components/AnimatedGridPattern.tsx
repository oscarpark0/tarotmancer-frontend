import React, { useCallback, useEffect, useId, useRef, useState, useMemo } from 'react';
import { cn } from '../utils';
import { motion } from 'framer-motion';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import debounce from 'lodash.debounce';
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

interface Dimensions {
  width: number;
  height: number;
}

const debounceResizeHandler = debounce((entries: ResizeObserverEntry[], setDimensions: React.Dispatch<React.SetStateAction<Dimensions>>) => {
  const { width, height } = entries[0].contentRect;
  setDimensions({ width, height });
}, 200);

const getRandomValue = (min: number, max: number): number => Math.random() * (max - min) + min;

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
}

interface Card {
  id: number;
  pos: [number, number];
  tarotCard: string;
  randomScale: number;
  randomOpacity: number;
}

const AnimatedGridPattern: React.FC<AnimatedGridPatternProps> = React.memo(({
  width = 22,
  height = 42,
  x = -1,
  y = -1,
  strokeDasharray = 19,
  strokeOpacity = 1,
  numCards = 10,
  className,
  maxOpacity = 0.9,
  duration = 6,
  repeatDelay = 10,
  isDarkMode = false,
  isMobile = false,
  ...props
}) => {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);

  const getPos = useCallback((): [number, number] => [
    Math.floor((Math.random() * dimensions.width) / width),
    Math.floor((Math.random() * dimensions.height) / height),
  ], [dimensions.width, dimensions.height, width, height]);

  const generateCards = useCallback((count: number): Card[] => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      pos: getPos(),
      tarotCard: tarotCards[Math.floor(Math.random() * tarotCards.length)],
      randomScale: getRandomValue(0.5, 2.0),
      randomOpacity: Math.random() * maxOpacity,
    })), [getPos, maxOpacity]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => debounceResizeHandler(entries, setDimensions));
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (dimensions.width && dimensions.height) setCards(generateCards(numCards));
  }, [dimensions, numCards, generateCards]);

  const updateCardPosition = useCallback((id: number) => {
    setCards(currentCards => currentCards.map(card => 
      card.id === id ? { ...card, pos: getPos() } : card
    ));
  }, [getPos]);

  const cardVariants = useMemo(() => ({
    initial: { opacity: 0, rotateY: 0, scale: 1, z: 0 },
    animate: (custom: Card) => ({
      opacity: custom.randomOpacity,
      rotateY: [0, 180],
      scale: custom.randomScale,
      z: [0, 50, 0],
      transition: {
        duration: duration + getRandomValue(0, 30),
        repeat: Infinity,
        delay: custom.id * getRandomValue(0.5, 1.0),
        repeatType: 'reverse',
        ease: [0.645, 0.045, 0.355, 1],
      },
    }),
  }), [duration]);

  useEffect(() => {
    const handleStreamingStateChange = (e: CustomEvent<boolean>) => setIsStreaming(e.detail);
    window.addEventListener('streamingStateChange', handleStreamingStateChange as EventListener);
    return () => window.removeEventListener('streamingStateChange', handleStreamingStateChange as EventListener);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const effectiveNumCards = isTabActive ? (isStreaming ? Math.floor(numCards / 2) : numCards) : Math.floor(numCards / 4);

  // If on mobile, return null to disable the component
  if (isMobile) {
    return null;
  }

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
          <motion.g
            key={`${card.id}-${card.pos[0]}-${card.pos[1]}`}
            custom={card}
            variants={cardVariants}
            initial="initial"
            animate={isStreaming ? "initial" : "animate"}
            onAnimationComplete={() => {
              if (!isStreaming) {
                setTimeout(() => updateCardPosition(card.id), 10000 + getRandomValue(0, 100));
              }
            }}
            style={{ transformStyle: 'preserve-3d', transformOrigin: 'center', perspective: '1000px' }}
          >
            <motion.image
              href={`${TAROT_IMAGE_BASE_URL}/${card.tarotCard}`}
              width={width - 1}
              height={height - 1}
              x={card.pos[0] * width + 1}
              y={card.pos[1] * height + 1}
              className="tarot-card"
            />
            <motion.image
              href={`${TAROT_IMAGE_BASE_URL}/cardback.webp`}
              width={width - 1}
              height={height - 1}
              x={card.pos[0] * width + 1}
              y={card.pos[1] * height + 1}
              className="tarot-card-back"
            />
          </motion.g>
        ))}
      </svg>
    </svg>
  );
});

export default AnimatedGridPattern;