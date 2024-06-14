export const generateCardPositions = (numCards, width, height) => {
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
    positions.push({ left: x, top: y });
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
