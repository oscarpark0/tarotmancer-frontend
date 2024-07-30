import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react"; 
import styles from './DailyCardFrequenciesPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';

interface CardFrequency {
  card_name: string;
  card_img: string;
  frequency: number;
  date: string;
}

interface SpreadProps {
  spread: PositionInfo[];
  title: string;
}

interface PositionInfo {
  position_name: string;
  most_common_card: string;
  most_common_card_img: string;
  orientation: 'upright' | 'reversed';
}

const Spread: React.FC<SpreadProps> = ({ spread, title }) => {
  const isThreeCardSpread = spread.length === 3;

  return (
    <div className={styles.spreadContainer}>
      <h2>{title}</h2>
      <div className={`${styles.spreadCards} ${isThreeCardSpread ? styles.threeCardSpread : styles.celticCrossSpread}`}>
        {spread.map((position, index) => (
          <div 
            key={index} 
            className={`${styles.spreadCard} ${styles[`position${index}`]} ${position.orientation === 'reversed' ? styles.reversed : ''}`}
          >
            <img 
              src={position.most_common_card_img} 
              alt={position.most_common_card} 
              className={styles.cardImage}
            />
            <div className={styles.cardInfo}>
              <p className={styles.positionName}>{position.position_name}</p>
              <p className={styles.cardName}>{position.most_common_card}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DailyCardFrequencies: React.FC = () => {
  const [frequencies, setFrequencies] = useState<CardFrequency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isFlipping, setIsFlipping] = useState(false);
  const { getToken } = useKindeAuth();

  const [celticSpread, setCelticSpread] = useState<PositionInfo[]>([]);
  const [threeCardSpread, setThreeCardSpread] = useState<PositionInfo[]>([]);

  const fetchFrequencies = useCallback(async (date: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getToken();
      const response = await axios.get<CardFrequency[]>(
        `${process.env.REACT_APP_BASE_URL}/api/daily-card-frequencies`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: { date }
        }
      );
      return response.data.sort((a, b) => b.frequency - a.frequency);
    } catch (err) {
      setError('Failed to fetch card frequencies');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  const fetchMostCommonCards = useCallback(async (date: string) => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/most-common-cards`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: { date }
        }
      );
      setCelticSpread(response.data.celtic_spread);
      setThreeCardSpread(response.data.three_card_spread);
    } catch (err) {
      console.error('Failed to fetch most common cards:', err);
      setError('Failed to fetch most common cards. Please try again later.');
    }
  }, [getToken]);

  useEffect(() => {
    fetchFrequencies(selectedDate).then(setFrequencies);
    fetchMostCommonCards(selectedDate);
  }, [fetchFrequencies, fetchMostCommonCards, selectedDate]);

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setIsFlipping(true);
    
    // Fetch new frequencies
    const newFrequencies = await fetchFrequencies(newDate);
    
    // Update frequencies and trigger flip
    setTimeout(() => {
      setFrequencies(newFrequencies);
      
      // End the flip after the animation is complete
      setTimeout(() => {
        setIsFlipping(false);
      }, 300); // Half duration of flip animation
    }, 300); // Half duration of flip animation
  };

  const getMaxFrequency = () => {
    return Math.max(...frequencies.map(freq => freq.frequency), 1);
  };

  return (
    <div className={styles.dailyCardFrequencies}>
      <div className={styles.dateSelector}>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
      <Spread spread={celticSpread} title="Celtic Cross Spread" />
      <Spread spread={threeCardSpread} title="Three Card Spread" />
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
      {isLoading && <div className={styles.loading}>Loading<span>.</span><span>.</span><span>.</span></div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default DailyCardFrequencies;  