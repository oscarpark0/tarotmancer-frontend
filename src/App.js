import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import SubscribeButton from './components/SubscribeButton.tsx';
import AnimatedGridPattern from './components/AnimatedGridPattern';
import './App.css';
import { useMediaQuery } from 'react-responsive';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { isAuthenticated, user } = useKindeAuth();
  const isMobileScreen = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const memoizedHeader = useMemo(() => (
    (!isMobileScreen || !user) && (
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">TarotMancer</h1>
          <div className="auth-container">
            {user ? (
              <>
                <SubscribeButton />
                <LogoutButton />
              </>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </header>
    )
  ), [isMobileScreen, user]);

  const memoizedWelcomeMessage = useMemo(() => (
    <div className="welcome-message">
      <AnimatedGridPattern className="absolute inset-0 z-0" />
      <div className="relative z-10">
        <h2>Welcome to TarotMancer</h2>
        <p>Please log in to continue.</p>
        <LoginButton />
      </div>
    </div>
  ), []);

  return (
    <Router>
      <div className="App">
        {memoizedHeader}
        <Routes>
          <Route path="/celtic-spread" element={
            isAuthenticated ? <CelticSpread isMobile={isMobile} /> : <Navigate to="/" />
          } />
          <Route path="/three-card-spread" element={
            isAuthenticated ? <ThreeCardSpread isMobile={isMobile} /> : <Navigate to="/" />
          } />
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/celtic-spread" /> : memoizedWelcomeMessage
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;