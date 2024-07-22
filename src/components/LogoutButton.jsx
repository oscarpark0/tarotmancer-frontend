import React, { useContext } from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { LanguageContext } from './LanguageSelector';
import { buttonTranslations } from '../utils/translations';

const LogoutButton = () => {
  const { logout } = useKindeAuth();
  const { selectedLanguage } = useContext(LanguageContext);

  const getTranslation = (key) => {
    return buttonTranslations[key][selectedLanguage] || buttonTranslations[key]['English'];
  };

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