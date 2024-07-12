import { useState, useEffect, useRef } from 'react';

export const useRobotDimensions = () => {
  const [monitorPosition, setMonitorPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const robotRef = useRef(null);
  const screenContentRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (screenContentRef.current && robotRef.current) {
        const screenRect = screenContentRef.current.getBoundingClientRect();
        const robotRect = robotRef.current.getBoundingClientRect();
        setMonitorPosition({
          x: screenRect.x - robotRect.x,
          y: screenRect.y - robotRect.y,
          width: screenRect.width,
          height: screenRect.height,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (robotRef.current) {
      const robotHeight = robotRef.current.offsetHeight;
      document.documentElement.style.setProperty('--robot-height', `${robotHeight}px`);
    }
  }, []);

  return { monitorPosition, robotRef, screenContentRef };
};