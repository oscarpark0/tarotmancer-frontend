import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate, Routes, Route } from 'react-router-dom';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import SubscribeButton from './components/SubscribeButton.tsx';
import AnimatedGridPattern from './components/AnimatedGridPattern.tsx';
import TypingAnimation from './components/typing-animation';
import LanguageSelector from './components/LanguageSelector';
import { LanguageProvider } from './contexts/LanguageContext';
import DarkModeToggle from './components/DarkModeToggle.tsx';
import PastDrawsModal from './components/PastDrawsModal';
import FeedbackButton from './components/FeedbackButton.tsx';
import './App.css';
import { useMediaQuery } from 'react-responsive';
import Footer from './components/Footer.tsx';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfUse from './components/TermsOfUse';
import DailyCardFrequenciesPage from './components/DailyCardFrequenciesPage';
import styles from './components/SubscribeButton.module.css';
import Contact from './components/Contact';
import ResourcesPage from './components/ResourcesPage';
import { useTranslation } from './utils/translations';
import HowItWorks from './components/HowItWorks';


const CelticSpread = lazy(() => import('./CelticSpread').then(module => ({ default: module.default })));
const ThreeCardSpread = lazy(() => import('./ThreeCardSpread').then(module => ({ default: module.default })));

function KindeCallbackHandler() {
  const { isLoading, isAuthenticated, error } = useKindeAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/');
      } else if (error) {
        console.error('Authentication error:', error);
        navigate('/');
      }
    }
  }, [isLoading, isAuthenticated, error, navigate]);

  if (isLoading) {
    return <div>Processing login...</div>;
  }

  return null;
}




function AppContent({ isAuthenticated }) {
  const { user, getToken } = useKindeAuth();
  console.log('AppContent - isAuthenticated:', isAuthenticated);
  const { getTranslation } = useTranslation(); 
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

  const memoizedHeader = useMemo(() => {
    return (!isMobileScreen || !isAuthenticated) && (
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title" onClick={() => navigate('/')}>
            <span>{getTranslation('tarotmancer')}</span>
          </h1>
          <div className="auth-container">
            <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            {isAuthenticated ? (
              <>
                <div className="header-language-selector">
                  <LanguageSelector />
                </div>
                <button onClick={() => navigate('/how-it-works')} className={styles.subscribeButton}>{getTranslation('howItWorks')}</button>
                <button onClick={() => navigate('/dailyFrequencies')} className={styles.subscribeButton}>{getTranslation('dailyFrequencies')}</button>
                <button onClick={() => setIsPastDrawsModalOpen(true)} className={styles.subscribeButton}>{getTranslation('pastDraws')}</button>
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
  }, [isMobileScreen, isAuthenticated, isDarkMode, toggleDarkMode, navigate, getTranslation]);

  const memoizedWelcomeMessage = useMemo(() => {
    return (
      <div className="welcome-message">
        <AnimatedGridPattern className="absolute inset-0 z-0" isDarkMode={isDarkMode} />
        <div className="relative z-10 welcome-content">
          <div className="animation-container">
            <TypingAnimation duration={100}>{getTranslation('tarotmancer')}</TypingAnimation>
          </div>
          <div className="welcome-buttons">
            <LoginButton />
            <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          </div>
        </div>
      </div>
    )
  }, [isDarkMode, toggleDarkMode, getTranslation]);

  const spreadProps = useMemo(() => ({
    isMobile,
    onSpreadSelect: handleSpreadSelect,
    selectedSpread,
    canAccessCohere,
    setCanAccessCohere,
    kindeAuth: { user, getToken },
  }), [isMobile, handleSpreadSelect, selectedSpread, canAccessCohere, user, getToken]);

  const makeAuthenticatedRequest = useCallback(async (endpoint, errorMessage) => {
    if (!isAuthenticated) return null;

    try {
      const token = await getToken();
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-ID': user.id
        }
      });
      
      if (!response.ok) {
        throw new Error(`${errorMessage}: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(errorMessage, error);
      return null;
    }
  }, [isAuthenticated, getToken, user]);

  const checkCanDraw = useCallback(async () => {
    const data = await makeAuthenticatedRequest('/api/can-draw', 'Error checking draw status');
    if (data) {
      setCanDraw(data.can_draw);
    }
  }, [makeAuthenticatedRequest]);

  const fetchUserDraws = useCallback(async () => {
    const draws = await makeAuthenticatedRequest('/api/user-draws', 'Error fetching user draws');
    if (draws) {
      setUserDraws(draws);
    }
  }, [makeAuthenticatedRequest]);

  useEffect(() => {
    checkCanDraw();
  }, [checkCanDraw]);

  useEffect(() => {
    let timer;
    if (!canDraw && lastDrawTime) {
      const calculateTimeUntilNextDraw = () => {
        const now = new Date();
        const nextDrawTime = new Date(lastDrawTime.getTime() + 24 * 60 * 60 * 1000);
        const timeLeft = nextDrawTime - now;

        if (timeLeft <= 0) {
          setCanDraw(true);
          setTimeUntilNextDraw(null);
          clearInterval(timer);
        } else {
          setTimeUntilNextDraw(Math.ceil(timeLeft / 1000));
        }
      };

      calculateTimeUntilNextDraw();
      timer = setInterval(calculateTimeUntilNextDraw, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lastDrawTime, canDraw]);

  const handleDraw = useCallback(() => {
    const now = new Date();
    setLastDrawTime(now);
    setCanDraw(false);
    setTimeUntilNextDraw(24 * 60 * 60); // Set to 24 hours in seconds
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserDraws();
    }
  }, [isAuthenticated, fetchUserDraws]);

  useEffect(() => {
    console.log('AppContent - Authentication status changed:', isAuthenticated, 'user:', user);
    if (!isAuthenticated) {
      console.log('AppContent - User was logged out');
    }
  }, [isAuthenticated, user]);

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
                  getToken={getToken}
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
                  getToken={getToken}
                  drawCount={drawCount}
                  setDrawCount={setDrawCount}
                  lastResetTime={lastResetTime}
                  setLastResetTime={setLastResetTime}
                />
              )}
            </Suspense>
          ) : memoizedWelcomeMessage} />
          <Route path="/dailyFrequencies" element={<DailyCardFrequenciesPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/kinde_callback" element={<KindeCallbackHandler />} />
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

function App() {
  const { isLoading, isAuthenticated } = useKindeAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <LanguageProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <AppContent isAuthenticated={isAuthenticated} />
      </Suspense>
    </LanguageProvider>
  );
}

export default App;