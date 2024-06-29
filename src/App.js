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
import './App.css';
import { useMediaQuery } from 'react-responsive';
import axios from 'axios';

function App() {
  const kindeAuth = useKindeAuth();
  const isAuthenticated = kindeAuth?.isAuthenticated ?? false;
  const [canAccessCohere, setCanAccessCohere] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    const checkCohereAccess = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/v1/feature-flags/cohere-api-access`,
          {
            headers: {
              Authorization: `Bearer ${kindeAuth.getToken()}`,
            },
          }
        );
        setCanAccessCohere(response.data.value === true);
      } catch (error) {
        console.error('Error checking Cohere API access:', error);
        setCanAccessCohere(false);
      }
    };

    if (isAuthenticated) {
      checkCohereAccess();
    }
  }, [API_URL, isAuthenticated, kindeAuth]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const isMobileScreen = useMediaQuery({ maxWidth: 767 });
  const [selectedSpread, setSelectedSpread] = useState('celtic');
  const [drawCount, setDrawCount] = useState(0);
  const [lastResetTime, setLastResetTime] = useState(Date.now());

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
            ) : (
              <LoginButton />
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

  return (
    <Router>
      <div className="App main-content">
        {memoizedHeader}
        <Routes>
          <Route path="/celtic-spread" element={
            isAuthenticated ? (
              <CelticSpread 
                isMobile={isMobile} 
                onSpreadSelect={handleSpreadSelect} 
                selectedSpread={selectedSpread} 
                drawCount={drawCount}
                incrementDrawCount={incrementDrawCount}
                setDrawCount={setDrawCount}
                setLastResetTime={setLastResetTime}
                canAccessCohere={canAccessCohere}
                setCanAccessCohere={setCanAccessCohere}
                kindeAuth={kindeAuth}
              />
            ) : <Navigate to="/" />
          } />
          <Route path="/three-card-spread" element={
            isAuthenticated ? (
              <ThreeCardSpread 
                isMobile={isMobile} 
                onSpreadSelect={handleSpreadSelect} 
                selectedSpread={selectedSpread} 
                drawCount={drawCount}
                incrementDrawCount={incrementDrawCount}
                setDrawCount={setDrawCount}
                setLastResetTime={setLastResetTime}
                canAccessCohere={canAccessCohere}
                setCanAccessCohere={setCanAccessCohere}
                kindeAuth={kindeAuth}
              />
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
  );
}

export default App;
