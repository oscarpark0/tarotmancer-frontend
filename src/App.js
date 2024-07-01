import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import SubscribeButton from './components/SubscribeButton.tsx';
import AnimatedGridPattern from './components/AnimatedGridPattern.tsx';
import TypingAnimation from './components/typing-animation.tsx';
import LanguageSelector, { LanguageProvider } from './components/LanguageSelector';
import './App.css';
import { useMediaQuery } from 'react-responsive';

function App() {
  const kindeAuth = useKindeAuth();
  const isAuthenticated = kindeAuth?.isAuthenticated ?? false;

  useEffect(() => {
    // Handle the authentication callback
    if (window.location.search.includes('code=') && kindeAuth?.handleRedirectCallback) {
      kindeAuth.handleRedirectCallback().catch(error => {
        console.error('Authentication callback error:', error);
        // Consider displaying this error to the user
      });
    }
  }, [kindeAuth]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const isMobileScreen = useMediaQuery({ maxWidth: 767 });
  const [selectedSpread, setSelectedSpread] = useState('celtic');
  const [drawCount, setDrawCount] = useState(0);
  const [lastResetTime, setLastResetTime] = useState(Date.now());
  const [canAccessCohere, setCanAccessCohere] = useState(false);

  const handleSpreadSelect = useCallback((spread) => {
    setSelectedSpread(spread);
  }, []);

  useEffect(() => {
    const storedCount = localStorage.getItem('drawCount');
    const storedResetTime = localStorage.getItem('lastResetTime');
    if (storedCount && storedResetTime) {
      setDrawCount(parseInt(storedCount, 10));
      setLastResetTime(parseInt(storedResetTime, 10));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('drawCount', drawCount.toString());
    localStorage.setItem('lastResetTime', lastResetTime.toString());
  }, [drawCount, lastResetTime]);

  const incrementDrawCount = useCallback(() => {
    const now = Date.now();
    if (now - lastResetTime >= 24 * 60 * 60 * 1000) {
      setDrawCount(1);
      setLastResetTime(now);
    } else {
      setDrawCount(prevCount => prevCount + 1);
    }
  }, [lastResetTime]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const memoizedHeader = useMemo(() => (
    (!isMobileScreen || !isAuthenticated) && (
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">TarotMancer</h1>
          <div className="auth-container">
            {isAuthenticated ? (
              <>
                <LanguageSelector />
                <SubscribeButton />
                <LogoutButton />
              </>
            ) : (
              <>
                <LanguageSelector />
                <LoginButton />
              </>
            )}
          </div>
        </div>
      </header>
    )
  ), [isMobileScreen, isAuthenticated]);

  const memoizedWelcomeMessage = useMemo(() => (
    <div className="welcome-message">
      <AnimatedGridPattern className="absolute inset-0 z-0" />
      <div className="relative z-10 welcome-content">
        <div className="animation-container">
          <TypingAnimation duration={100}>TarotMancer</TypingAnimation>
        </div>
        <LoginButton />
      </div>
    </div>
  ), []);

  const spreadProps = useMemo(() => ({
    isMobile,
    onSpreadSelect: handleSpreadSelect,
    selectedSpread,
    drawCount,
    incrementDrawCount,
    setDrawCount,
    setLastResetTime,
    canAccessCohere,
    setCanAccessCohere,
    kindeAuth,
  }), [isMobile, handleSpreadSelect, selectedSpread, drawCount, incrementDrawCount, canAccessCohere, kindeAuth]);

  useEffect(() => {
    // Check if Plausible is loaded
    if (window.plausible) {
      // Track a custom event
      window.plausible('appLoaded');
    }
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <div className={`App main-content ${isMobileScreen ? 'mobile' : ''}`} style={{ height: '100vh', overflow: 'hidden' }}>
          {memoizedHeader}
          <Routes>
            <Route path="/celtic-spread" element={
              isAuthenticated ? (
                <CelticSpread {...spreadProps} />
              ) : <Navigate to="/" />
            } />
            <Route path="/three-card-spread" element={
              isAuthenticated ? (
                <ThreeCardSpread {...spreadProps} />
              ) : <Navigate to="/" />
            } />
            <Route path="/" element={
              isAuthenticated ? (
                <Navigate to={selectedSpread === 'celtic' ? "/celtic-spread" : "/three-card-spread"} />
              ) : memoizedWelcomeMessage
            } />
            <Route path="/callback" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
