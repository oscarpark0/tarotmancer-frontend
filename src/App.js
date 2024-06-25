import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { KindeProvider, useKindeAuth } from "@kinde-oss/kinde-auth-react";
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';

function Routes() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { isAuthenticated } = useKindeAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="App">
      {isAuthenticated ? <LogoutButton /> : <LoginButton />}
      <Switch>
        <Route path="/celtic-spread">
          {isAuthenticated ? <CelticSpread isMobile={isMobile} /> : <Redirect to="/" />}
        </Route>
        <Route path="/three-card-spread">
          {isAuthenticated ? <ThreeCardSpread isMobile={isMobile} /> : <Redirect to="/" />}
        </Route>
        <Route exact path="/">
          {isAuthenticated ? <Redirect to="/celtic-spread" /> : <div>Welcome! Please log in or register.</div>}
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <KindeProvider
      clientId="fb31f1e47adc4650a66f09248606487b"
      domain="https://tarotmancer.kinde.com"
      redirectUri="https://tarotmancer.com"
      logoutUri="https://tarotmancer.com"
    >
      <Router>
        <Routes />
      </Router>
    </KindeProvider>
  );
}

export default App;
