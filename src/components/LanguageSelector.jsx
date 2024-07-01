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
    'Spanish',
    'French',
    'German',
    'Italian',
    'Japanese',
    'Chinese',
    'Russian',
    'Portuguese',
    'Dutch',
    'Korean',
    'Arabic',
    'Hindi',
    'Swedish',
    'Polish',
    'Turkish',
    'Danish',
    'Norwegian',
    'Finnish',
    'Greek'
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