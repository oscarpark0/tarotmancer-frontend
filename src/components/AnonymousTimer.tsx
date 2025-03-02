import React, { useState, useEffect } from 'react';
import { useTranslation } from '../utils/translations';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

interface AnonymousTimerProps {
  className?: string;
  showSignupMessage?: boolean;
}

const AnonymousTimer: React.FC<AnonymousTimerProps> = ({ 
  className = '', 
  showSignupMessage = true 
}) => {
  const { getTranslation } = useTranslation();
  const { login } = useKindeAuth();
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  // Function to calculate and format time remaining
  const updateTimeRemaining = () => {
    try {
      const drawData = localStorage.getItem('anonDrawData');
      if (!drawData) return null;
      
      const parsedData = JSON.parse(drawData);
      const now = new Date().getTime();
      
      if (parsedData.nextDrawTime && now < parsedData.nextDrawTime) {
        const hoursRemaining = Math.floor((parsedData.nextDrawTime - now) / (1000 * 60 * 60));
        const minutesRemaining = Math.floor(((parsedData.nextDrawTime - now) % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hoursRemaining}h ${minutesRemaining}m`);
      } else {
        setTimeRemaining(null);
        // Update local storage if time has expired
        if (parsedData.nextDrawTime && now >= parsedData.nextDrawTime) {
          localStorage.removeItem('anonDrawData');
        }
      }
    } catch (error) {
      console.error('Error updating anonymous timer:', error);
      setTimeRemaining(null);
    }
  };

  // Handle signup/login click
  const handleSignupClick = () => {
    if (login) {
      login();
    } else {
      console.error('Login function not available');
      // Fallback to redirect to login page
      window.location.href = '/login';
    }
  };

  // Update the timer every minute
  useEffect(() => {
    updateTimeRemaining();
    
    const interval = setInterval(updateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, []);

  // Return nothing if no time remaining to show
  if (!timeRemaining) return null;

  return (
    <div className="anonymous-limits-container">
      <div className={`anonymous-timer ${className}`}>
        {getTranslation('nextDrawIn')}: {timeRemaining}
      </div>
      
      {showSignupMessage && (
        <div 
          className="anonymous-signup-message" 
          onClick={handleSignupClick}
          role="button"
          tabIndex={0}
          aria-label={getTranslation('signupForMoreDraws')}
        >
          {getTranslation('signupForMoreDraws')}
        </div>
      )}
    </div>
  );
};

export default AnonymousTimer;