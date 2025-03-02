import React from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useTranslation } from '../utils/translations';
import { useLanguage } from '../contexts/LanguageContext';

const LoginButton: React.FC = () => {
  const { login } = useKindeAuth();
  const { getTranslation } = useTranslation();
  useLanguage();

  const handleLogin = (): void => {
    try {
      // Call login with no parameters - the redirect URI is already set in the KindeProvider
      login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <button onClick={handleLogin} className="mystic-button">
      <span className="button-text">{getTranslation('login')}</span>
    </button>
  );
};

export default LoginButton;