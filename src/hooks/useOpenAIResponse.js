import { useState, useCallback } from 'react';
import { getOpenAIResponse } from '../services/openaiServices';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const useOpenAIResponse = (onNewResponse, onResponseComplete) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fullResponse, setFullResponse] = useState('');

    const fetchWithRetry = useCallback(async (fn, ...args) => {
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                return await fn(...args);
            } catch (err) {
                if (i === MAX_RETRIES - 1) throw err;
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
        }
    }, []);

    const fetchOpenAIResponse = useCallback(async (message, drawId, userId) => {
        if (!drawId) {
            console.error('Draw ID is not available');
            return;
        }
        if (!userId) {
            console.error('User ID is not available');
            return;
        }
        setIsLoading(true);
        setError(null);
        setFullResponse('');

        try {
            await fetchWithRetry(getOpenAIResponse, 
                message,
                (content) => {
                    setFullResponse(prev => prev + content);
                    onNewResponse(content);
                },
                (fullResponse) => {
                    setFullResponse(fullResponse);
                    onResponseComplete(fullResponse);
                },
                drawId,
                userId
            );
        } catch (err) {
            console.error('Error in OpenAI response:', err);
            setError(`Failed to connect to the server. Please try again later.`);
        } finally {
            setIsLoading(false);
        }
    }, [fetchWithRetry, onNewResponse, onResponseComplete]);

    return {
        isLoading,
        error,
        fullResponse,
        handleSubmit: fetchOpenAIResponse,
    };
};
