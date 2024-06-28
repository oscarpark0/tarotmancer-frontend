import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import SubscribeButton from './components/SubscribeButton.tsx';
import AnimatedGridPattern from './components/AnimatedGridPattern';
import TypingAnimation from './components/typing-animation.tsx';
import './App.css';
import { useMediaQuery } from 'react-responsive';
import GuestLoginButton from './components/GuestLoginButton.tsx';
import { getKindeAccessToken } from './utils/kindeApi';
import axios from 'axios';

function App() {
  const kindeAuth = useKindeAuth();
  const isAuthenticated = kindeAuth?.isAuthenticated ?? false;
  const [canAccessCohere, setCanAccessCohere] = useState(false);

  useEffect(() => {
    const checkCohereAccess = async () => {
      try {
        const accessToken = await getKindeAccessToken();
        const response = await axios.get(
          `${process.env.REACT_APP_KINDE_DOMAIN}/api/v1/feature-flags/cohere-api-access`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setCanAccessCohere(response.data.value === true);
      } catch (error) {
        console.error('Error checking Cohere API access:', error);
        // Set canAccessCohere to false if there's an error
        setCanAccessCohere(false);
      }
    };

    if (isAuthenticated) {
      checkCohereAccess();
    }
  }, [isAuthenticated]);

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
  const [guestId, setGuestId] = useState(localStorage.getItem('guestId'));

  const handleSpreadSelect = useCallback((spread) => {
    setSelectedSpread(spread);
  }, []);

  useEffect(() => {
    // Check for previous session data
    const prevDrawCount = sessionStorage.getItem('prevDrawCount');
    const prevLastResetTime = sessionStorage.getItem('prevLastResetTime');

    if (prevDrawCount && prevLastResetTime) {
      // Use the previous session data
      setDrawCount(parseInt(prevDrawCount, 10));
      setLastResetTime(parseInt(prevLastResetTime, 10));

      // Clear the session storage
      sessionStorage.removeItem('prevDrawCount');
      sessionStorage.removeItem('prevLastResetTime');
    } else {
      // If no previous session data, check localStorage
      const storedCount = localStorage.getItem('drawCount');
      const storedResetTime = localStorage.getItem('lastResetTime');
      if (storedCount && storedResetTime) {
        setDrawCount(parseInt(storedCount, 10));
        setLastResetTime(parseInt(storedResetTime, 10));
      }
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

  const handleGuestLogin = useCallback(() => {
    const newGuestId = `guest_${Date.now()}`;
    setGuestId(newGuestId);
    localStorage.setItem('guestId', newGuestId);

    // Check for previous session data
    const prevDrawCount = sessionStorage.getItem('prevDrawCount');
    const prevLastResetTime = sessionStorage.getItem('prevLastResetTime');

    if (prevDrawCount && prevLastResetTime) {
      setDrawCount(parseInt(prevDrawCount, 10));
      setLastResetTime(parseInt(prevLastResetTime, 10));
      sessionStorage.removeItem('prevDrawCount');
      sessionStorage.removeItem('prevLastResetTime');
    } else {
      // Reset draw count for new guest sessions without previous data
      setDrawCount(0);
      setLastResetTime(Date.now());
    }
  }, []);

  const memoizedHeader = useMemo(() => (
    (!isMobileScreen || !isAuthenticated) && (
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">TarotMancer</h1>
          <div className="auth-container">
            {isAuthenticated ? (
              <>
                <SubscribeButton />
                <LogoutButton />
              </>
            ) : guestId && guestId.startsWith('guest_') ? (
              <LogoutButton />
            ) : (
              <>
                <LoginButton />
                <GuestLoginButton onGuestLogin={handleGuestLogin} />
              </>
            )}
          </div>
        </div>
      </header>
    )
  ), [isMobileScreen, isAuthenticated, guestId, handleGuestLogin]);

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

  const isGuest = useMemo(() => guestId && guestId.startsWith('guest_'), [guestId]);

  return (
    <Router>
      <div className="App main-content">
        {memoizedHeader}
        <Routes>
          <Route path="/celtic-spread" element={
            isAuthenticated || isGuest ? (
              <CelticSpread 
                isMobile={isMobile} 
                onSpreadSelect={handleSpreadSelect} 
                selectedSpread={selectedSpread} 
                drawCount={drawCount}
                incrementDrawCount={incrementDrawCount}
                setDrawCount={setDrawCount}
                setLastResetTime={setLastResetTime}
                guestId={guestId}
                canAccessCohere={canAccessCohere}
                setCanAccessCohere={setCanAccessCohere}
              />
            ) : <Navigate to="/" />
          } />
          <Route path="/three-card-spread" element={
            isAuthenticated || isGuest ? (
              <ThreeCardSpread 
                isMobile={isMobile} 
                onSpreadSelect={handleSpreadSelect} 
                selectedSpread={selectedSpread} 
                drawCount={drawCount}
                incrementDrawCount={incrementDrawCount}
                setDrawCount={setDrawCount}
                setLastResetTime={setLastResetTime}
                guestId={guestId}
                canAccessCohere={canAccessCohere}
                setCanAccessCohere={setCanAccessCohere}
              />
            ) : <Navigate to="/" />
          } />
          <Route path="/" element={
            isAuthenticated || isGuest ? (
              <Navigate to={selectedSpread === 'celtic' ? "/celtic-spread" : "/three-card-spread"} />
            ) : memoizedWelcomeMessage
          } />
          <Route path="/callback" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
