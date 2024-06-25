import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';
import auth0 from './auth/auth0';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';

function App() {
  const [selectedSpread, setSelectedSpread] = useState('celtic');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    const checkAuth = async () => {
      const isAuth = await auth0.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        const user = await auth0.getUser();
        setUser(user);
      }
    };

    checkAuth();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSpreadSelect = (spread) => {
    setSelectedSpread(spread);
  };

  return (
    <Router>
      <div className="App">
        {isAuthenticated ? (
          <>
            <LogoutButton />
            {selectedSpread === 'celtic' ? (
              <CelticSpread
                onSpreadSelect={handleSpreadSelect}
                selectedSpread={selectedSpread}
                isMobile={isMobile}
                user={user}
              />
            ) : (
              <ThreeCardSpread
                onSpreadSelect={handleSpreadSelect}
                selectedSpread={selectedSpread}
                isMobile={isMobile}
                user={user}
              />
            )}
          </>
        ) : (
          <LoginButton />
        )}
      </div>
    </Router>
  );
}

export default App;