// components/SpreadSelector.jsx
import React from 'react';

const SpreadSelector = ({ onSpreadSelect }) => {
  return (
    <div className="spread-selector">
      <button onClick={() => onSpreadSelect('threeCard')}>Three Card Spread</button>
      <button onClick={() => onSpreadSelect('celtic')}>Celtic Spread</button>
    </div>
  );
};

export default SpreadSelector;