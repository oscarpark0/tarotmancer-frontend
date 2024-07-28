import React from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useTranslation } from '../utils/translations';
import { useLanguage } from '../contexts/LanguageContext';

const LoginButton = () => {
  const { login } = useKindeAuth();
  const { getTranslation } = useTranslation();
  useLanguage();

  const handleLogin = () => {
    login({
      authorizationParams: {
        redirect_uri: `${window.location.origin}/kinde_callback`
      }
    });
  };

  return (
    <button onClick={handleLogin} className="mystic-button">
      <span className="button-text">{getTranslation('login')}</span>
    </button>
  );
};

export default LoginButton;