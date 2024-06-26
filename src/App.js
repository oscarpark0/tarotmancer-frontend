import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import './App.css';
import { useMediaQuery } from 'react-responsive';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { isAuthenticated, user } = useKindeAuth();
  const isMobileScreen = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <div className="App">
        {(!isMobileScreen || !user) && (
          <header className="app-header">
            <div className="header-content">
              <h1 className="app-title">TarotMancer</h1>
              <div className="auth-container">
                {user ? <LogoutButton /> : <LoginButton />}
              </div>
            </div>
          </header>
        )}
        <Routes>
          <Route path="/celtic-spread" element={
            isAuthenticated ? <CelticSpread isMobile={isMobile} /> : <Navigate to="/" />
          } />
          <Route path="/three-card-spread" element={
            isAuthenticated ? <ThreeCardSpread isMobile={isMobile} /> : <Navigate to="/" />
          } />
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/celtic-spread" /> : 
            <div className="welcome-message">

            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
