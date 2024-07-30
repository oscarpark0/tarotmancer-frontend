import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import DailyCardFrequencies from './DailyCardFrequencies';
import styles from './DailyCardFrequenciesPage.module.css';

interface PositionInfo {
  position_name: string;
  most_common_card: string;
  most_common_card_img: string;
  orientation: 'upright' | 'reversed';
}

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

const Spread: React.FC<SpreadProps> = ({ spread, title }) => {
  const isThreeCardSpread = spread.length === 3;

  return (
    <div className={styles.spreadContainer}>
      <h3>{title}</h3>
      <div className={`${styles.spreadCards} ${isThreeCardSpread ? styles.threeCardSpread : styles.celticCrossSpread}`}>
        {spread.map((position, index) => (
          <div 
            key={index} 
            className={`${styles.spreadCard} ${styles[`position${index}`]}`}
          >
            <img 
              src={position.most_common_card_img} 
              alt={position.most_common_card} 
              className={`${styles.cardImage} ${position.orientation === 'reversed' ? styles.reversed : ''}`}
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

const DailyFrequenciesPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [celticSpread, setCelticSpread] = useState<PositionInfo[]>([]);
  const [threeCardSpread, setThreeCardSpread] = useState<PositionInfo[]>([]);
  const [frequencies, setFrequencies] = useState<CardFrequency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useKindeAuth();

  const fetchData = useCallback(async (date: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getToken();
      
      const [frequenciesResponse, spreadsResponse] = await Promise.all([
        axios.get<CardFrequency[]>(
          `${process.env.REACT_APP_BASE_URL}/api/daily-card-frequencies`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { date }
          }
        ),
        axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/most-common-cards`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { date }
          }
        )
      ]);

      setFrequencies(frequenciesResponse.data.sort((a, b) => b.frequency - a.frequency));
      setCelticSpread(spreadsResponse.data.celtic_spread);
      setThreeCardSpread(spreadsResponse.data.three_card_spread);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchData(selectedDate);
  }, [fetchData, selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className={styles.dailyFrequenciesPage}>
      <header className={styles.pageHeader}>
        <h1>Daily Tarot Card Frequencies</h1>
        <p>
          This page displays aggregated Tarot card data across all users for a selected date. It shows:
        </p>
        <ol>
          <li>The most frequently drawn card for each position in Celtic Cross and Three Card spreads.</li>
          <li>A bar chart of individual card frequencies from all readings.</li>
        </ol>
        <p>Choose a date to view the collective data for that day.</p>
      </header>
      <main className={styles.pageContent}>
        <div className={styles.dateSelector}>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <section className={styles.spreadsSection}>
          <h2>Most Common Cards in Spreads</h2>
          <div className={styles.spreadsContainer}>
            <Spread spread={celticSpread} title="Celtic Cross Spread" />
            <Spread spread={threeCardSpread} title="Three Card Spread" />
          </div>
        </section>
        <section className={styles.frequenciesSection}>
          <h2>Individual Card Frequencies</h2>
          <DailyCardFrequencies 
            frequencies={frequencies}
            isLoading={isLoading}
            error={error}
            selectedDate={selectedDate}
          />
        </section>
      </main>
      {isLoading && <div className={styles.loading}>Loading<span>.</span><span>.</span><span>.</span></div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default DailyFrequenciesPage;