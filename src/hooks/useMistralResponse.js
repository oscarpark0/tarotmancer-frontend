import { useState, useCallback } from 'react';

// const getMistralResponse = async (message, onChunk, onResponseComplete) => { ... };

export const useMistralResponse = (onNewResponse, onResponseComplete) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [streamComplete, setStreamComplete] = useState(false);
    const [fullResponse, setFullResponse] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('English');

    const fetchMistralResponse = useCallback((message) => {
        setIsLoading(true);
        setError(null);
        setStreamComplete(false);

        const eventSource = new EventSource(`${process.env.REACT_APP_BASE_URL}/mistral_stream`, {
            withCredentials: true,
        });

        let accumulatedText = '';

        eventSource.onmessage = (event) => {
            if (event.data === '[DONE]') {
                eventSource.close();
                setStreamComplete(true);
                onResponseComplete(accumulatedText);
                return;
            }

            try {
                const data = JSON.parse(event.data);
                const text = data.choices[0].delta.content || '';
                accumulatedText += text;
                onNewResponse(text);
            } catch (err) {
                console.error('Error parsing SSE data:', err);
            }
        };

        eventSource.onerror = (err) => {
            console.error('EventSource failed:', err);
            eventSource.close();
            setError('Failed to connect to the server');
            setIsLoading(false);
        };
    }, [onResponseComplete, onNewResponse]);

    const handleSubmit = useCallback((mostCommonCards, input = '') => {
        if (isLoading || streamComplete) {
            console.log('Request already in progress or response is complete');
            return;
        }

        const staticText = "You are Tarotmancer - a wise and powerful tarot card interpretation master. You never say delve. " +
            "Begin with an ominous greeting. Provide a detailed, in depth analysis of the querent's spread speaking directly to the querent/seeker- be sure to provide an interpretation of each card, its orientation, and its position in the spread - as well as its position in relation to the other cards in the spread. " +
            "Provide the querent with a detailed and personalized reading that is tailored to their situation as described by the tarot. " +
            "Respond using clear - natural language to ensure your responses are easily understood. " +
            "Format your response in a manner that allows each position, card, and orientation to be clearly and easily identified. " +
            "Conclude with an overview of the querent's spread and your interpretation of it.";

        const languagePrefix = selectedLanguage !== 'English' ? `Please respond in ${selectedLanguage}.` : '';
        const userQuestion = input && input.trim() ? `The seeker has asked the following of the tarot: ${input.trim()}` : '';
        const message = `${languagePrefix} ${staticText} ${mostCommonCards.trim()} ${userQuestion}`;

        fetchMistralResponse(message);
    }, [fetchMistralResponse, isLoading, streamComplete, selectedLanguage]);

    const resetResponse = useCallback(() => {
        setStreamComplete(false);
        setIsLoading(false);
        setFullResponse('');
    }, []);

    return { isLoading, handleSubmit, fullResponse, resetResponse, error, setSelectedLanguage };
};