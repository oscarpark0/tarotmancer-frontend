import React from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const LogoutButton = () => {
  const { logout } = useKindeAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/'; 
  };

  return (
    <button onClick={handleLogout} className="mystic-button">
      <span className="button-text">Logout</span>
    </button>
  );
};

export default LogoutButton;