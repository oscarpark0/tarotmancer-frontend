import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import AnimatedGridPattern from './components/AnimatedGridPattern.tsx';
import CardReveal from './components/CardReveal';
import FloatingCards from './components/FloatingCards';
import Robot from './components/Robot';
import AnonymousDrawLimitInfo from './components/AnonymousDrawLimitInfo.tsx';
import { API_BASE_URL } from './utils/config.tsx';
import { generateCelticCrossPositions, generateThreeCardPositions } from './utils/cardPositions.js';
import ErrorBoundary from './components/ErrorBoundary';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useLanguage } from './contexts/LanguageContext';
import { useTranslation } from './utils/translations';
import PastDrawsModal from './components/PastDrawsModal';
import { debounce } from 'lodash';

const SpreadComponent = React.memo(({ isMobile, onSpreadSelect, selectedSpread, isDarkMode, canDraw, timeUntilNextDraw, getToken, onDraw, lastDrawTime, onDrawComplete, remainingDrawsToday, setRemainingDrawsToday, lastResetTime, setLastResetTime = () => {}, drawCount, setDrawCount }) => {
  const { user } = useKindeAuth();
  const { selectedLanguage } = useLanguage();
  const { getTranslation } = useTranslation();

  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dealCards, setDealCards] = useState(false);
  const [revealedCards, setRevealedCards] = useState(0);
  const [shouldDrawNewSpread, setShouldDrawNewSpread] = useState(false);
  const [mostCommonCards, setMostCommonCards] = useState('');
  const formRef = useRef(null);
  const [cards, setCards] = useState([]);
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentDrawId, setCurrentDrawId] = useState(null);
  const [isPastDrawsModalOpen, setIsPastDrawsModalOpen] = useState(false);
  const [isRobotExpanded, setIsRobotExpanded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const handleRevealCards = useCallback(() => {
    setRevealedCards(prevCards => cards.length);
  }, [cards.length]);

  const handleSubmitInput = useCallback((value) => {
    if (formRef.current) {
      formRef.current.submitInput(value);
    }
  }, []);

  const handleDealingComplete = useCallback(() => {
    handleSubmitInput(mostCommonCards);
  }, [handleSubmitInput, mostCommonCards]);

  const handleStreamingStateChange = useCallback((isStreaming) => {
    setIsStreaming(isStreaming);
  }, []);

  const debouncedFetchSpread = useMemo(
    () => debounce(async () => {
      console.log('Debounced fetchSpread called');
      
      // Check if anonymous user (no authenticated user)
      const isAnonymousUser = !user || !user.id || user.id.startsWith('anon_');
      const userId = isAnonymousUser ? localStorage.getItem('anonymousUserId') : user.id;
      
      if (!userId) {
        setError('User ID not available. Please try again or log in.');
        return;
      }
      
      if (!canDraw) {
        setError(`You can draw again in ${timeUntilNextDraw}`);
        return;
      }
      
      setIsLoading(true);
      console.log(`Initiating draw for user: ${userId}, Current draw count: ${drawCount}`);
      
      try {
        // Handle authenticated and guest users differently
        const isAnonymousUser = !user || !user.id || user.id.startsWith('anon_');
        const newDrawId = Date.now();
        let data;
        // Variables for rate limiting
        let remainingDrawsToday = null;
        let resetTime = null;
        
        if (isAnonymousUser) {
          console.log('Using client-side simulation for guest user');
          
          // Import the API helpers for anonymous users
          const { recordAnonymousDraw, simulateGuestDraw } = await import('./utils/api');
          
          // Record draw in local storage with time limit
          recordAnonymousDraw();
          
          // Simulate a draw client-side
          data = simulateGuestDraw(selectedSpread);
          
          // Add slight delay to simulate network request
          await new Promise(resolve => setTimeout(resolve, 500));
          
          console.log('Generated client-side data for guest user:', data);
          
          // For guests, we're enforcing a single draw per 48 hours
          remainingDrawsToday = 0; // They just used their one draw
          // Set reset time to 48 hours from now
          resetTime = Math.floor((Date.now() + (48 * 60 * 60 * 1000)) / 1000);
        } 
        else {
          // For authenticated users, use the server API
          const token = await getToken();
          const origin = window.location.origin;
          
          // Create headers for authenticated users
          const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': origin,
            'User-ID': userId,
            'Draw-ID': newDrawId.toString(),
            'Authorization': `Bearer ${token}`
          };
          
          // Use the correct endpoint names according to backend registration
          const endpoint = selectedSpread === 'celtic' ? 'api/draw-celtic-spreads' : 'api/draw-three-card-spread';
          console.log(`Calling endpoint: ${API_BASE_URL}/${endpoint}`);
          
          const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'GET',
            headers: headers,
            credentials: 'include',
          });
  
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response from server: ${errorText}`);
            throw new Error(`${getTranslation('failedToDrawSpread')}: ${response.status}`);
          }
  
          try {
            data = await response.json();
            
            // Get rate limit headers for authenticated users
            remainingDrawsToday = response.headers.get('X-RateLimit-Remaining');
            resetTime = response.headers.get('X-RateLimit-Reset');
          } catch (e) {
            console.error('Failed to parse server response:', e);
            throw new Error(getTranslation('checkNetworkAndTryAgain'));
          }
        }

        console.log(`Draw completed. New draw ID: ${newDrawId}`);
        setCurrentDrawId(newDrawId);
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const positions = selectedSpread === 'celtic'
          ? generateCelticCrossPositions(data.positions.length, windowWidth, windowHeight)
          : generateThreeCardPositions(data.positions.length, windowWidth, windowHeight);

        const newPositions = positions.map((pos, index) => ({
          ...data.positions[index],
          left: pos.left,
          top: pos.top,
          tooltip: data.positions[index].position_name
        }));

        const newCards = newPositions.map(pos => ({
          name: pos.most_common_card,
          img: pos.most_common_card_img,
          orientation: pos.orientation,
          position_name: pos.position_name,
          tooltip: pos.position_name
        }));
        const formattedMostCommonCards = data.positions.map(
          (pos) => `Most common card at ${pos.position_name}: ${pos.most_common_card} - Orientation: ${pos.orientation}`
        ).join('\n');

        if (remainingDrawsToday !== null) {
          setRemainingDrawsToday(parseInt(remainingDrawsToday, 10));
          // Update drawCount based on remainingDrawsToday
          setDrawCount(5 - parseInt(remainingDrawsToday, 10));
        }

        if (resetTime !== null && typeof setLastResetTime === 'function') {
          setLastResetTime(parseInt(resetTime, 10) * 1000);
        }

        // Update state in a single batch
        setPositions(newPositions);
        setCards(newCards);
        setDealCards(true);
        setMostCommonCards(formattedMostCommonCards);
        setCurrentDrawId(newDrawId);

        // Call onDrawComplete only once here
        console.log('Calling onDrawComplete');
        onDrawComplete();

      } catch (error) {
        console.error('Error drawing spread:', error);
        setError('Failed to draw spread. Please try again later.');
        setCards([]);
        setCurrentDrawId(null);
      } finally {
        setIsLoading(false);
        setShouldDrawNewSpread(false);
      }
    }, 300), // 300ms debounce time
    [user, canDraw, timeUntilNextDraw, getToken, selectedSpread, setError, setCards, setPositions, setDealCards, setMostCommonCards, setCurrentDrawId, onDrawComplete, setRemainingDrawsToday, setLastResetTime, drawCount, setDrawCount]
  );

  const drawSpread = useCallback(async () => {
    console.log("Starting new draw sequence");
    
    // Clear current state
    setShowCards(false); // Hide the current cards
    setDealCards(false); // Stop current dealing animation
    setRevealedCards(0); // Reset revealed cards counter
    
    // Reset state with a small delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Clear arrays
    setCards([]); // Clear the current cards array
    setPositions([]); // Clear the current positions array
    
    // Wait for a short time to allow the cards to disappear fully
    await new Promise(resolve => setTimeout(resolve, 300));

    setIsLoading(true);
    setError(null);
    setShouldDrawNewSpread(true);
    setAnimationsComplete(false);

    try {
      console.log("Fetching new spread data");
      // Force a new draw by calling the debounced function
      await debouncedFetchSpread();
      onDraw();
      
      // Signal that new cards should be dealt
      setTimeout(() => {
        console.log("Setting dealCards to true");
        setDealCards(true);
      }, 200);
    } catch (error) {
      console.error('Error in drawSpread:', error);
      setError(error.message || 'An error occurred while drawing the spread.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedFetchSpread, onDraw, setRevealedCards]);

  const handleExitComplete = useCallback(() => {
    setTimeout(() => {
      handleRevealCards();
      setTimeout(() => {
        handleDealingComplete();
        setAnimationsComplete(true);
      }, 750);
    }, 500);
  }, [handleDealingComplete, handleRevealCards]);

  const handleMonitorOutput = useCallback(() => {}, []);

  const handleOpenPastDraws = useCallback(() => {
    setIsPastDrawsModalOpen(true);
  }, []);

  const handleNewResponse = useCallback(() => {
    setIsStreaming(true);
    console.log(`[handleNewResponse] setIsStreaming: ${setIsStreaming}`);
  }, []);

  const handleResponseComplete = useCallback(() => {
    setIsStreaming(false);
    console.log(`[handleResponseComplete] setIsStreaming: ${setIsStreaming}`);
  }, []);

  const handleAnimationStart = useCallback(() => {
  }, []);

  const handleToggleRobotExpand = useCallback(() => {
    setIsRobotExpanded(prev => !prev);
  }, []);

  const handleAnimationComplete = useCallback((isLastCard) => {
    console.log('FloatingCards animation completed', isLastCard);
    
    // Only proceed if this is the last card animation completing
    if (isLastCard) {
      // Ensure we don't show cards immediately, but with a short delay
      // to allow for proper transition between animations
      setTimeout(() => {
        console.log('Now showing cards');
        setShowCards(true);
        
        // Reset the redraw flag only after cards are fully visible
        setTimeout(() => {
          setShouldDrawNewSpread(false);
          console.log('Animation sequence completed');
        }, 500);
      }, 300);
    }
  }, []);

  // Add this effect to force re-render when language changes
  useEffect(() => {
    // This empty dependency array ensures the effect runs when selectedLanguage changes
  }, [selectedLanguage]);

  // Add this effect to log the timeUntilNextDraw value
  useEffect(() => {
  }, [timeUntilNextDraw]);

  const memoizedRobot = useMemo(() => (
    <Robot
      dealCards={dealCards}
      cardPositions={positions}
      revealedCards={revealedCards}
      finalCardPositions={positions.map(pos => ({ left: pos.left, top: pos.top }))}
      onExitComplete={handleExitComplete}
      revealCards={handleRevealCards}
      shouldDrawNewSpread={shouldDrawNewSpread}
      onMonitorOutput={handleMonitorOutput}
      drawSpread={drawSpread}
      dealingComplete={handleDealingComplete}
      mostCommonCards={mostCommonCards}
      formRef={formRef}
      onSubmitInput={handleSubmitInput}
      isMobile={isMobile}
      cards={cards}
      selectedSpread={selectedSpread}
      onSpreadSelect={onSpreadSelect}
      fetchSpread={debouncedFetchSpread}
      onNewResponse={handleNewResponse}
      onResponseComplete={handleResponseComplete}
      animationsComplete={animationsComplete}
      isDarkMode={isDarkMode}
      onAnimationStart={handleAnimationStart}
      onStreamingStateChange={handleStreamingStateChange}
      isStreaming={isStreaming}
      canDraw={canDraw}
      timeUntilNextDraw={timeUntilNextDraw}
      currentDrawId={currentDrawId}
      setCurrentDrawId={setCurrentDrawId}
      onOpenPastDraws={handleOpenPastDraws}
      onDraw={onDraw}
      selectedLanguage={selectedLanguage}
      getTranslation={getTranslation}
      lastDrawTime={lastDrawTime}
      user={user}
      remainingDrawsToday={remainingDrawsToday}
      setRemainingDrawsToday={setRemainingDrawsToday}
      onDrawComplete={onDrawComplete}
      drawCount={drawCount}
      setDrawCount={setDrawCount}
      userId={user ? user.id : null}
      isRobotExpanded={isRobotExpanded}
      onToggleRobotExpand={handleToggleRobotExpand}
      isDrawing={isDrawing}
      setIsDrawing={setIsDrawing}
      onAnimationComplete={handleAnimationComplete}
    />
  ), [dealCards, positions, revealedCards, handleExitComplete, handleRevealCards, shouldDrawNewSpread, handleMonitorOutput, drawSpread, handleDealingComplete, mostCommonCards, handleSubmitInput, isMobile, cards, selectedSpread, onSpreadSelect, debouncedFetchSpread, handleNewResponse, handleResponseComplete, animationsComplete, isDarkMode, handleAnimationStart, handleStreamingStateChange, isStreaming, canDraw, timeUntilNextDraw, currentDrawId, handleOpenPastDraws, onDraw, selectedLanguage, getTranslation, lastDrawTime, user, remainingDrawsToday, setRemainingDrawsToday, onDrawComplete, drawCount, setDrawCount, isRobotExpanded, handleToggleRobotExpand, isDrawing, setIsDrawing, handleAnimationComplete]);

  const memoizedFloatingCards = useMemo(() => (
    <FloatingCards
      dealCards={dealCards}
      monitorPosition={{ width: window.innerWidth, height: window.innerHeight }}
      finalCardPositions={positions.map(pos => ({ left: pos.left, top: pos.top }))}
      onExitComplete={handleExitComplete}
      revealCards={handleRevealCards}
      dealingComplete={handleDealingComplete}
      shouldDrawNewSpread={shouldDrawNewSpread}
      numCards={selectedSpread === 'celtic' ? 10 : 3}
      isMobile={isMobile}
      cards={cards}
      onAnimationStart={handleAnimationStart}
      onAnimationComplete={handleAnimationComplete}
    />
  ), [dealCards, positions, handleExitComplete, handleRevealCards, handleDealingComplete, shouldDrawNewSpread, isMobile, cards, handleAnimationStart, selectedSpread, handleAnimationComplete]);

  // Check if user is anonymous
  const isAnonymousUser = !user || !user.id || user.id.startsWith('anon_');
  
  // Check if anonymous user hasn't drawn yet (no draw data in localStorage)
  const hasNoDrawHistory = isAnonymousUser && !localStorage.getItem('anonDrawData');

  return (
    <ErrorBoundary>
      <div className={`w-full flex flex-col justify-center fixed ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-amber-100 via-blue to-white'} min-h-screen`}
           style={{ overflow: 'hidden' }}>
        <AnimatedGridPattern
          className="absolute inset-0"
          color="#00ff00"
          fill="#000000"
          positions={positions}
          isDarkMode={isDarkMode}
          isMobile={isMobile}
          isPaused={isStreaming}
        />
        <div className="relative w-full h-screen" 
             style={{ overflowY: 'auto', overflowX: 'hidden', paddingBottom: isMobile ? '150px' : '0' }}>
          {isLoading ? (
            <p className="text-2xl text-green-600 text-center animate-pulse" style={{ zIndex: 9999, position: 'relative' }}>
              {getTranslation('processing')}
            </p>
          ) : error ? (
            <p className="text-4xl text-red-600 text-center" style={{ zIndex: 9999, position: 'relative' }}>
              {error}
            </p>
          ) : null}
          <div className={`flex flex-col items-center ${isMobile ? 'mobile-layout' : ''}`}
               style={{ position: 'relative', minHeight: '100vh', paddingBottom: isMobile ? '350px' : '0' }}>
            {memoizedRobot}
            
            {/* Show anonymous user draw limit info for first-time anonymous users */}
            {hasNoDrawHistory && (
              <div className="draw-limits-container" style={{ 
                marginTop: isMobile ? '300px' : '60px', 
                position: 'relative', 
                zIndex: 2000,
                width: '100%',
                maxWidth: '600px',
                padding: '0 15px'
              }}>
                <AnonymousDrawLimitInfo />
              </div>
            )}
          </div>
          {positions.length > 0 && (
            <div className="relative z-10 w-full flex flex-col items-center">
              <div style={{ position: 'relative', zIndex: 1, marginTop: '30px' }}>
                <section className="relative z-10 mb-16 w-full">
                  <ErrorBoundary>
                    {memoizedFloatingCards}
                  </ErrorBoundary>
                  <CardReveal
                    cards={cards}
                    showCards={showCards}
                    isMobile={isMobile}
                  />
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
      <PastDrawsModal
        isOpen={isPastDrawsModalOpen}
        onClose={() => setIsPastDrawsModalOpen(false)}
      />
    </ErrorBoundary>
  );
});

SpreadComponent.propTypes = {
  isMobile: PropTypes.bool,
  onSpreadSelect: PropTypes.func,
  selectedSpread: PropTypes.string,
  isDarkMode: PropTypes.bool,
  canDraw: PropTypes.bool,
  timeUntilNextDraw: PropTypes.string,
  getToken: PropTypes.func.isRequired,
  onDraw: PropTypes.func.isRequired,
  lastDrawTime: PropTypes.string,
  onDrawComplete: PropTypes.func.isRequired,
  remainingDrawsToday: PropTypes.number.isRequired,
  setRemainingDrawsToday: PropTypes.func.isRequired,
  lastResetTime: PropTypes.number,
  setLastResetTime: PropTypes.func, // This is optional but we provide a default
  drawCount: PropTypes.number.isRequired,
  setDrawCount: PropTypes.func.isRequired,
};

// Default props to prevent TypeError
SpreadComponent.defaultProps = {
  setLastResetTime: () => {},
  isMobile: false,
  onSpreadSelect: () => {},
  selectedSpread: 'three',
  isDarkMode: false,
  canDraw: true,
  timeUntilNextDraw: '',
  lastDrawTime: '',
  lastResetTime: null,
};

export default SpreadComponent;