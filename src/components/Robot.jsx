import React, { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import FloatingCards from './FloatingCards.jsx';
import CommandTerminal from './CommandTerminal.jsx';
import './Robot.css';
import { debounce } from 'lodash';

const debouncedAdjustFontSize = debounce(() => {
  const monitorOutputElement = document.querySelector('.monitor-output');
  const screenContentElement = document.querySelector('.screen-content');

  if (monitorOutputElement && screenContentElement) {
    const screenHeight = screenContentElement.offsetHeight;
    const outputHeight = monitorOutputElement.scrollHeight;

    if (outputHeight > screenHeight) {
      let fontSize = 240;
      monitorOutputElement.style.fontSize = `${fontSize}px`;

      while (monitorOutputElement.scrollHeight > screenHeight && fontSize > 20) {
        fontSize -= 2;
        monitorOutputElement.style.fontSize = `${fontSize}px`;
      }
    }
  }
}, 300);

const Robot = ({
  dealCards,
  cardPositions,
  finalCardPositions,
  onExitComplete,
  revealCards,
  shouldDrawNewSpread,
  onMonitorOutput,
  drawSpread,
  dealingComplete,
  mostCommonCards,
  formRef,
  onSubmitInput,
  selectedSpread,
  onSpreadSelect,
  isMobile,
  cards
}) => {
  const [monitorPosition, setMonitorPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [monitorOutput, setMonitorOutput] = useState('');
  const screenContentRef = useRef(null);
  const commandTerminalRef = useRef(null);

  useEffect(() => {
    if (dealCards) {
      setTimeout(onExitComplete, 2000);
    }
  }, [dealCards, onExitComplete]);

  useEffect(() => {
    if (screenContentRef.current && commandTerminalRef.current) {
      const screenRect = screenContentRef.current.getBoundingClientRect();
      setMonitorPosition({
        x: screenRect.x,
        y: screenRect.y,
        width: screenRect.width,
        height: screenRect.height,
      });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (commandTerminalRef.current) {
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMonitorOutput = useCallback((output) => {
    const adjustMonitorOutputFontSize = () => {
      debouncedAdjustFontSize();
    };

    setMonitorOutput(output);
    adjustMonitorOutputFontSize();
  }, []);

  useEffect(() => {
    if (dealingComplete && mostCommonCards) {
      onSubmitInput(mostCommonCards);
    }
  }, [dealingComplete, mostCommonCards, onSubmitInput]);

  useEffect(() => {
    // Update the robot's behavior based on the selected spread
    // ...
  }, [selectedSpread]);

  return (
    <motion.div
      className="robot-container"
      style={{
        alignItems: 'center',
        position: 'absolute',
        zIndex: 100,
      }}
    >
      <div className="robot-body">
        <div className="tarotmancer-text">tarotmancer</div>
        <div className="robot-head">
          <div className="crt-screen">
            <div className="screen-content" style={{ flexGrow: 1 }}>
              <FloatingCards
                dealCards={dealCards}
                cardPositions={cardPositions}
                monitorPosition={monitorPosition}
                finalCardPositions={finalCardPositions}
                revealCards={revealCards}
                onExitComplete={onExitComplete}
                shouldDrawNewSpread={shouldDrawNewSpread}
                dealingComplete={dealingComplete}
              />
              <div className="monitor-output">{monitorOutput}</div>
            </div>
            <div className="screen-overlay"></div>
            <div className="screen-glass"></div>
            <div className="screen-frame"></div>
            <div className="screen-scanlines"></div>
          </div>
        </div>
      </div>
      <CommandTerminal
        onMonitorOutput={handleMonitorOutput}
        drawSpread={drawSpread}
        onSubmitInput={onSubmitInput}
        mostCommonCards={mostCommonCards}
        dealingComplete={dealingComplete}
        formRef={formRef}
        onSpreadSelect={onSpreadSelect}
        selectedSpread={selectedSpread}
        ref={commandTerminalRef}
        isMobile={isMobile}
        cards={cards}
        revealCards={revealCards}
        shouldDrawNewSpread={shouldDrawNewSpread}
      />
    </motion.div>
  );
};

Robot.propTypes = {
  dealCards: PropTypes.bool.isRequired,
  cardPositions: PropTypes.array.isRequired,
  finalCardPositions: PropTypes.array.isRequired,
  onExitComplete: PropTypes.func.isRequired,
  revealCards: PropTypes.bool.isRequired,
  shouldDrawNewSpread: PropTypes.bool.isRequired,
  onMonitorOutput: PropTypes.func.isRequired,
  drawSpread: PropTypes.func.isRequired,
  dealingComplete: PropTypes.bool.isRequired,
  mostCommonCards: PropTypes.string.isRequired,
  formRef: PropTypes.object.isRequired,
  onSubmitInput: PropTypes.func.isRequired,
  selectedSpread: PropTypes.string.isRequired,
  onSpreadSelect: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  cards: PropTypes.array.isRequired
};

export default Robot;
