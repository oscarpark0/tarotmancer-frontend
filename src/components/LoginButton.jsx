import React from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const LoginButton = () => {
  const { login, register } = useKindeAuth() || {};

  return (
    <div className="auth-buttons">
      <button onClick={login} className="mystic-button" disabled={!login}>
        <span className="button-text">Login</span>
      </button>
      <button onClick={register} className="mystic-button" disabled={!register}>
        <span className="button-text">Join</span>
      </button>
    </div>
  );
};

export default LoginButton;