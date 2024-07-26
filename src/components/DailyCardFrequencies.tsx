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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const { getToken } = useKindeAuth();

  useEffect(() => {
    const fetchFrequencies = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const response = await axios.get<CardFrequency[]>(`${process.env.REACT_APP_BASE_URL}/api/daily-card-frequencies`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: { date: selectedDate }
        });
        setFrequencies(response.data.sort((a, b) => b.frequency - a.frequency));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch card frequencies');
        setLoading(false);
      }
    };

    fetchFrequencies();
  }, [getToken, selectedDate]);

  if (loading) return <div className={styles.loading}>Loading<span>.</span><span>.</span><span>.</span></div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

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
      <div className={styles.cardGrid}>
        {frequencies.map((freq) => (
          <div key={freq.card_name} className={styles.cardItem}>
            <img src={freq.card_img} alt={freq.card_name} className={styles.cardImage} />
            <h3 className={styles.cardName}>{freq.card_name}</h3>
            <p className={styles.cardFrequency}>{freq.frequency} appearances</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyCardFrequencies;