import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import SubscribeButton from './components/SubscribeButton.tsx';
import AnimatedGridPattern from './components/AnimatedGridPattern.tsx';
import TypingAnimation from './components/typing-animation.tsx';
import { LanguageProvider } from './components/LanguageSelector';
import DarkModeToggle from './components/DarkModeToggle.tsx';
import './App.css';
import { useMediaQuery } from 'react-responsive';
import { AppContextProvider, useAppContext } from './contexts/AppContext';

const CelticSpread = lazy(() => import('./CelticSpread'));
const ThreeCardSpread = lazy(() => import('./ThreeCardSpread'));

function AppContent() {
  const kindeAuth = useKindeAuth();
  const isAuthenticated = kindeAuth?.isAuthenticated ?? false;
  const isMobileScreen = useMediaQuery({ maxWidth: 767 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { setSelectedLanguage } = useAppContext();

  useEffect(() => {
    if (window.location.search.includes('code=') && kindeAuth?.handleRedirectCallback) {
      kindeAuth.handleRedirectCallback().catch(error => {
        console.error('Authentication callback error:', error);
      });
    }
  }, [kindeAuth]);
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prevMode => !prevMode);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  const memoizedHeader = useMemo(() => (
    (!isMobileScreen || !isAuthenticated) && (
      <Header
        isAuthenticated={isAuthenticated}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    )
  ), [isMobileScreen, isAuthenticated, isDarkMode, toggleDarkMode]);

  const memoizedWelcomeMessage = useMemo(() => (
    <WelcomeMessage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
  ), [isDarkMode, toggleDarkMode]);

  return (
    <LanguageProvider onLanguageChange={setSelectedLanguage}>
      <Router>
        <div className={`App main-content ${isMobileScreen ? 'mobile' : ''} ${isDarkMode ? 'dark-mode' : ''}`} style={{ height: '100vh', overflow: 'hidden' }}>
          {memoizedHeader}
          <Routes>
            <Route path="/celtic-spread" element={
              isAuthenticated ? (
                <Suspense fallback={<div>Loading...</div>}>
                  <CelticSpread isDarkMode={isDarkMode} isMobile={isMobileScreen} />
                </Suspense>
              ) : <Navigate to="/" />
            } />
            <Route path="/three-card-spread" element={
              isAuthenticated ? (
                <Suspense fallback={<div>Loading...</div>}>
                  <ThreeCardSpread isDarkMode={isDarkMode} isMobile={isMobileScreen} />
                </Suspense>
              ) : <Navigate to="/" />
            } />
            <Route path="/" element={
              isAuthenticated ? (
                <Navigate to="/celtic-spread" />
              ) : memoizedWelcomeMessage
            } />
            <Route path="/callback" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

function App() {
  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  );
}

const Header = React.memo(({ isAuthenticated, isDarkMode, toggleDarkMode }) => {
  const { tickerMessages } = useAppContext();

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title"><span>TarotMancer</span></h1>
        <div className="ticker-container">
          <div className="ticker-wrapper">
            {tickerMessages.map((message, index) => (
              <span key={index} className="ticker-item">{message}</span>
            ))}
          </div>
          <div className="ticker-wrapper">
            {tickerMessages.map((message, index) => (
              <span key={`duplicate-${index}`} className="ticker-item">{message}</span>
            ))}
          </div>
        </div>
        <div className="auth-container">
          <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          {isAuthenticated ? (
            <>
              <div className="header-language-selector tooltip">
                <button disabled className="language-selector-disabled">Language</button>
                <span className="tooltiptext">Language selection coming soon</span>
              </div>
              <SubscribeButton />
              <LogoutButton />
            </>
          ) : (
            <>
              <div className="header-language-selector tooltip">
                <button disabled className="language-selector-disabled">Language</button>
                <span className="tooltiptext">Language selection coming soon</span>
              </div>
              <LoginButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
});

const WelcomeMessage = React.memo(({ isDarkMode, toggleDarkMode }) => (
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
));
export default App;