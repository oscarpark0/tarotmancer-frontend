import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
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
import DailyCardFrequenciesPage from './components/DailyCardFrequenciesPage';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import styles from './components/SubscribeButton.module.css';
import Contact from './components/Contact';
import ResourcesPage from './components/ResourcesPage';

const CelticSpread = lazy(() => import('./CelticSpread').then(module => ({ default: module.default })));
const ThreeCardSpread = lazy(() => import('./ThreeCardSpread').then(module => ({ default: module.default })));

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
  const [drawCount, setDrawCount] = useState(0);
  const [lastResetTime, setLastResetTime] = useState(null);
  const [lastDrawTime, setLastDrawTime] = useState(null);
  const [timeUntilNextDraw, setTimeUntilNextDraw] = useState(null);

  const navigate = useNavigate();

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
          <h1 className="app-title" onClick={() => navigate('/')}>
            <span>tarotmancer</span>
          </h1>
          <div className="auth-container">
            <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            {isAuthenticated ? (
              <>
                <div className="header-language-selector">
                  <LanguageSelector />
                </div>
                <button onClick={() => navigate('/dailyFrequencies')} className={styles.subscribeButton}>Daily Frequencies</button>
                <button onClick={() => setIsPastDrawsModalOpen(true)} className={styles.subscribeButton}>Past Draws</button>
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
  ), [isMobileScreen, isAuthenticated, isDarkMode, toggleDarkMode, navigate]);

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

  useEffect(() => {
    const calculateTimeUntilNextDraw = () => {
      if (!lastDrawTime || canDraw) {
        setTimeUntilNextDraw(null);
        return;
      }

      const now = new Date();
      const nextDrawTime = new Date(lastDrawTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours after last draw
      const timeLeft = nextDrawTime - now;

      if (timeLeft <= 0) {
        setCanDraw(true);
        setTimeUntilNextDraw(null);
      } else {
        setTimeUntilNextDraw(Math.ceil(timeLeft / 1000)); // Convert to seconds
      }
    };

    calculateTimeUntilNextDraw();
    const timer = setInterval(calculateTimeUntilNextDraw, 1000);

    return () => clearInterval(timer);
  }, [lastDrawTime, canDraw]);

  const handleDraw = useCallback(() => {
    setLastDrawTime(new Date());
    setCanDraw(false);
  }, []);

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
      <div style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1, padding: isMobileScreen ? 0 : undefined }}>
        <Routes>
          <Route path="/" element={isAuthenticated ? (
            <Suspense fallback={<div>Loading...</div>}>
              {selectedSpread === 'celtic' ? (
                <CelticSpread 
                  {...spreadProps} 
                  isDarkMode={isDarkMode}
                  canDraw={canDraw}
                  timeUntilNextDraw={timeUntilNextDraw}
                  currentDrawId={currentDrawId}
                  setCurrentDrawId={setCurrentDrawId}
                  getToken={kindeAuth.getToken}
                  onDraw={handleDraw}
                />
              ) : (
                <ThreeCardSpread 
                  {...spreadProps} 
                  isDarkMode={isDarkMode}
                  canDraw={canDraw}
                  timeUntilNextDraw={timeUntilNextDraw}
                  currentDrawId={currentDrawId}
                  setCurrentDrawId={setCurrentDrawId}
                  getToken={kindeAuth.getToken}
                  drawCount={drawCount}
                  setDrawCount={setDrawCount}
                  lastResetTime={lastResetTime}
                  setLastResetTime={setLastResetTime}
                />
              )}
            </Suspense>
          ) : memoizedWelcomeMessage} />
          <Route path="/dailyFrequencies" element={<DailyCardFrequenciesPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/resources" element={<ResourcesPage />} />
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
    <BrowserRouter>
      <LanguageProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <AppContent />
        </Suspense>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;