import { useState, useCallback, useRef } from 'react';
import throttle from 'lodash/throttle';

const getMistralResponse = async (message, onChunk) => {
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/mistral_stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const content = line.slice(6);
                if (content === '[DONE]') {
                    onChunk('[DONE]');
                } else {
                    onChunk(content);
                }
            }
        }
    }
};

export const useMistralResponse = (onNewResponse, onResponseComplete, selectedLanguage) => {
    const [isLoading, setIsLoading] = useState(false);
    const [fullResponse, setFullResponse] = useState('');
    const lastRequestTime = useRef(0);
    const isRequestInProgress = useRef(false);
    const isResponseComplete = useRef(false);

    const throttledGetMistralResponse = useRef(
        throttle(getMistralResponse, 1000, { leading: true, trailing: false })
    ).current;

    const handleSubmit = useCallback(async (mostCommonCards, input = '') => {
        if (isRequestInProgress.current || isResponseComplete.current) {
            console.log('Request already in progress or response is complete');
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
                    isResponseComplete.current = true;
                } else {
                    const parsedContent = JSON.parse(content);
                    const textContent = parsedContent.choices[0].delta.content;
                    if (textContent) {
                        setFullResponse(prev => prev + textContent);
                        onNewResponse(textContent);
                    }
                }
            });
        } catch (error) {
            console.error('Error:', error);
            onNewResponse('An error occurred while processing your request.');
            setIsLoading(false);
            isRequestInProgress.current = false;
            isResponseComplete.current = true;
        }
    }, [selectedLanguage, throttledGetMistralResponse, onNewResponse, onResponseComplete]);

    const resetResponse = useCallback(() => {
        isResponseComplete.current = false;
        setFullResponse('');
    }, []);

    return { isLoading, handleSubmit, fullResponse, resetResponse };
};