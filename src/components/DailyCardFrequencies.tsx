import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IKImage } from 'imagekitio-react';
import styles from './DailyCardFrequenciesPage.module.css';
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
  const { getTranslation } = useTranslation();

  const getMaxFrequency = () => {
    return Math.max(...frequencies.map(freq => freq.frequency), 1);
  };

  return (
    <div className={styles.dailyCardFrequencies}>
      <div className={styles.barChartContainer}>
        <AnimatePresence>
          {frequencies.map((freq, index) => (
            <motion.div
              key={freq.card_name}
              className={styles.barChartItem}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className={styles.cardImageWrapper}>
                <IKImage 
                  path={`/${freq.card_img}`}
                  transformation={[{ height: "100", width: "60" }]}
                  loading="lazy"
                  lqip={{ active: true }}
                  className={styles.cardImage}
                  alt={freq.card_name}
                />
              </div>
              <div className={styles.barWrapper}>
                <div className={styles.barLabel}>{freq.card_name}</div>
                <motion.div 
                  className={styles.bar} 
                  style={{ width: `${(freq.frequency / getMaxFrequency()) * 100}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(freq.frequency / getMaxFrequency()) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <span className={styles.barValue}>{freq.frequency}</span>
                </motion.div>
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