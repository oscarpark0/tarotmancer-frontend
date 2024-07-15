// src/CelticSpread.jsx
import React, { useMemo } from 'react';
import AnimatedGridPattern from './components/AnimatedGridPattern.tsx';
import CardReveal from './components/CardReveal';
import FloatingCards from './components/FloatingCards';
import Robot from './components/Robot';
import ErrorBoundary from './components/ErrorBoundary';
import { useAppContext } from './contexts/AppContext';
import { SpreadProvider, useSpreadContext } from './contexts/SpreadContext';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

const CelticSpreadContent = React.memo(({ isMobile, isDarkMode }) => {
  const { selectedSpread, handleSpreadSelect, selectedLanguage } = useAppContext();
  const {
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
    handleSubmit  } = useSpreadContext();

  const memoizedRobot = useMemo(() => (
    <Robot
      dealCards={dealCards}
      cardPositions={positions}
      revealedCards={revealedCards}
      finalCardPositions={positions.map(pos => ({ left: pos.left, top: pos.top }))}
      onExitComplete={handleExitComplete}
      revealCards={revealCards}
      shouldDrawNewSpread={shouldDrawNewSpread}
      onMonitorOutput={handleMonitorOutput}
      drawSpread={drawSpread}
      dealingComplete={dealingComplete}
      mostCommonCards={mostCommonCards}
      isMobile={isMobile}
      cards={cards}
      selectedSpread={selectedSpread}
      onSpreadSelect={handleSpreadSelect}
      animationsComplete={animationsComplete}
      isDarkMode={isDarkMode}
      onAnimationStart={handleAnimationStart}
      isStreaming={isStreaming}
      currentResponse={currentResponse}
      selectedLanguage={selectedLanguage}
      isRequesting={isRequesting}
      handleSubmit={handleSubmit}
      isLoading={isLoadingMistral}
      handleDrawClick={handleDrawClick}
      isDrawing={isRequesting}
      monitorOutput={monitorOutput}
    />
  ), [dealCards, positions, revealedCards, handleExitComplete, revealCards, shouldDrawNewSpread, handleMonitorOutput, drawSpread, dealingComplete, mostCommonCards, isMobile, cards, selectedSpread, handleSpreadSelect, animationsComplete, isDarkMode, handleAnimationStart, isStreaming, currentResponse, selectedLanguage, isRequesting, handleSubmit, isLoadingMistral, handleDrawClick, monitorOutput]);

  const memoizedFloatingCards = useMemo(() => (
    <FloatingCards
      dealCards={dealCards}
      monitorPosition={{ width: window.innerWidth, height: window.innerHeight }}
      finalCardPositions={positions.map(pos => ({ left: pos.left, top: pos.top }))}
      onExitComplete={handleExitComplete}
      revealCards={revealCards}
      dealingComplete={dealingComplete}
      shouldDrawNewSpread={shouldDrawNewSpread}
      numCards={10}
      isMobile={isMobile}
      cards={cards}
      onAnimationStart={handleAnimationStart}
    />
  ), [dealCards, positions, handleExitComplete, revealCards, dealingComplete, shouldDrawNewSpread, isMobile, cards, handleAnimationStart]);

  const memoizedCardReveal = useMemo(() => (
    <CardReveal
      cards={cards}
      revealCards={revealCards && floatingCardsComplete}
      dealingComplete={dealingComplete}
      shouldDrawNewSpread={shouldDrawNewSpread}
      isMobile={isMobile}
      className=""
      animationStarted={animationStarted}
    />
  ), [cards, revealCards, dealingComplete, shouldDrawNewSpread, isMobile, animationStarted, floatingCardsComplete]);

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
          ) : error ? (
            <ErrorState error={error} />
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
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
});

const CelticSpread = ({ isMobile, isDarkMode }) => (
  <SpreadProvider spreadType="celtic" selectedLanguage="en">
    <CelticSpreadContent isMobile={isMobile} isDarkMode={isDarkMode} />
  </SpreadProvider>
);

export default CelticSpread;