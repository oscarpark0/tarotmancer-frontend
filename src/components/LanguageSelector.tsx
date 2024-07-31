import React, { memo, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language, languageNames } from '../utils/translations';

const LanguageSelector: React.FC = memo(() => {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();

  const handleChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value as Language;
    setSelectedLanguage(newLanguage);
    // Force a re-render of the entire app
    window.dispatchEvent(new Event('languageChange'));
  }, [setSelectedLanguage]);

  return (
    <div className="language-selector">
      <select onChange={handleChange} value={selectedLanguage}>
        {Object.entries(languageNames).map(([lang, name]) => (
          <option key={lang} value={lang}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
});

export default LanguageSelector;