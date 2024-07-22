import React from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useLanguage } from './LanguageSelector';
import { buttonTranslations } from '../utils/translations';

const LoginButton = () => {
  const { login } = useKindeAuth();
  const { selectedLanguage } = useLanguage();

  const getTranslation = (key) => {
    return buttonTranslations[key][selectedLanguage] || buttonTranslations[key]['English'] || key;
  };

  return (
    <button onClick={() => login()} className="mystic-button">
      <span className="button-text">{getTranslation('login')}</span>
    </button>
  );
};

export default LoginButton;