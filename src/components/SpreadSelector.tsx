import React, { memo } from 'react';
import { useTranslation, TranslationKey } from '../utils/translations';

type SpreadType = 'threeCard' | 'celtic';

interface SpreadSelectorProps {
  onSpreadSelect: (spread: SpreadType) => void;
  selectedSpread: SpreadType;
}

const SpreadSelector: React.FC<SpreadSelectorProps> = memo(({ onSpreadSelect, selectedSpread }) => {
  const { getTranslation } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSpreadSelect(e.target.value as SpreadType);
  };

  return (
    <div className="spread-selector">
      <select onChange={handleChange} value={selectedSpread}>
        <option value="threeCard">{getTranslation('threeCardSpread')}</option>
        <option value="celtic">{getTranslation('celticCrossSpread')}</option>
      </select>
    </div>
  );
});

export default SpreadSelector;