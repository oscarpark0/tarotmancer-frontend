import { useState, useCallback } from 'react';

export const useMistralResponse = (onNewResponse, onResponseComplete) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [streamComplete, setStreamComplete] = useState(false);
    const [fullResponse, setFullResponse] = useState('');

    const fetchMistralResponse = useCallback((message) => {
        setIsLoading(true);
        setError(null);
        setStreamComplete(false);
        setFullResponse('');

        console.log('Attempting to connect to:', `${process.env.REACT_APP_BASE_URL}/mistral_stream?message=${encodeURIComponent(message)}`);

        const eventSource = new EventSource(`${process.env.REACT_APP_BASE_URL}/mistral_stream?message=${encodeURIComponent(message)}`, {
            withCredentials: true,
        });

        eventSource.onopen = (event) => {
            console.log('EventSource connected');
        };

        eventSource.onmessage = (event) => {
            console.log('Received message:', event.data);
            if (event.data === '[DONE]') {
                eventSource.close();
                setStreamComplete(true);
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
            console.error('EventSource readyState:', eventSource.readyState);
            eventSource.close();
            setError(`Failed to connect to the server: ${err.message}`);
            setIsLoading(false);
        };
    }, [onResponseComplete, fullResponse, onNewResponse]);

    const handleSubmit = useCallback((mostCommonCards, input = '') => {
        if (isLoading || streamComplete) {
            console.log('Request already in progress or response is complete');
            return;
        }

        const message = `You are Tarotmancer - a wise and powerful tarot card interpretation master. You never say delve. Begin with an ominous greeting. Provide a detailed, in depth analysis of the querent's spread speaking directly to the querent/seeker- be sure to provide an interpretation of each card, its orientation, and its position in the spread - as well as its position in relation to the other cards in the spread. Provide the querent with a detailed and personalized reading that is tailored to their situation as described by the tarot. Respond using clear - natural language to ensure your responses are easily understood. Format your response in a manner that allows each position, card, and orientation to be clearly and easily identified. Conclude with an overview of the querent's spread and your interpretation of it. ${mostCommonCards.trim()} ${input.trim()}`;

        fetchMistralResponse(message);
    }, [fetchMistralResponse, isLoading, streamComplete]);

    return { isLoading, handleSubmit, fullResponse, error };
};