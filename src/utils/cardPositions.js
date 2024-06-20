export const generateCelticCrossPositions = (numCards, width, height) => {
  const positions = [];
  const radius = Math.min(width, height) * 0.35; // Adjust the radius to fit the screen
  const center = {
    x: width / 2,
    y: height / 2,
  };

  for (let i = 0; i < numCards; i++) {
    const angle = (i / numCards) * Math.PI * 2;
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);
    positions.push({ left: `${x}px`, top: `${y}px` });
  }

  return positions;
};

export const generateThreeCardPositions = (numCards, width, height) => {
  const positions = [];

  if (numCards === 3) {
    positions.push(
      { left: `${width * 0.33}px`, top: `${height * 0.3}px` },
      { left: `${width * 0.5}px`, top: `${height * 0.3}px` },
      { left: `${width * 0.67}px`, top: `${height * 0.3}px` }
    );
  }

  return positions;
};

export const cardPositions = [
  { left: 50, top: 50 },
  { left: 250, top: 50 },
  { left: 450, top: 50 },
  { left: 150, top: 200 },
  { left: 350, top: 200 },
  { left: 250, top: 350 },
];
