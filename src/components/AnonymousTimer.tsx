import React, { useState, useEffect } from 'react';
import { useTranslation } from '../utils/translations';

interface AnonymousTimerProps {
  className?: string;
}

const AnonymousTimer: React.FC<AnonymousTimerProps> = ({ className = '' }) => {
  const { getTranslation } = useTranslation();
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

  // Update the timer every minute
  useEffect(() => {
    updateTimeRemaining();
    
    const interval = setInterval(updateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!timeRemaining) return null;

  return (
    <div className={`anonymous-timer ${className}`}>
      {getTranslation('nextDrawIn')}: {timeRemaining}
    </div>
  );
};

export default AnonymousTimer;