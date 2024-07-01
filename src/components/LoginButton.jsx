import React, { useContext } from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { LanguageContext } from './LanguageSelector';
import { buttonTranslations } from '../utils/translations';

const LoginButton = () => {
  const { login } = useKindeAuth();
  const { selectedLanguage } = useContext(LanguageContext);

  const handleLogin = () => {
    if (login) {
      login();
    } else {
      console.error('Login function is not available');
      alert('Login is currently unavailable. Please try again later.');
    }
  };

  return (
    <button onClick={handleLogin} className="mystic-button">
      <span className="button-text">{buttonTranslations.login[selectedLanguage]}</span>
    </button>
  );
};

export default LoginButton;
