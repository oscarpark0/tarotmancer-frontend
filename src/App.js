import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import SubscribeButton from './components/SubscribeButton.tsx';
import AnimatedGridPattern from './components/AnimatedGridPattern.tsx';
import TypingAnimation from './components/typing-animation.tsx';
import LanguageSelector, { LanguageProvider } from './components/LanguageSelector';
import DarkModeToggle from './components/DarkModeToggle.tsx';
import './App.css';
import { useMediaQuery } from 'react-responsive';

const CelticSpread = lazy(() => import('./CelticSpread'));
const ThreeCardSpread = lazy(() => import('./ThreeCardSpread'));

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
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prevMode => !prevMode);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

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
            <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            {isAuthenticated ? (
              <>
                <div className="header-language-selector">
                  <LanguageSelector />
                </div>
                <SubscribeButton />
                <LogoutButton />
              </>
            ) : (
              <>
                <div className="header-language-selector">
                  <LanguageSelector />
                </div>
                <LoginButton />
              </>
            )}
          </div>
        </div>
      </header>
    )
  ), [isMobileScreen, isAuthenticated, isDarkMode, toggleDarkMode]);

  const memoizedWelcomeMessage = useMemo(() => (
    <div className="welcome-message">
      <AnimatedGridPattern className="absolute inset-0 z-0" isDarkMode={isDarkMode} />
      <div className="relative z-10 welcome-content">
        <div className="animation-container">
          <TypingAnimation duration={100}>TarotMancer</TypingAnimation>
        </div>
        <LoginButton />
      </div>
    </div>
  ), [isDarkMode]);

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


  return (
    <LanguageProvider>
      <Router>
        <div className={`App main-content ${isMobileScreen ? 'mobile' : ''} ${isDarkMode ? 'dark-mode' : ''}`} style={{ height: '100vh', overflow: 'hidden' }}>
          {memoizedHeader}
          <Routes>
            <Route path="/celtic-spread" element={
              isAuthenticated ? (
                <Suspense fallback={<div>Loading...</div>}>
                  <CelticSpread {...spreadProps} isDarkMode={isDarkMode} />
                </Suspense>
              ) : <Navigate to="/" />
            } />
            <Route path="/three-card-spread" element={
              isAuthenticated ? (
                <Suspense fallback={<div>Loading...</div>}>
                  <ThreeCardSpread {...spreadProps} isDarkMode={isDarkMode} />
                </Suspense>
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
