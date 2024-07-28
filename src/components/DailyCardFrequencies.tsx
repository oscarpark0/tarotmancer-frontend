import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import styles from './DailyCardFrequenciesPage.module.css';

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
  const [animate, setAnimate] = useState(false);
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
    setAnimate(true);
    const newFrequencies = await fetchFrequencies(newDate);
    setFrequencies(newFrequencies);
    setTimeout(() => setAnimate(false), 600);
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
        {frequencies.map((freq) => (
          <div key={freq.card_name} className={styles.barChartItem}>
            <img 
              src={freq.card_img} 
              alt={freq.card_name} 
              className={`${styles.cardImage} ${animate ? styles.animate : ''}`}
              style={{ transform: animate ? getRandomPosition() : 'none' }}
            />
            <div className={styles.barWrapper}>
              <div className={styles.barLabel}>{freq.card_name}</div>
              <div 
                className={styles.bar} 
                style={{ width: `${(freq.frequency / getMaxFrequency()) * 100}%` }}
              >
                <span className={styles.barValue}>{freq.frequency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isLoading && <div className={styles.loading}>Loading<span>.</span><span>.</span><span>.</span></div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default DailyCardFrequencies;