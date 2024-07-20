import { useState, useCallback, useEffect } from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { generateCelticCrossPositions, generateThreeCardPositions } from '../utils/cardPositions';
import { useMistralResponse } from './useMistralResponse';

export const useSpread = (spreadType, selectedLanguage) => {
  const { getToken, user } = useKindeAuth();
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dealCards, setDealCards] = useState(false);
  const [revealCards, setRevealCards] = useState(false);
  const [revealedCards, setRevealedCards] = useState(0);
  const [dealingComplete, setDealingComplete] = useState(false);
  const [shouldDrawNewSpread, setShouldDrawNewSpread] = useState(false);
  const [mostCommonCards, setMostCommonCards] = useState('');
  const [cards, setCards] = useState([]);
  const [floatingCardsComplete, setFloatingCardsComplete] = useState(false);
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [monitorOutput, setMonitorOutput] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [currentDrawId, setCurrentDrawId] = useState(null);

  const handleResponseComplete = useCallback(() => {
    setIsStreaming(false);
  }, []);

  const handleNewResponse = useCallback((content) => {
    setCurrentResponse(prevResponse => prevResponse + content);
    setMonitorOutput(prevOutput => prevOutput + content);
    setIsStreaming(true);
  }, []);

  const {
    isLoading: isLoadingMistral,
    handleSubmit: handleMistralSubmit,
    fullResponse,
    error: mistralError
  } = useMistralResponse(handleNewResponse, handleResponseComplete);

  const fetchSpread = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const origin = window.location.origin;

      const headers = {
        'Content-Type': 'application/json',
        'Origin': origin,
        'Authorization': `Bearer ${token}`,
        'User-ID': user?.id,
      };

      const endpoint = spreadType === 'celtic' ? 'draw_celtic_spreads' : 'draw_three_card_spread';
      
      const baseUrl = process.env.REACT_APP_BASE_URL;
      const url = `${baseUrl}/${endpoint}`;
      
      const response = await fetch(url, { 
        method: 'GET', 
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      const data = JSON.parse(responseText);

      // Set the current draw ID
      setCurrentDrawId(data.id);

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const positions = spreadType === 'celtic' 
        ? generateCelticCrossPositions(data.positions.length, windowWidth, windowHeight)
        : generateThreeCardPositions(data.positions.length, windowWidth, windowHeight);
      
      const newPositions = positions.map((pos, index) => ({
        ...data.positions[index],
        left: pos.left,
        top: pos.top,
        tooltip: data.positions[index].position_name
      }));
      
      setPositions(newPositions);
      const newCards = newPositions.map(pos => ({
        name: pos.most_common_card,
        img: pos.most_common_card_img,
        orientation: pos.orientation,
        position_name: pos.position_name,
        tooltip: pos.position_name
      }));
      setCards(newCards);
  
      const formattedMostCommonCards = data.positions.map(
        (pos) => `Most common card at ${pos.position_name}: ${pos.most_common_card} - Orientation: ${pos.orientation}`
      ).join('\n');
      setDealCards(true); 
      setMostCommonCards(formattedMostCommonCards);
    } catch (error) {
      console.error('Error drawing spread:', error);
      setError({ message: `Failed to draw spread: ${error.message}. Please check your network connection and try again.` });
      setCards([]);
    } finally {
      setIsLoading(false);
      setShouldDrawNewSpread(false);
    }
  }, [getToken, spreadType, user]);

  const handleDealingComplete = useCallback(() => {
    setDealingComplete(true);
    if (!isRequesting) {
      setIsRequesting(true);
      handleMistralSubmit(mostCommonCards, currentDrawId).finally(() => {
        setIsRequesting(false);
      });
    }
  }, [mostCommonCards, isRequesting, handleMistralSubmit, currentDrawId]);

  const handleExitComplete = useCallback(() => {
    setFloatingCardsComplete(true);
    setTimeout(() => {
      setRevealCards(true);
      setRevealedCards(cards.length);
      setTimeout(() => {
        handleDealingComplete();
        setAnimationsComplete(true);
      }, 750);
    }, 500);
  }, [cards.length, handleDealingComplete]);

  const handleMonitorOutput = useCallback((content) => {
    setMonitorOutput(prevOutput => prevOutput + content);
  }, []);

  const drawSpread = useCallback(() => {
    setDealCards(false);
    setRevealCards(false);
    setDealingComplete(false);
    setShouldDrawNewSpread(true);
    fetchSpread();
  }, [fetchSpread]);

  const handleAnimationStart = useCallback(() => {
    setAnimationStarted(true);
  }, []);

  const handleDrawClick = useCallback(() => {
    setCurrentResponse('');
    setMonitorOutput('');
    fetchSpread().then(() => {
      if (mostCommonCards) {
        handleMistralSubmit(mostCommonCards, currentDrawId);
      }
    });
  }, [fetchSpread, handleMistralSubmit, mostCommonCards, currentDrawId]);

  useEffect(() => {
    if (dealingComplete && !isRequesting && currentDrawId) {
      handleMistralSubmit(mostCommonCards, currentDrawId);
    }
  }, [dealingComplete, isRequesting, handleMistralSubmit, mostCommonCards, currentDrawId]);

  return {
    positions,
    isLoading,
    error,
    dealCards,
    revealCards,
    revealedCards,
    dealingComplete,
    shouldDrawNewSpread,
    mostCommonCards,
    cards,
    floatingCardsComplete,
    animationsComplete,
    animationStarted,
    isStreaming,
    monitorOutput,
    currentResponse,
    isRequesting,
    isLoadingMistral,
    handleExitComplete,
    handleMonitorOutput,
    drawSpread,
    handleAnimationStart,
    handleDrawClick,
    handleSubmit: handleMistralSubmit,
    setRevealedCards,
    mistralError,
    fullResponse
  };
};