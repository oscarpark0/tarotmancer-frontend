import { useState, useCallback } from 'react';

export const useStreamingState = (onNewResponse, onResponseComplete, onStreamingStateChange) => {
  const [isStreaming, setIsStreaming] = useState(false);

  const handleNewResponse = useCallback((content) => {
    if (content !== "[DONE]") {
      onNewResponse(content);
      setIsStreaming(true);
      if (onStreamingStateChange) {
        onStreamingStateChange(true);
      }
    }
  }, [onNewResponse, onStreamingStateChange]);

  const handleResponseComplete = useCallback(() => {
    onResponseComplete();
    setIsStreaming(false);
    if (onStreamingStateChange) {
      onStreamingStateChange(false);
    }
  }, [onResponseComplete, onStreamingStateChange]);

  return { isStreaming, handleNewResponse, handleResponseComplete };
};