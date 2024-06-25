import React from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const LoginButton = () => {
  const { login, register } = useKindeAuth();

  return (
    <>
      <button onClick={login} type="button">Log In</button>
      <button onClick={register} type="button">Register</button>
    </>
  );
};

export default LoginButton;