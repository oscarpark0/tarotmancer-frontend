// src/TarotSpread.jsx
import React, { useMemo, useRef, useState, useCallback } from 'react';
import AnimatedGridPattern from './components/AnimatedGridPattern';
import CardReveal from './components/CardReveal';
import FloatingCards from './components/FloatingCards';
import Robot from './components/Robot';
import ErrorBoundary from './components/ErrorBoundary';
import { useAppContext } from './contexts/AppContext';
import { SpreadProvider, useSpreadContext } from './contexts/SpreadContext';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

const TarotSpreadContent = React.memo(({ isMobile, isDarkMode, spreadType }) => {
  const { selectedSpread, handleSpreadSelect, selectedLanguage } = useAppContext();
  const spreadContext = useSpreadContext();
  const { error, handleExitComplete } = spreadContext;

  const [input] = useState('');
  const [isDrawing] = useState(false);
  const formRef = useRef(null);

  const {
    positions,
    isLoading,
    isStreaming,
    currentResponse,
    mistralError,
    fullResponse
  } = spreadContext;

  const memoizedHandleExitComplete = useCallback(() => {
    if (typeof handleExitComplete === 'function') {
      handleExitComplete();
    } else {
      console.error('handleExitComplete is not a function in spreadContext');
    }
  }, [handleExitComplete]);

  const memoizedRobot = useMemo(() => (
    <Robot
      {...spreadContext}
      selectedSpread={selectedSpread}
      onSpreadSelect={handleSpreadSelect}
      selectedLanguage={selectedLanguage}
      isMobile={isMobile}
      isDarkMode={isDarkMode}
      cardPositions={positions}
      finalCardPositions={positions}
      onExitComplete={memoizedHandleExitComplete}
      formRef={formRef}
      input={input}
      isDrawing={isDrawing}
    />
  ), [spreadContext, selectedSpread, handleSpreadSelect, selectedLanguage, isMobile, isDarkMode, positions, memoizedHandleExitComplete, input, isDrawing]);

  const memoizedFloatingCards = useMemo(() => (
    <FloatingCards
      {...spreadContext}
      monitorPosition={{ width: window.innerWidth, height: window.innerHeight }}
      numCards={selectedSpread === 'celtic' ? 10 : 3}
      isMobile={isMobile}
      onExitComplete={memoizedHandleExitComplete}
    />
  ), [spreadContext, selectedSpread, isMobile, memoizedHandleExitComplete]);

  const memoizedCardReveal = useMemo(() => (
    <CardReveal
      {...spreadContext}
      isMobile={isMobile}
      className=""
    />
  ), [spreadContext, isMobile]);

  if (error) {
    return (
      <div className="error-message">
        <h2>Error</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`w-full flex flex-col justify-center fixed ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-amber-100 via-blue to-white'} min-h-screen`}>
        <AnimatedGridPattern 
          className="absolute inset-0" 
          color="#00ff00" 
          fill="#000000" 
          positions={positions} 
          isDarkMode={isDarkMode}
          isMobile={isMobile}
          isPaused={isStreaming}
        />
        <div className="relative w-full h-screen overflow-hidden">
          {isLoading ? (
            <LoadingState />
          ) : error || mistralError ? (
            <ErrorState error={error || mistralError} />
          ) : (
            <>
              <div className={`flex flex-col items-center ${isMobile ? 'mobile-layout' : ''}`}>
                {memoizedRobot}
              </div>
              {positions.length > 0 && !isMobile && (
                <div className="relative z-10 w-full flex flex-col items-center">
                  <div style={{ position: 'relative', zIndex: 1, marginTop: '30px' }}>
                    <section className="relative z-10 mb-16 w-full">
                      <ErrorBoundary>
                        {memoizedFloatingCards}
                      </ErrorBoundary>
                      {memoizedCardReveal}
                    </section>
                  </div>
                </div>
              )}
              {isStreaming && (
                <div className="fixed bottom-0 left-0 right-0 bg-white p-4 overflow-y-auto max-h-60">
                  <p>{currentResponse || fullResponse}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
});

const TarotSpread = ({ isMobile, isDarkMode, spreadType }) => (
  <SpreadProvider spreadType={spreadType}>
    <TarotSpreadContent isMobile={isMobile} isDarkMode={isDarkMode} spreadType={spreadType} />
  </SpreadProvider>
);

export default TarotSpread;