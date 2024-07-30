import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import DailyCardFrequencies from './DailyCardFrequencies';
import styles from './DailyCardFrequenciesPage.module.css';
import { useTranslation } from '../utils/translations';

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
  const { getTranslation } = useTranslation();

  return (
    <div className={styles.spreadContainer}>
      <h3>{getTranslation(title as 'celticCrossSpread' | 'threeCardSpread')}</h3>
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
  const { getTranslation } = useTranslation();

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
        <h1>{getTranslation('dailyTarotCardFrequencies')}</h1>
        <p>
          {getTranslation('frequenciesDescription')}
        </p>
        <ol>
          <li>{getTranslation('mostCommonCardOccurrencesByPosition')}</li>
          <li>{getTranslation('individualCardFrequencies')}</li>
        </ol>
        <p>{getTranslation('chooseDate')}</p>
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
          <h2>{getTranslation('mostCommonCardOccurrencesByPosition')}</h2>
          <div className={styles.spreadsContainer}>
            <Spread spread={celticSpread} title="celticCrossSpread" />
            <div className={styles.spreadSeparator}></div>
            <Spread spread={threeCardSpread} title="threeCardSpread" />
          </div>
        </section>
        <section className={styles.frequenciesSection}>
          <h2>{getTranslation('individualCardFrequencies')}</h2>
          <div className={styles.frequenciesWrapper}>
            <DailyCardFrequencies 
              frequencies={frequencies}
              isLoading={isLoading}
              error={error}
              selectedDate={selectedDate}
            />
          </div>
        </section>
      </main>
      {isLoading && <div className={styles.loading}>{getTranslation('loading')}<span>.</span><span>.</span><span>.</span></div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default DailyFrequenciesPage;