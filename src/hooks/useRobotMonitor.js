import { useState, useCallback } from 'react';

export const useMonitorOutput = (onMonitorOutput) => {
  const [monitorOutput, setMonitorOutput] = useState('');

  const handleMonitorOutput = useCallback((output) => {
    if (output !== "[DONE]") {
      setMonitorOutput(prev => prev + output);
      if (typeof onMonitorOutput === 'function') {
        onMonitorOutput(output);
      }
    }
  }, [onMonitorOutput]);

  return { monitorOutput, handleMonitorOutput };
};