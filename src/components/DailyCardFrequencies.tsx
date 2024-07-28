import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchFrequencies = async () => {
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
            params: { date: selectedDate }
          }
        );
        setFrequencies(response.data.sort((a, b) => b.frequency - a.frequency));
        setIsLoading(false);
        setAnimate(true);
        setTimeout(() => setAnimate(false), 1000); // Reset animation after 1 second
      } catch (err) {
        setError('Failed to fetch card frequencies');
        setIsLoading(false);
      }
    };

    fetchFrequencies();
  }, [getToken, selectedDate]);

  const getMaxFrequency = () => {
    return Math.max(...frequencies.map(freq => freq.frequency));
  };

  const getRandomPosition = () => {
    const randomX = Math.random() * 20 - 10; // Random value between -10 and 10
    const randomY = Math.random() * 20 - 10; // Random value between -10 and 10
    return `translate(${randomX}px, ${randomY}px) rotate(${Math.random() * 10 - 5}deg)`;
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading<span>.</span><span>.</span><span>.</span></div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.dailyCardFrequencies}>
      <div className={styles.dateSelector}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
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
    </div>
  );
};

export default DailyCardFrequencies;