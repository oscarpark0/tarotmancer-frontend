import React from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const LogoutButton = () => {
  const { logout } = useKindeAuth();

  return (
    <button onClick={logout} className="mystic-button">
      <span className="button-text">Leave the Realm</span>
    </button>
  );
};

export default LogoutButton;