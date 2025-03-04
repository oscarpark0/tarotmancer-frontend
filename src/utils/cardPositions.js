export const generateCelticCrossPositions = (numCards, width, height) => {
  // Create a consistent layout that works on all screen sizes
  const center = width * 0.5;
  const verticalCenter = height * 0.25;
  
  // Standard layout for Celtic Cross - matches CSS positions for consistency
  const positions = [
    // Center card
    { left: center - 62.5, top: verticalCenter + 70 },
    // Crossing card
    { left: center - 62.5, top: verticalCenter + 70, transform: 'rotate(90deg)' },
    // Below center
    { left: center - 62.5, top: verticalCenter + 220 },
    // Above center
    { left: center - 62.5, top: verticalCenter - 80 },
    // Left of center
    { left: center - 250, top: verticalCenter + 70 },
    // Right of center
    { left: center + 125, top: verticalCenter + 70 },
    // Staff positions - right column
    { left: center + 300, top: verticalCenter - 80 },
    { left: center + 300, top: verticalCenter + 20 },
    { left: center + 300, top: verticalCenter + 120 },
    { left: center + 300, top: verticalCenter + 220 },
  ];

  return positions.slice(0, numCards);
};

export const generateThreeCardPositions = (numCards, width, height) => {
  // Create a more spread out position for the three cards
  const center = width * 0.5;
  const cardSpacing = Math.min(width * 0.2, 250); // More consistent spacing between cards
  
  const positions = [
    { left: center - cardSpacing, top: height * 0.25 },
    { left: center, top: height * 0.25 },
    { left: center + cardSpacing, top: height * 0.25 },
  ];

  return positions.slice(0, numCards);
};

export const cardPositions = [
  { left: 50, top: 50 },
  { left: 250, top: 50 },
  { left: 450, top: 50 },
  { left: 150, top: 200 },
  { left: 350, top: 200 },
  { left: 250, top: 350 },
];