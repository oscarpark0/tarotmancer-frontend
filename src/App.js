import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import SubscribeButton from './components/SubscribeButton.tsx';
import AnimatedGridPattern from './components/AnimatedGridPattern.tsx';
import TypingAnimation from './components/typing-animation';
import LanguageSelector, { LanguageProvider } from './components/LanguageSelector';
import DarkModeToggle from './components/DarkModeToggle.tsx';
import PastDrawsModal from './components/PastDrawsModal';
import FeedbackButton from './components/FeedbackButton.tsx';
import './App.css';
import { useMediaQuery } from 'react-responsive';
import Footer from './components/Footer.tsx';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfUse from './components/TermsOfUse';

const CelticSpread = lazy(() => import('./CelticSpread'));
const ThreeCardSpread = lazy(() => import('./ThreeCardSpread'));

// Create a new component to use router-dependent hooks
function AppContent() {
  const kindeAuth = useKindeAuth();
  const isAuthenticated = kindeAuth?.isAuthenticated ?? false;

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const isMobileScreen = useMediaQuery({ maxWidth: 767 });
  const [selectedSpread, setSelectedSpread] = useState('celtic');
  const [canAccessCohere, setCanAccessCohere] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [canDraw, setCanDraw] = useState(true);
  const [, setUserDraws] = useState([]);
  const [isPastDrawsModalOpen, setIsPastDrawsModalOpen] = useState(false);
  const [currentDrawId, setCurrentDrawId] = useState(null);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
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
          <Link to="/celtic-spread" className="app-title-link">
            <h1 className="app-title"><span>TarotMancer</span></h1>
          </Link>
          <div className="auth-container">
            <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            {isAuthenticated ? (
              <>
                <div className="header-language-selector">
                  <LanguageSelector />
                </div>
                <button onClick={() => setIsPastDrawsModalOpen(true)}>Past Draws</button>
                <SubscribeButton />
                <FeedbackButton />
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
      
      
      const text = await response.text();
      
      if (response.ok) {
        try {
          const data = JSON.parse(text);
          setCanDraw(data.can_draw);
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
    if (canDraw) return null; // null = user can draw

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


  return (
    <div className={`App main-content ${isMobileScreen ? 'mobile' : ''} ${isDarkMode ? 'dark-mode' : ''}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', zIndex: 10 }}>
        {memoizedHeader}
      </div>
      <div style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/celtic-spread" element={
            isAuthenticated ? (
              <Suspense fallback={<div>Loading...</div>}>
                <CelticSpread 
                  {...spreadProps} 
                  isDarkMode={isDarkMode}
                  canDraw={canDraw}
                  timeUntilNextDraw={timeUntilNextDraw}
                  currentDrawId={currentDrawId}
                  setCurrentDrawId={setCurrentDrawId}
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
                  currentDrawId={currentDrawId}
                  setCurrentDrawId={setCurrentDrawId}
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
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
        </Routes>
      </div>
      <div style={{ position: 'relative', zIndex: 5 }}>
        <Footer isDarkMode={isDarkMode} />
      </div>
      <PastDrawsModal 
        isOpen={isPastDrawsModalOpen} 
        onClose={() => setIsPastDrawsModalOpen(false)} 
      />
    </div>
  );
}

// Main App component
function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;