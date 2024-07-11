import { useState, useCallback } from 'react';

export const useMonitorOutput = (onMonitorOutput) => {
  const [monitorOutput, setMonitorOutput] = useState('');

  const handleMonitorOutput = useCallback((output) => {
    setMonitorOutput(output);
    if (typeof onMonitorOutput === 'function') {
      onMonitorOutput(output);
    }
  }, [onMonitorOutput]);

  return { monitorOutput, handleMonitorOutput };
};