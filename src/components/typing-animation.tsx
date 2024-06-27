"use client";

import React from "react";
import { cn } from "../utils";
import { useEffect, useState } from "react";

interface TypingAnimationProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

export default function TypingAnimation({
  children,
  duration = 400,
  className,
}: TypingAnimationProps) {
  const text = "Tarotmancer"; // Fixed text
  const [displayedText, setDisplayedText] = useState<string>("");

  useEffect(() => {
    const displayChars = new Array(text.length).fill(' ');
    const availableIndices = [...Array(text.length).keys()];
    
    const typingEffect = setInterval(() => {
      if (availableIndices.length > 0) {
        const randomIndexPosition = Math.floor(Math.random() * availableIndices.length);
        const insertIndex = availableIndices.splice(randomIndexPosition, 1)[0];
        
        displayChars[insertIndex] = text[insertIndex];
        setDisplayedText(displayChars.join(''));
      } else {
        clearInterval(typingEffect);
      }
    }, duration);

    return () => clearInterval(typingEffect);
  }, [duration]);

  return (
    <h1
      className={cn(
        "font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.02em] drop-shadow-sm whitespace-pre",
        className
      )}
    >
      {displayedText}
    </h1>
  );
}
