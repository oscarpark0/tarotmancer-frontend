import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { cn } from '../utils';
import { motion } from 'framer-motion';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import debounce from 'lodash.debounce';
import './AnimatedGridPattern.css';

const tarotCards = [
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

const debounceResizeHandler = debounce((entries, setDimensions) => {
  for (let entry of entries) {
    const { width, height } = entry.contentRect;
    setDimensions({ width, height });
  }
}, 200);

const getRandomValue = (min, max) => Math.random() * (max - min) + min;

const AnimatedGridPattern = ({
  width = 22,
  height = 42,
  x = -1,
  y = -1,
  strokeDasharray = 19,
  strokeOpacity = 1,
  numCards = 25,
  className,
  maxOpacity = 0.9,
  duration = 6,
  repeatDelay = 10,
  ...props
}) => {
  const id = useId();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const getPos = useCallback(() => {
    return [
      Math.floor((Math.random() * dimensions.width) / width),
      Math.floor((Math.random() * dimensions.height) / height),
    ];
  }, [dimensions.width, dimensions.height, width, height]);

  const generateCards = useCallback((count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      pos: getPos(),
    }));
  }, [getPos]);

  const [cards, setCards] = useState(() => generateCards(numCards));

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => debounceResizeHandler(entries, setDimensions));
    const currentContainer = containerRef.current;

    if (currentContainer) {
      resizeObserver.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        resizeObserver.unobserve(currentContainer);
      }
    };
  }, []);

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setCards(generateCards(numCards));
    }
  }, [dimensions, numCards, generateCards]);

  const updateSquarePosition = useCallback((id) => {
    setCards((currentSquares) =>
      currentSquares.map((sq) =>
        sq.id === id
          ? {
              ...sq,
              pos: getPos(),
            }
          : sq,
      ),
    );
  }, [getPos]);

  const cardVariants = {
    initial: { opacity: 0, rotateY: 0, scale: 1, z: 0 },
    animate: (custom) => ({
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
  };

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none relative inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30',
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.3333 ${height}V.444H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {cards.map(({ pos: [x, y], id }) => {
          const uniqueKey = `${id}-${x}-${y}`;
          const randomScale = getRandomValue(0.5, 2.0);
          const randomOpacity = Math.random() * maxOpacity;
          const randomTarotCard = tarotCards[Math.floor(Math.random() * tarotCards.length)];
          const tarotCardImage = `${TAROT_IMAGE_BASE_URL}/${randomTarotCard}`;
          const cardBackImage = `${TAROT_IMAGE_BASE_URL}/cardback.webp`;

          return (
            <motion.g
              key={uniqueKey}
              custom={{ id, randomOpacity, randomScale }}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              onAnimationComplete={() => {
                setTimeout(() => {
                  updateSquarePosition(id);
                }, 10000 + getRandomValue(0, 100));
              }}
              className="preserve-3d"
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'center',
                perspective: '1000px',
              }}
            >
              <motion.image
                href={tarotCardImage}
                width={width - 1}
                height={height - 1}
                x={x * width + 1}
                y={y * height + 1}
                className="tarot-card"
              />
              <motion.image
                href={cardBackImage}
                width={width - 1}
                height={height - 1}
                x={x * width + 1}
                y={y * height + 1}
                className="tarot-card-back"
              />
            </motion.g>
          );
        })}
      </svg>
    </svg>
  );
};

export default React.memo(AnimatedGridPattern);