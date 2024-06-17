import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function Navigation() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <nav>
      {/* Other navigation items */}
      {!isAuthenticated && (
        <button onClick={() => loginWithRedirect()}>Log In</button>
      )}
    </nav>
  );
}

export default Navigation;