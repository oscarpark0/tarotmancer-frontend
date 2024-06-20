// components/SpreadSelector.jsx
import React from 'react';

const SpreadSelector = ({ onSpreadSelect }) => {
  const handleChange = (event) => {
    onSpreadSelect(event.target.value);
  };

  return (
    <div className="spread-selector">
      <select onChange={handleChange}>
        <option value="celtic">Celtic Spread</option>
        <option value="threeCard">Three Card Spread</option>
      </select>
    </div>
  );
};

export default SpreadSelector;