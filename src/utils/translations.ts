import { useLanguage } from '../contexts/LanguageContext';
import { useMemo } from 'react';

export type Language = 'ar' | 'da' | 'de' | 'el' | 'en' | 'es' | 'fi' | 'fr' | 'hi' | 'it' | 'ja' | 'ko' | 'nl' | 'no' | 'pl' | 'pt' | 'ru' | 'sv' | 'tl' | 'tr' | 'zh';

export const languageNames: Record<Language, string> = {
  ar: 'العربية',
  da: 'Dansk',
  de: 'Deutsch',
  el: 'Ελληνικά',
  en: 'English',
  es: 'Español',
  fi: 'Suomi',
  fr: 'Français',
  hi: 'हिन्दी',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  nl: 'Nederlands',
  no: 'Norsk',
  pl: 'Polski',
  pt: 'Português',
  ru: 'Русский',
  sv: 'Svenska',
  tl: 'Filipino',
  tr: 'Türkçe',
  zh: '中文'
};

export type TranslationKey = 'login' | 'logout' | 'subscribe' | 'subscribing' | 'updatesAndWeeklyReadings' | 'signupDescription' | 'firstName' | 'email' | 'signUp' | 'processing' | 'errorMessage' | 'inputPlaceholder' | 'draw' | 'drawCardsAriaLabel' | 'drawing' | 'nextDrawAvailable' | 'waitForNextDraw' | 'nextDrawIn' | 'pastDraws' | 'backToList' | 'noResponseAvailable' | 'threeCardSpread' | 'celticCrossSpread' | 'removeDraw' | 'timeRemainingUntilNextDraw' | 'tarotmancer' | 'closeModal' | 'terms' | 'privacy' | 'contact' | 'resources' | 'dailyFrequencies' | 'checkNetworkAndTryAgain' | 'failedToDrawSpread' | 'logoutUnavailable' | 'mostCommonCardAt' | 'orientation' | 'selectLanguage' | 'feedback' | 'closeFeedbackForm' | 'provideFeedback' | 'enterFeedbackHere' | 'submitting' | 'submitFeedback' | 'feedbackSubmittedSuccess' | 'feedbackSubmitError' | 'completeCaptchaFirst' | 'confirmRemoveDraw' | 'yes' | 'no' | 'howItWorks' | 'dailyTarotCardFrequencies' | 'frequenciesDescription' | 'chooseDate' | 'mostCommonCardOccurrencesByPosition' | 'celticCrossSpread' | 'threeCardSpread' | 'individualCardFrequencies' | 'loading' | 'remaining' | 'remainingDrawsToday';

export const buttonTranslations: Partial<Record<Language, Partial<Record<TranslationKey, string>>>> = {
  ar: {},
  da: {},
  de: {},
  el: {},
  en: {},
  es: {},
  fi: {},
  fr: {},
  hi: {},
  it: {},
  ja: {},
  ko: {},
  nl: {},
  no: {},
  pl: {},
  pt: {},
  ru: {},
  sv: {},
  tl: {},
  tr: {},
  zh: {},
};

export const loadTranslations = async (language: Language) => {
  try {
    const module = await import(`./translations/${language}.json`);
    buttonTranslations[language] = module.default as Record<TranslationKey, string>;
  } catch (error) {
    console.error(`Failed to load translations for ${language}:`, error);
    // Fall back to English translations
    if (language !== 'en') {
      await loadTranslations('en');
    } else {
      console.error('Failed to load English translations as fallback');
    }
  }
};

export const useTranslation = () => {
  const { selectedLanguage } = useLanguage();

  const getTranslation = useMemo(() => (key: TranslationKey) => {
    if (!(selectedLanguage in buttonTranslations)) {
      console.warn(`Language "${selectedLanguage}" not found, falling back to English.`);
      return (buttonTranslations['en'] as Record<TranslationKey, string>)[key] || key;
    }
    
    const translation = (buttonTranslations[selectedLanguage] as Record<TranslationKey, string>)[key];
    if (!translation) {
      console.warn(`Translation for key "${key}" in language "${selectedLanguage}" not found, falling back to English.`);
      return (buttonTranslations['en'] as Record<TranslationKey, string>)[key] || key;
    }
    return translation;
  }, [selectedLanguage]);

  return { getTranslation, selectedLanguage };
};

// Initialize translations for all languages
export const initializeTranslations = async () => {
  const languages: Language[] = ['ar', 'da', 'de', 'el', 'en', 'es', 'fi', 'fr', 'hi', 'it', 'ja', 'ko', 'nl', 'no', 'pl', 'pt', 'ru', 'sv', 'tl', 'tr', 'zh'];
  
  for (const language of languages) {
    await loadTranslations(language);
  }
};