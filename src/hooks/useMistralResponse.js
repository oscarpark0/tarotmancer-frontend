import { useState, useCallback } from 'react';

export const useMistralResponse = (onNewResponse, onResponseComplete) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fullResponse, setFullResponse] = useState('');

    const fetchMistralResponse = useCallback(async (message) => {
        setIsLoading(true);
        setError(null);
        setFullResponse('');

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

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
                            // Check if the data is valid JSON
                            if (data.startsWith('{') && data.endsWith('}')) {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices[0].delta.content;
                                if (content) {
                                    setFullResponse(prev => prev + content);
                                    onNewResponse(content);
                                }
                            } else {
                                // If it's not JSON, treat it as plain text
                                setFullResponse(prev => prev + data);
                                onNewResponse(data);
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                            // If parsing fails, treat the data as plain text
                            setFullResponse(prev => prev + data);
                            onNewResponse(data);
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
    }, [onResponseComplete, fullResponse, onNewResponse]);

    return {
        isLoading,
        error,
        fullResponse,
        handleSubmit: fetchMistralResponse,
    };
};