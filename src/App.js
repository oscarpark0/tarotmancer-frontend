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
  const [canAccessCohere, setCanAccessCohere] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [canDraw, setCanDraw] = useState(true);
  const [, setLastDrawTime] = useState(null);

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
          <h1 className="app-title"><span>TarotMancer</span></h1>
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
        <div className="welcome-buttons">
          <LoginButton />
          <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </div>
      </div>
    </div>
  ), [isDarkMode, toggleDarkMode]);

  const spreadProps = useMemo(() => ({
    isMobile,
    onSpreadSelect: handleSpreadSelect,
    selectedSpread,
    canAccessCohere,
    setCanAccessCohere,
    kindeAuth,
  }), [isMobile, handleSpreadSelect, selectedSpread, canAccessCohere, kindeAuth]);

  const checkCanDraw = useCallback(async () => {
    if (!isAuthenticated) return;

    const storedLastDrawTime = localStorage.getItem('lastDrawTime');
    if (storedLastDrawTime) {
      const timeSinceLastDraw = Date.now() - new Date(storedLastDrawTime).getTime();
      if (timeSinceLastDraw < 24 * 60 * 60 * 1000) {
        setCanDraw(false);
        setLastDrawTime(new Date(storedLastDrawTime));
        return;
      }
    }

    try {
      const token = await kindeAuth.getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/can-draw`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-ID': kindeAuth.user.id
        }
      });
      const data = await response.json();
      setCanDraw(data.can_draw);
    } catch (error) {
      console.error('Error checking draw status:', error);
    }
  }, [isAuthenticated, kindeAuth]);

  useEffect(() => {
    checkCanDraw();
  }, [checkCanDraw]);

  const timeUntilNextDraw = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const timeLeft = tomorrow - now;
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <div className={`App main-content ${isMobileScreen ? 'mobile' : ''} ${isDarkMode ? 'dark-mode' : ''}`} style={{ height: '100vh', overflow: 'hidden' }}>
          {memoizedHeader}
          <Routes>
            <Route path="/celtic-spread" element={
              isAuthenticated ? (
                <Suspense fallback={<div>Loading...</div>}>
                  <CelticSpread 
                    {...spreadProps} 
                    isDarkMode={isDarkMode}
                    canDraw={canDraw}
                    timeUntilNextDraw={timeUntilNextDraw}
                  />
                </Suspense>
              ) : <Navigate to="/" />
            } />
            <Route path="/three-card-spread" element={
              isAuthenticated ? (
                <Suspense fallback={<div>Loading...</div>}>
                  <ThreeCardSpread 
                    {...spreadProps} 
                    isDarkMode={isDarkMode}
                    canDraw={canDraw}
                    timeUntilNextDraw={timeUntilNextDraw}
                  />
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