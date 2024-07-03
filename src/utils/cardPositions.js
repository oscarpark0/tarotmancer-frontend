export const generateCelticCrossPositions = (numCards, width, height) => {
  const positions = [
    { left: width * 0.45, top: height * 0.3 },
    { left: width * 0.45, top: height * 0.3, transform: 'rotate(90deg)' },
    { left: width * 0.45, top: height * 0 },
    { left: width * 0.45, top: height * 0.6 },
    { left: width * 0.32, top: height * 0.3 },
    { left: width * 0.59, top: height * 0.3 },
    { left: width * 0.75, top: height * -0.03 },
    { left: width * 0.75, top: height * 0.21 },
    { left: width * 0.75, top: height * 0.44 },
    { left: width * 0.75, top: height * 0.68 },
  ];

  return positions.slice(0, numCards);
};

export const generateThreeCardPositions = (numCards, width, height) => {
  const positions = [
    { left: width * 0.25, top: height * 0.3 },
    { left: width * 0.5, top: height * 0.3 },
    { left: width * 0.75, top: height * 0.3 },
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

export const generateElementalInsightPositions = (numCards, containerWidth, containerHeight) => {
  const isMobile = containerWidth <= 768;
  const baseScale = isMobile ? 0.8 : 1;
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  const radius = Math.min(containerWidth, containerHeight) * 0.4 * baseScale;
  const positions = [];

  for (let i = 0; i < numCards; i++) {
    const angle = i * (Math.PI * 2) / numCards;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    positions.push({ left: x, top: y });
  }

  return positions;
};
