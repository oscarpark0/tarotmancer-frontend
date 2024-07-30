import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DailyCardFrequenciesPage.module.css';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';
import { useTranslation } from '../utils/translations';

interface CardFrequency {
  card_name: string;
  card_img: string;
  frequency: number;
  date: string;
}

interface DailyCardFrequenciesProps {
  frequencies: CardFrequency[];
  isLoading: boolean;
  error: string | null;
  selectedDate: string;
}

const DailyCardFrequencies: React.FC<DailyCardFrequenciesProps> = ({ 
  frequencies, 
  isLoading, 
  error, 
  selectedDate 
}) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const { getTranslation } = useTranslation();

  const getMaxFrequency = () => {
    return Math.max(...frequencies.map(freq => freq.frequency), 1);
  };

  React.useEffect(() => {
    setIsFlipping(true);
    const timer = setTimeout(() => {
      setIsFlipping(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [selectedDate]);

  return (
    <div className={styles.dailyCardFrequencies}>
      <div className={styles.barChartContainer}>
        <AnimatePresence>
          {frequencies.map((freq) => (
            <motion.div
              key={freq.card_name}
              className={styles.barChartItem}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`${styles.cardImageWrapper} ${isFlipping ? styles.flipping : ''}`}>
                <div className={styles.cardInner}>
                  <div className={styles.cardFront}>
                    <img 
                      src={freq.card_img}
                      alt={freq.card_name}
                      className={styles.cardImage}
                    />
                  </div>
                  <div className={styles.cardBack}>
                    <img 
                      src={`${TAROT_IMAGE_BASE_URL}/cardback.webp`}
                      alt="Card Back"
                      className={styles.cardImage}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.barWrapper}>
                <div className={styles.barLabel}>{freq.card_name}</div>
                <div 
                  className={styles.bar} 
                  style={{ width: `${(freq.frequency / getMaxFrequency()) * 100}%` }}
                >
                  <span className={styles.barValue}>{freq.frequency}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {isLoading && <div className={styles.loading}>{getTranslation('loading')}<span>.</span><span>.</span><span>.</span></div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default DailyCardFrequencies;