import React from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useTranslation } from '../utils/translations';
import { useLanguage } from '../contexts/LanguageContext'; // Import useLanguage

const LoginButton = () => {
  const { login } = useKindeAuth();
  const { getTranslation } = useTranslation();
  useLanguage(); // Use useLanguage hook

  return (
    <button onClick={() => login()} className="mystic-button">
      <span className="button-text">{getTranslation('login')}</span>
    </button>
  );
};

export default LoginButton;