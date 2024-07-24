"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils";
import { TAROT_IMAGE_BASE_URL } from "../utils/config";
import "./TypingAnimation.css";

interface TypingAnimationProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

const tarotCards: string[] = [
  'c01.webp', 'c02.webp', 'c03.webp', 'c04.webp', 'c05.webp', 'c06.webp', 'c07.webp', 'c08.webp', 'c09.webp', 'c10.webp',
  'c11.webp', 'c12.webp', 'c13.webp', 'c14.webp', 'm00.webp', 'm01.webp', 'm02.webp', 'm03.webp', 'm04.webp', 'm05.webp',
  'm06.webp', 'm07.webp', 'm08.webp', 'm09.webp', 'm10.webp', 'm11.webp', 'm12.webp', 'm13.webp', 'm14.webp', 'm15.webp',
  'm16.webp', 'm17.webp', 'm18.webp', 'm19.webp', 'm20.webp', 'm21.webp', 'p01.webp', 'p02.webp', 'p03.webp', 'p04.webp',
  'p05.webp', 'p06.webp', 'p07.webp', 'p08.webp', 'p09.webp', 'p10.webp', 'p11.webp', 'p12.webp', 'p13.webp', 'p14.webp',
  's01.webp', 's02.webp', 's03.webp', 's04.webp', 's05.webp', 's06.webp', 's07.webp', 's08.webp', 's09.webp', 's10.webp',
  's11.webp', 's12.webp', 's13.webp', 's14.webp', 'w01.webp', 'w02.webp', 'w03.webp', 'w04.webp', 'w05.webp', 'w06.webp',
  'w07.webp', 'w08.webp', 'w09.webp', 'w10.webp', 'w11.webp', 'w12.webp', 'w13.webp', 'w14.webp'
];

export default function TypingAnimation({
  children,
  duration = 10000,
  className,
}: TypingAnimationProps) {
  const text = "Tarotmancer";
  const [displayedText, setDisplayedText] = useState<string[]>(new Array(text.length).fill(' '));
  const [flippedLetters, setFlippedLetters] = useState<boolean[]>(new Array(text.length).fill(false));
  const [flippedCards, setFlippedCards] = useState<boolean[]>(new Array(text.length).fill(false));
  const [stage, setStage] = useState<'typing' | 'flippingLetters' | 'flippingCards' | 'flippingBack' | 'done'>('typing');

  // Pre-select random cards for each position
  const selectedCards = useMemo(() => {
    return Array.from({ length: text.length }, () => tarotCards[Math.floor(Math.random() * tarotCards.length)]);
  }, []);

  // Typing effect
  useEffect(() => {
    if (stage === 'typing') {
      const typingEffect = setInterval(() => {
        setDisplayedText(prev => {
          const newDisplay = [...prev];
          const emptyIndex = newDisplay.findIndex(char => char === ' ');
          if (emptyIndex !== -1) {
            newDisplay[emptyIndex] = text[emptyIndex];
            return newDisplay;
          }
          clearInterval(typingEffect);
          setStage('flippingLetters');
          return prev;
        });
      }, duration * 2);

      return () => clearInterval(typingEffect);
    }
  }, [text, duration, stage]);

  // Flip letters to reveal card backs
  useEffect(() => {
    if (stage === 'flippingLetters') {
      const flipLetters = setInterval(() => {
        setFlippedLetters(prev => {
          const newFlippedLetters = [...prev];
          const unflippedIndex = newFlippedLetters.findIndex(flipped => !flipped);
          if (unflippedIndex !== -1) {
            newFlippedLetters[unflippedIndex] = true;
            return newFlippedLetters;
          }
          clearInterval(flipLetters);
          setStage('flippingCards');
          return prev;
        });
      }, duration * 2);

      return () => clearInterval(flipLetters);
    }
  }, [duration, stage]);

  // Flip cards to reveal card fronts
  useEffect(() => {
    if (stage === 'flippingCards') {
      const flipCards = setInterval(() => {
        setFlippedCards(prev => {
          const newFlippedCards = [...prev];
          const unflippedIndex = newFlippedCards.findIndex(flipped => !flipped);
          if (unflippedIndex !== -1) {
            newFlippedCards[unflippedIndex] = true;
            return newFlippedCards;
          }
          clearInterval(flipCards);
          setTimeout(() => setStage('flippingBack'), duration * 2); // Add a pause before flipping back
          return prev;
        });
      }, duration * 2);

      return () => clearInterval(flipCards);
    }
  }, [duration, stage]);

  // New effect: Flip cards back to reveal text
  useEffect(() => {
    if (stage === 'flippingBack') {
      const flipBack = setInterval(() => {
        setFlippedLetters(prev => {
          const newFlippedLetters = [...prev];
          const flippedIndex = newFlippedLetters.findIndex(flipped => flipped);
          if (flippedIndex !== -1) {
            newFlippedLetters[flippedIndex] = false;
            return newFlippedLetters;
          }
          clearInterval(flipBack);
          setStage('done');
          return prev;
        });
      }, duration * 4);

      return () => clearInterval(flipBack);
    }
  }, [duration, stage]);

  return (
    <h1
      className={cn(
        "font-display text-center text-4xl font-bold leading-[1rem] tracking-[-0.02em] drop-shadow-sm",
        className
      )}
    >
      {displayedText.map((char, index) => (
        <AnimatePresence key={index}>
          <motion.span
            className={`typing-animation-char ${flippedLetters[index] ? 'flipped' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="letter">{char}</span>
            <div className={`card-wrapper ${flippedCards[index] ? 'flipped' : ''}`}>
              <div
                className="card-back"
                style={{
                  backgroundImage: `url(${TAROT_IMAGE_BASE_URL}/cardback.webp)`,
                }}
              />
              <div
                className="card-front"
                style={{
                  backgroundImage: `url(${TAROT_IMAGE_BASE_URL}/${selectedCards[index]})`,
                }}
              />
            </div>
          </motion.span>
        </AnimatePresence>
      ))}
    </h1>
  );
}