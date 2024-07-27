import React, { memo } from 'react';
import { useTranslation } from '../utils/translations';

const SpreadSelector = memo(({ onSpreadSelect, selectedSpread }) => {
  const { getTranslation } = useTranslation();

  return (
    <div className="spread-selector">
      <select onChange={(e) => onSpreadSelect(e.target.value)} value={selectedSpread}>
        <option value="threeCard">{getTranslation('threeCardSpread')}</option>
        <option value="celtic">{getTranslation('celticCrossSpread')}</option>
      </select>
    </div>
  );
});

export default SpreadSelector;