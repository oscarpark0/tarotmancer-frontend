import React from 'react';
import { useTranslation } from '../utils/translations';
import { useNavigate } from 'react-router-dom';

const GuestLoginButton: React.FC = () => {
  const { getTranslation } = useTranslation();
  const navigate = useNavigate();

  const handleGuestLogin = (): void => {
    try {
      // Generate a guest ID if one doesn't exist
      let anonymousUserId = localStorage.getItem('anonymousUserId');
      if (!anonymousUserId) {
        anonymousUserId = `anon_${window.crypto.randomUUID()}`;
        localStorage.setItem('anonymousUserId', anonymousUserId);
      }
      
      // Set flag to indicate user has explicitly logged in as guest
      localStorage.setItem('guestLoggedIn', 'true');
      
      // Navigate to the main page
      navigate('/');
      
      // Force a page reload to ensure the app recognizes the guest user
      window.location.reload();
    } catch (error) {
      console.error('Guest login error:', error);
    }
  };

  return (
    <button onClick={handleGuestLogin} className="mystic-button guest-button">
      <span className="button-text">☽ {getTranslation('continueAsGuest')} ☽</span>
    </button>
  );
};

export default GuestLoginButton;