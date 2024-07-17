import { useState, useCallback } from 'react';

export const useMistralResponse = (onNewResponse, onResponseComplete) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fullResponse, setFullResponse] = useState('');

    const fetchMistralResponse = useCallback((message) => {
        setIsLoading(true);
        setError(null);
        setFullResponse('');

        const eventSource = new EventSource(`${process.env.REACT_APP_BASE_URL}/chat?message=${encodeURIComponent(message)}`, {
            withCredentials: true,
        });

        eventSource.onopen = () => {
            console.log('EventSource connected');
        };

        eventSource.onmessage = (event) => {
            if (event.data === '[DONE]') {
                eventSource.close();
                setIsLoading(false);
                onResponseComplete(fullResponse);
                return;
            }

            const text = event.data;
            setFullResponse(prev => prev + text);
            onNewResponse(text);
        };

        eventSource.onerror = (err) => {
            console.error('EventSource failed:', err);
            eventSource.close();
            setError(`Failed to connect to the server. Please try again later.`);
            setIsLoading(false);
        };
    }, [onResponseComplete, fullResponse, onNewResponse]);

    return {
        isLoading,
        error,
        fullResponse,
        handleSubmit: fetchMistralResponse,
    };
};