import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated ? (
          <>
            <LogoutButton />
            <Switch>
              <Route path="/celtic-spread">
                <CelticSpread isMobile={isMobile} />
              </Route>
              <Route path="/three-card-spread">
                <ThreeCardSpread isMobile={isMobile} />
              </Route>
              <Redirect from="/" to="/celtic-spread" />
            </Switch>
          </>
        ) : (
          <LoginButton />
        )}
      </div>
    </Router>
  );
}

export default App;