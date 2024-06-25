import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { KindeProvider, useKindeAuth } from "@kinde-oss/kinde-auth-react";
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';

function AppRoutes() {
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
      <Routes>
        <Route path="/celtic-spread" element={
          isAuthenticated ? <CelticSpread isMobile={isMobile} /> : <Navigate to="/" />
        } />
        <Route path="/three-card-spread" element={
          isAuthenticated ? <ThreeCardSpread isMobile={isMobile} /> : <Navigate to="/" />
        } />
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/celtic-spread" /> : <div>Welcome! Please log in or register.</div>
        } />
      </Routes>
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
        <AppRoutes />
      </Router>
    </KindeProvider>
  );
}

export default App;
