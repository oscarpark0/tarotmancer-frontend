import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import styles from './DailyCardFrequenciesPage.module.css';
import { motion } from 'framer-motion';

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
  const [selectedCard, setSelectedCard] = useState<CardFrequency | null>(null);
  const { getToken } = useKindeAuth();

  useEffect(() => {
    const fetchFrequencies = async () => {
      try {
        const token = await getToken();
        const response = await axios.get<CardFrequency[]>(`${process.env.REACT_APP_BASE_URL}/api/daily-card-frequencies`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setFrequencies(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch card frequencies');
        setLoading(false);
      }
    };

    fetchFrequencies();
  }, [getToken]);

  if (loading) return <div className={styles.loading}>Loading<span>.</span><span>.</span><span>.</span></div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  const totalCards = frequencies.length;
  const radius = 40; // percentage of container width

  return (
    <div className={styles.dailyCardFrequencies}>
      <h2>Today's Tarot Card Appearances</h2>
      <div className={styles.cardCircle}>
        {frequencies.map((freq, index) => {
          const angle = (index / totalCards) * 2 * Math.PI;
          const x = 50 + radius * Math.cos(angle - Math.PI / 2);
          const y = 50 + radius * Math.sin(angle - Math.PI / 2);

          return (
            <motion.div
              key={freq.card_name}
              className={styles.cardItem}
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setSelectedCard(freq)}
            >
              <img src={freq.card_img} alt={freq.card_name} className={styles.cardImage} />
              <div className={styles.cardFrequencyBadge}>{freq.frequency}</div>
            </motion.div>
          );
        })}
      </div>
      {selectedCard && (
        <motion.div 
          className={styles.cardDetails}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          <h3>{selectedCard.card_name}</h3>
          <p>Appeared {selectedCard.frequency} time{selectedCard.frequency !== 1 ? 's' : ''}</p>
          <img src={selectedCard.card_img} alt={selectedCard.card_name} className={styles.largeCardImage} />
        </motion.div>
      )}
    </div>
  );
};

export default DailyCardFrequencies;