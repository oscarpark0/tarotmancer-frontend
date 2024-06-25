import React from 'react';

const SpreadSelector = ({ onSpreadSelect, selectedSpread }) => {
  console.log('SpreadSelector rendering:', { selectedSpread }); 

  const handleChange = (event) => {
    onSpreadSelect(event.target.value);
  };

  return (
    <div className="spread-selector">
      <select onChange={handleChange} value={selectedSpread}>
        <option value="celtic">Celtic Cross Spread</option>
        <option value="threeCard">Three Card Spread</option>
      </select>
    </div>
  );
};

export default SpreadSelector;