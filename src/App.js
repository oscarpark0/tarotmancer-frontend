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
  const [userDraws, setUserDraws] = useState([]);

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

    try {
      const token = await kindeAuth.getToken();
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/can-draw`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-ID': kindeAuth.user.id
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const text = await response.text();
      console.log('Full response text:', text);
      
      if (response.ok) {
        try {
          const data = JSON.parse(text);
          setCanDraw(data.can_draw);
          console.log('Can draw:', data.can_draw);
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
        }
      } else {
        console.error('Server returned an error:', response.status, text);
      }
    } catch (error) {
      console.error('Error checking draw status:', error);
    }
  }, [isAuthenticated, kindeAuth]);

  useEffect(() => {
    checkCanDraw();
  }, [checkCanDraw]);
  const timeUntilNextDraw = useMemo(() => {
    if (canDraw) return null; // Return null if user can draw

    const now = new Date();
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const timeLeft = tomorrow - now;

    const seconds = Math.floor(timeLeft / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, [canDraw]);

  const fetchUserDraws = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const token = await kindeAuth.getToken();
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/user-draws`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-ID': kindeAuth.user.id
        }
      });
      
      if (response.ok) {
        const draws = await response.json();
        setUserDraws(draws);
      } else {
        console.error('Failed to fetch user draws');
      }
    } catch (error) {
      console.error('Error fetching user draws:', error);
    }
  }, [isAuthenticated, kindeAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserDraws();
    }
  }, [isAuthenticated, fetchUserDraws]);

  const PastDraws = ({ draws }) => (
    <div className="past-draws">
      <h2>Past Draws</h2>
      {draws.map((draw) => (
        <div key={draw.id} className="past-draw">
          <h3>{draw.spread_type} - {new Date(draw.created_at).toLocaleString()}</h3>
          <p>{draw.response}</p>
        </div>
      ))}
    </div>
  );

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
          <PastDraws draws={userDraws} />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;