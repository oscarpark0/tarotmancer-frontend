import React, { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import FloatingCards from './FloatingCards.jsx';
import CardReveal from './CardReveal.jsx';
import CommandTerminal from './CommandTerminal.jsx';
import './Robot.css';
import { debounce } from 'lodash';
import { isMobileDevice } from '../utils/device';

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
  onSubmitInput
}) => {
  const [monitorPosition, setMonitorPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [monitorOutput, setMonitorOutput] = useState('');
  const screenContentRef = useRef(null);

  useEffect(() => {
    if (dealCards) {
      setTimeout(onExitComplete, 2000);
    }
  }, [dealCards, onExitComplete]);

  useEffect(() => {
    if (screenContentRef.current) {
      const rect = screenContentRef.current.getBoundingClientRect();
      setMonitorPosition({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);

  const adjustMonitorOutputFontSize = useCallback(() => {
    debouncedAdjustFontSize();
  }, []);

  const handleMonitorOutput = useCallback((output) => {
    setMonitorOutput(output);
    adjustMonitorOutputFontSize();
  }, [adjustMonitorOutputFontSize]);

  useEffect(() => {
    if (dealingComplete && mostCommonCards) {
      onSubmitInput(mostCommonCards);
    }
  }, [dealingComplete, mostCommonCards, onSubmitInput]);

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
              {isMobileDevice() ? (
                <CardReveal
                  cards={cardPositions}
                  revealCards={revealCards}
                  dealingComplete={dealingComplete}
                  shouldDrawNewSpread={shouldDrawNewSpread}
                />
              ) : (
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
              )}
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
        onsubmitInput={onSubmitInput}
        mostCommonCards={mostCommonCards}
        dealingComplete={dealingComplete}
        formRef={formRef}
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
};

export default Robot;
