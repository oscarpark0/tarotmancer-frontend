import React from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const LoginButton = () => {
  const { login, register } = useKindeAuth() || {};

  const [errorMessage, setErrorMessage] = React.useState('');

  const handleLogin = () => {
    if (login) {
      login();
    } else {
      console.error('Login function is not available');
      setErrorMessage('Login is currently unavailable. Please try again later.');
      // Clear the error message after 5 seconds
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleRegister = () => {
    if (register) {
      register();
    } else {
      console.error('Register function is not available');
      // Consider showing an error message to the user
    }
  };

  return (
    <div className="auth-buttons">
      <button onClick={handleLogin} className="mystic-button" disabled={!login}>
        <span className="button-text">Login</span>
      </button>
      <button onClick={handleRegister} className="mystic-button" disabled={!register}>
        <span className="button-text">Join</span>
      </button>
    </div>
  );
};

export default LoginButton;