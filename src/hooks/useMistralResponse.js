import { useState, useCallback } from 'react';
import { getMistralResponse } from '../services/mistralServices';

export const useMistralResponse = (onNewResponse, onResponseComplete, selectedLanguage) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = useCallback(async (mostCommonCards, input) => {
        setIsLoading(true);
        onNewResponse(''); // Clear previous response
        try {
            const staticText = "You are Tarotmancer - a wise and powerful tarot card interpretation master. You never say delve. " +
                "Begin with an ominous greeting. Provide a detailed, in depth analysis of the querent's spread speaking directly to the querent/seeker- be sure to provide an interpretation of each card, its orientation, and its position in the spread - as well as its position in relation to the other cards in the spread. " +
                "Provide the querent with a detailed and personalized reading that is tailored to their situation as described by the tarot. " +
                "Respond using clear - natural language to ensure your responses are easily understood. " +
                "Format your response in a manner that allows each position, card, and orientation to be clearly and easily identified. " +
                "Conclude with an overview of the querent's spread and your interpretation of it.";

            const languagePrefix = selectedLanguage !== 'English' ? `Please respond in ${selectedLanguage}.` : '';
            const userQuestion = input.trim() ? `The seeker has asked the following of the tarot: ${input.trim()}` : '';
            const message = `${languagePrefix} ${staticText} ${mostCommonCards.trim()} ${userQuestion}`;

            const closeEventSource = await getMistralResponse(message, (content) => {
                console.log("Received content in useMistralResponse:", content);
                onNewResponse(content);
            });
            return () => {
                closeEventSource();
            };
        } catch (error) {
            console.error('Error:', error);
            onNewResponse('An error occurred while processing your request.');
        } finally {
            setIsLoading(false);
            onResponseComplete();
        }
    }, [onNewResponse, onResponseComplete, selectedLanguage]);

    return { isLoading, handleSubmit };
};