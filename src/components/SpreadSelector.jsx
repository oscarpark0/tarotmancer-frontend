import React, { memo } from 'react';
import { useLanguage } from './LanguageSelector';
import { buttonTranslations } from '../utils/translations';

const SpreadSelector = memo(({ onSpreadSelect, selectedSpread }) => {

  const { selectedLanguage } = useLanguage();

  const getTranslation = (key) => {
    if (buttonTranslations[key] && buttonTranslations[key][selectedLanguage]) {
      return buttonTranslations[key][selectedLanguage];
    }
    return buttonTranslations[key]['English'] || key;
  };

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