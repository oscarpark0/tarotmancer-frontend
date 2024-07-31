import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { loadTranslations, Language } from '../utils/translations';

interface LanguageContextType {
  selectedLanguage: Language;
  setSelectedLanguage: React.Dispatch<React.SetStateAction<Language>>;
  translationsLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    return (localStorage.getItem('selectedLanguage') as Language) || 'en';
  });

  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  const loadTranslationsForLanguage = useCallback(async (language: Language) => {
    await loadTranslations(language);
    setTranslationsLoaded(prev => !prev);
  }, []);

  useEffect(() => {
    const loadLanguage = async () => {
      await loadTranslationsForLanguage(selectedLanguage);
      setTranslationsLoaded(true);
    };
    loadLanguage();
  }, [selectedLanguage, loadTranslationsForLanguage]);

  useEffect(() => {
    console.log('Language context updated:', selectedLanguage);
  }, [selectedLanguage]);

  if (!translationsLoaded) {
    return <div>Loading translations...</div>;
  }

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage, translationsLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};