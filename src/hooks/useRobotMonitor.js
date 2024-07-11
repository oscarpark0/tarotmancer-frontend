import { useState, useCallback } from 'react';

export const useMonitorOutput = (onMonitorOutput) => {
  const [monitorOutput, setMonitorOutput] = useState('');

  const handleMonitorOutput = useCallback((output) => {
    setMonitorOutput(output);
    onMonitorOutput(output);
  }, [onMonitorOutput]);

  return { monitorOutput, handleMonitorOutput };
};