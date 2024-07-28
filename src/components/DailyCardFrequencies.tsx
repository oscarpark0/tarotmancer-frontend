import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import styles from './DailyCardFrequenciesPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';

interface CardFrequency {
  card_name: string;
  card_img: string;
  frequency: number;
  date: string;
}

const DailyCardFrequencies: React.FC = () => {
  const [frequencies, setFrequencies] = useState<CardFrequency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showCardBacks, setShowCardBacks] = useState(false);
  const { getToken } = useKindeAuth();

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

  useEffect(() => {
    fetchFrequencies(selectedDate).then(setFrequencies);
  }, [fetchFrequencies, selectedDate]);

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setIsFlipping(true);
    setShowCardBacks(true);
    
    setTimeout(async () => {
      setShowCardBacks(false);
      const newFrequencies = await fetchFrequencies(newDate);
      setFrequencies(newFrequencies);
      
      setTimeout(() => {
        setIsFlipping(false);
      }, 600);
    }, 600);
  };

  const getMaxFrequency = () => {
    return Math.max(...frequencies.map(freq => freq.frequency), 1);
  };

  const getRandomPosition = () => {
    const randomX = Math.random() * 20 - 10;
    const randomY = Math.random() * 20 - 10;
    return `translate(${randomX}px, ${randomY}px) rotate(${Math.random() * 10 - 5}deg)`;
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
                <img 
                  src={showCardBacks ? `${process.env.REACT_APP_BASE_URL}/cardback.webp` : freq.card_img}
                  alt={freq.card_name} 
                  className={styles.cardImage}
                />
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