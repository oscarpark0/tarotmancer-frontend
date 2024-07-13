import { useState, useCallback } from 'react';

export const useMonitorOutput = () => {
  const [monitorOutput, setMonitorOutput] = useState('');

  const handleMonitorOutput = useCallback((output) => {
    setMonitorOutput(prev => prev + output);
  }, []);

  return { monitorOutput, handleMonitorOutput };
};