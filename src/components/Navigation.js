import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import SignUp from './SignUp';
import Login from './Login';

function Navigation() {
  const { isAuthenticated } = useAuth0();

  return (
    <nav>
      {/* Other navigation items */}
      {!isAuthenticated && (
        <>
          <SignUp />
            
          <Login />
        </>
      )}
    </nav>
  );
}

export default Navigation;