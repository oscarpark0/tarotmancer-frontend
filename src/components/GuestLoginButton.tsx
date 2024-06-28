import React from 'react';

interface GuestLoginButtonProps {
  onGuestLogin: () => void;
}

const GuestLoginButton: React.FC<GuestLoginButtonProps> = ({ onGuestLogin }) => {
  return (
    <button 
      onClick={onGuestLogin}
      className="mystic-button guest-login-button"
    >
      <span className="button-text">Guest Login</span>
    </button>
  );
};

export default GuestLoginButton;