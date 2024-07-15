import React, { memo } from 'react';
import { useAppContext } from '../contexts/AppContext';

const SpreadSelector = memo(() => {
  const { selectedSpread, handleSpreadSelect } = useAppContext();

  const handleChange = (event) => {
    handleSpreadSelect(event.target.value);
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