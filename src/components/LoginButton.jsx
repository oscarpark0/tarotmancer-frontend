import React from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const LoginButton = () => {
  const { login } = useKindeAuth();

  const handleLogin = () => {
    if (login) {
      login();
    } else {
      console.error('Login function is not available');
      // Consider showing an error message to the user
    }
  };

  return (
    <button onClick={handleLogin} className="mystic-button">
      <span className="button-text">Login</span>
    </button>
  );
};

export default LoginButton;
