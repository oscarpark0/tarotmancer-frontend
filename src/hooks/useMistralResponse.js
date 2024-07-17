import { useState, useCallback } from 'react';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const useMistralResponse = (onNewResponse, onResponseComplete) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fullResponse, setFullResponse] = useState('');

    const fetchWithRetry = useCallback(async (url, options, retries = 0) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (err) {
            if (retries < MAX_RETRIES) {
                console.log(`Retrying request (${retries + 1}/${MAX_RETRIES})...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return fetchWithRetry(url, options, retries + 1);
            }
            throw err;
        }
    }, []); // Added empty dependency array here

    const fetchMistralResponse = useCallback(async (message) => {
        setIsLoading(true);
        setError(null);
        setFullResponse('');

        try {
            const response = await fetchWithRetry(`${process.env.REACT_APP_BASE_URL}/api/mistral`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
                credentials: 'include',
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            onResponseComplete(fullResponse);
                            setIsLoading(false);
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0].delta.content;
                            if (content) {
                                setFullResponse(prev => prev + content);
                                onNewResponse(content);
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Error in Mistral response:', err);
            setError(`Failed to connect to the server. Please try again later.`);
        } finally {
            setIsLoading(false);
        }
    }, [fetchWithRetry, onResponseComplete, fullResponse, onNewResponse]);

    return {
        isLoading,
        error,
        fullResponse,
        handleSubmit: fetchMistralResponse,
    };
};