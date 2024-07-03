import React, { memo } from 'react';

const SpreadSelector = memo(({ onSpreadSelect, selectedSpread }) => {

  const handleChange = (event) => {
    onSpreadSelect(event.target.value);
  };

  return (
    <div className="spread-selector">
      <select onChange={handleChange} value={selectedSpread}>
        <option value="threeCard">Three Card Spread</option>
        <option value="celtic">Celtic Cross Spread</option>
      </select>
    </div>
  );
});

export default SpreadSelector;
