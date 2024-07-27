import React, { memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language, languageNames } from '../utils/translations';

const LanguageSelector: React.FC = memo(() => {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();

  const languages: Language[] = [
    'ar', 'da', 'de', 'el', 'en', 'es', 'fi', 'fr', 'hi', 'it',
    'ja', 'ko', 'nl', 'no', 'pl', 'pt', 'ru', 'sv', 'tr', 'zh'
  ];

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value as Language);
  };

  return (
    <div className="language-selector">
      <select onChange={handleChange} value={selectedLanguage}>
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {languageNames[lang]}
          </option>
        ))}
      </select>
    </div>
  );
});

export default LanguageSelector;