import { useState, useCallback } from 'react';

export const useStreamingState = (onNewResponse, onResponseComplete, onStreamingStateChange, onMonitorOutput) => {
  const [isStreaming, setIsStreaming] = useState(false);

  const handleNewResponse = useCallback((content) => {
    if (content !== "[DONE]") {
      onNewResponse(content);
      onMonitorOutput(content); 
      setIsStreaming(true);
      if (onStreamingStateChange) {
        onStreamingStateChange(true);
      }
    }
  }, [onNewResponse, onStreamingStateChange, onMonitorOutput]);

  const handleResponseComplete = useCallback(() => {
    onResponseComplete();
    setIsStreaming(false);
    if (onStreamingStateChange) {
      onStreamingStateChange(false);
    }
  }, [onResponseComplete, onStreamingStateChange]);

  return { isStreaming, handleNewResponse, handleResponseComplete };
};