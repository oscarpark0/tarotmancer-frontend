import React from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useTranslation } from '../utils/translations';
import { useLanguage } from '../contexts/LanguageContext'; // Import useLanguage

const LogoutButton = () => {
  const { logout } = useKindeAuth();
  const { getTranslation } = useTranslation();
  useLanguage(); // Use useLanguage hook

  const handleLogout = () => {
    // Store the current drawCount and lastResetTime in sessionStorage
    const drawCount = localStorage.getItem('drawCount');
    const lastResetTime = localStorage.getItem('lastResetTime');
    sessionStorage.setItem('prevDrawCount', drawCount || '0');
    sessionStorage.setItem('prevLastResetTime', lastResetTime || Date.now().toString());

    if (localStorage.getItem('guestId')) {
      localStorage.removeItem('guestId');
    } else if (logout) {
      logout();
    } else {
      console.error('Logout function is not available');
      alert(getTranslation('logoutUnavailable'));
      return;
    }

    window.location.href = '/';
  };

  return (
    <button onClick={handleLogout} className="mystic-button">
      <span className="button-text">{getTranslation('logout')}</span>
    </button>
  );
};

export default LogoutButton;