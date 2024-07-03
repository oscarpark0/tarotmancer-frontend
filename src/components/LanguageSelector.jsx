
import React, { memo, createContext, useContext, useState } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

const LanguageSelector = memo(() => {
  const { selectedLanguage, setSelectedLanguage } = useContext(LanguageContext);

  const languages = [
    'English',
    'Español',
    'Français',
    'Deutsch',
    'Italiano',
    '日本語',
    '中文',
    'Русский',
    'Português',
    'Nederlands',
    '한국어',
    'العربية',
    'हिन्दी',
    'Svenska',
    'Polski',
    'Türkçe',
    'Dansk',
    'Norsk',
    'Suomi',
    'Ελληνικά'
  ];

  const handleChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  return (
    <div className="language-selector">
      <select onChange={handleChange} value={selectedLanguage}>
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
});

export default LanguageSelector;
