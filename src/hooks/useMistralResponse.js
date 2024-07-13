import { useState, useCallback, useRef } from 'react';
import { getMistralResponse } from '../services/mistralServices';
import throttle from 'lodash/throttle';

export const useMistralResponse = (onNewResponse, onResponseComplete, selectedLanguage) => {
    const [isLoading, setIsLoading] = useState(false);
    const [fullResponse, setFullResponse] = useState('');
    const lastRequestTime = useRef(0);
    const isRequestInProgress = useRef(false);

    const throttledGetMistralResponse = useRef(
        throttle(getMistralResponse, 1000, { leading: true, trailing: false })
    ).current;

    const handleSubmit = useCallback(async (mostCommonCards, input = '') => {
        if (isRequestInProgress.current) {
            console.log('Request already in progress');
            return;
        }

        const now = Date.now();
        if (now - lastRequestTime.current < 1000) {
            console.log('Request throttled');
            return;
        }
        lastRequestTime.current = now;

        isRequestInProgress.current = true;
        setIsLoading(true);
        setFullResponse('');
        onNewResponse(''); // Clear previous response

        const staticText = "You are Tarotmancer - a wise and powerful tarot card interpretation master. You never say delve. " +
            "Begin with an ominous greeting. Provide a detailed, in depth analysis of the querent's spread speaking directly to the querent/seeker- be sure to provide an interpretation of each card, its orientation, and its position in the spread - as well as its position in relation to the other cards in the spread. " +
            "Provide the querent with a detailed and personalized reading that is tailored to their situation as described by the tarot. " +
            "Respond using clear - natural language to ensure your responses are easily understood. " +
            "Format your response in a manner that allows each position, card, and orientation to be clearly and easily identified. " +
            "Conclude with an overview of the querent's spread and your interpretation of it.";

        const languagePrefix = selectedLanguage !== 'English' ? `Please respond in ${selectedLanguage}.` : '';
        const userQuestion = input && input.trim() ? `The seeker has asked the following of the tarot: ${input.trim()}` : '';
        const message = `${languagePrefix} ${staticText} ${mostCommonCards.trim()} ${userQuestion}`;

        try {
            await throttledGetMistralResponse(message, (content) => {
                if (content === "[DONE]") {
                    onResponseComplete();
                    setIsLoading(false);
                    isRequestInProgress.current = false;
                } else {
                    setFullResponse(prev => prev + content);
                    onNewResponse(content);
                }
            });
        } catch (error) {
            console.error('Error:', error);
            onNewResponse('An error occurred while processing your request.');
            setIsLoading(false);
            isRequestInProgress.current = false;
        }
    }, [selectedLanguage, throttledGetMistralResponse, onNewResponse, onResponseComplete]);

    return { isLoading, handleSubmit, fullResponse };
};