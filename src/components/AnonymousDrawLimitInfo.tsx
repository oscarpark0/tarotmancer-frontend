import React from 'react';
import { useTranslation } from '../utils/translations';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

interface AnonymousDrawLimitInfoProps {
  className?: string;
}

const AnonymousDrawLimitInfo: React.FC<AnonymousDrawLimitInfoProps> = ({ 
  className = ''
}) => {
  const { getTranslation } = useTranslation();
  const { login } = useKindeAuth();

  // Handle signup/login click
  const handleSignupClick = () => {
    if (login) {
      login();
    } else {
      console.error('Login function not available');
      // Fallback to redirect to login page
      window.location.href = '/login';
    }
  };

  return (
    <div className={`anonymous-limit-info ${className}`}>
      <div className="limit-info-text">
        {getTranslation('anonymousDrawLimit')}
      </div>
      <button 
        className="limit-info-button"
        onClick={handleSignupClick}
      >
        {getTranslation('login')}
      </button>
    </div>
  );
};

export default AnonymousDrawLimitInfo;