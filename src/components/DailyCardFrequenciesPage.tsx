import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import DailyCardFrequencies from './DailyCardFrequencies';
import styles from './DailyCardFrequenciesPage.module.css';
import { useTranslation } from '../utils/translations';
import { IKImage } from 'imagekitio-react';
import { API_BASE_URL } from '../utils/config';


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
  orientation: string;
}

interface SpreadProps {
  spread: PositionInfo[];
  title: string;
}

const Spread: React.FC<SpreadProps> = ({ spread, title }) => {
  const isThreeCardSpread = spread.length === 3;
  const { getTranslation } = useTranslation();

  const getImagePath = (fullUrl: string) => {
    return fullUrl.replace('https://ik.imagekit.io/tarotmancer/', '');
  };

  // Sort the spread based on a predefined order
  const sortedSpread = [...spread].sort((a, b) => {
    const order = [
      "The Situation", "The Challenge", "The Foundation", "The Past",
      "The Present", "The Future", "Yourself", "External Influences",
      "Hopes and Fears", "The Outcome"
    ];
    return order.indexOf(a.position_name) - order.indexOf(b.position_name);
  });

  return (
    <div className={styles.spreadContainer}>
      <h4>{getTranslation(title as 'celticCrossSpread' | 'threeCardSpread')}</h4>
      <div className={`${styles.spreadCards} ${isThreeCardSpread ? styles.threeCardSpread : styles.celticCrossSpread}`}>
        {sortedSpread.map((position, index) => (
          <div 
            key={`${position.position_name}-${index}`}
            className={`${styles.spreadCard} ${styles[`position${index}`]}`}
          >
            <IKImage 
              path={getImagePath(position.most_common_card_img)}
              loading="lazy"
              className={`${styles.cardImage} ${position.orientation === 'reversed' ? styles.reversed : ''}`}
              alt={position.most_common_card}
            />
            <div className={styles.cardInfo}>
              <p className={styles.positionName}>{position.position_name}</p>
              <p className={styles.cardName}>
                {position.most_common_card}
                <span className={styles.orientationIcon}>
                  {position.orientation === 'upright' ? '↑' : '↓'}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DailyFrequenciesPage: React.FC = () => {
  const navigate = useNavigate();
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
      
      try {
        const [frequenciesResponse, spreadsResponse] = await Promise.all([
          axios.get<CardFrequency[]>(
            `${API_BASE_URL}/api/daily-card-frequencies`,
            {
              headers: { 'Authorization': `Bearer ${token}` },
              params: { date }
            }
          ),
          axios.get(
            `${API_BASE_URL}/api/most-common-cards`,
            {
              headers: { 'Authorization': `Bearer ${token}` },
              params: { date }
            }
          )
        ]);

        setFrequencies(frequenciesResponse.data.sort((a, b) => b.frequency - a.frequency));
        setCelticSpread([...spreadsResponse.data.celtic_spread]); // Ensure state update
        setThreeCardSpread([...spreadsResponse.data.three_card_spread]); // Ensure state update
      } catch (err) {
        console.error('Failed to fetch data from backend:', err);
        console.log('Using mock data as fallback');
        
        // Set mock data for frequencies
        const mockFrequencies: CardFrequency[] = [
          { card_name: "The Fool", card_img: "fool.jpg", frequency: 15, date: date, orientation: "upright" },
          { card_name: "The Magician", card_img: "magician.jpg", frequency: 12, date: date, orientation: "upright" },
          { card_name: "The High Priestess", card_img: "priestess.jpg", frequency: 10, date: date, orientation: "upright" },
          { card_name: "The Empress", card_img: "empress.jpg", frequency: 8, date: date, orientation: "reversed" },
          { card_name: "The Emperor", card_img: "emperor.jpg", frequency: 7, date: date, orientation: "upright" }
        ];
        
        // Mock data for Celtic Cross spread
        const mockCelticSpread: PositionInfo[] = [
          { position_name: "The Situation", most_common_card: "The Fool", most_common_card_img: "fool.jpg", count: 15, orientation: "upright" },
          { position_name: "The Challenge", most_common_card: "The Tower", most_common_card_img: "tower.jpg", count: 12, orientation: "reversed" },
          { position_name: "The Foundation", most_common_card: "The Emperor", most_common_card_img: "emperor.jpg", count: 10, orientation: "upright" },
          { position_name: "The Past", most_common_card: "The Hermit", most_common_card_img: "hermit.jpg", count: 9, orientation: "upright" },
          { position_name: "The Present", most_common_card: "The Lovers", most_common_card_img: "lovers.jpg", count: 8, orientation: "upright" },
          { position_name: "The Future", most_common_card: "The Star", most_common_card_img: "star.jpg", count: 7, orientation: "upright" },
          { position_name: "Yourself", most_common_card: "The Magician", most_common_card_img: "magician.jpg", count: 6, orientation: "upright" },
          { position_name: "External Influences", most_common_card: "The Moon", most_common_card_img: "moon.jpg", count: 5, orientation: "reversed" },
          { position_name: "Hopes and Fears", most_common_card: "The Sun", most_common_card_img: "sun.jpg", count: 4, orientation: "upright" },
          { position_name: "The Outcome", most_common_card: "The World", most_common_card_img: "world.jpg", count: 3, orientation: "upright" }
        ];
        
        // Mock data for Three Card spread
        const mockThreeCardSpread: PositionInfo[] = [
          { position_name: "The Past", most_common_card: "The Hermit", most_common_card_img: "hermit.jpg", count: 15, orientation: "upright" },
          { position_name: "The Present", most_common_card: "The Lovers", most_common_card_img: "lovers.jpg", count: 12, orientation: "upright" },
          { position_name: "The Future", most_common_card: "The Star", most_common_card_img: "star.jpg", count: 10, orientation: "upright" }
        ];
        
        setFrequencies(mockFrequencies);
        setCelticSpread(mockCelticSpread);
        setThreeCardSpread(mockThreeCardSpread);
      }
    } catch (err) {
      console.error('Failed to initialize data fetching:', err);
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

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className={styles.dailyFrequenciesPage}>
      <button className={styles.backButton} onClick={handleBack}>
        <span className={styles.backButtonIcon}>☽</span> {getTranslation('backToHome')}
      </button>
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
        <section className={styles.spreadsSection}>
          <h2>{getTranslation('mostCommonCardOccurrencesByPosition')}</h2>
          <div className={styles.spreadsContainer}>
            {threeCardSpread.length === 3 ? (
              <Spread key={`${selectedDate}-1`} spread={threeCardSpread} title="threeCardSpread" />
            ) : (
              <div className={styles.error}>Error: Invalid Three Card spread data</div>
            )}
            <div className={styles.spreadSeparator}></div>
            <Spread key={`${selectedDate}-0`} spread={celticSpread} title="celticCrossSpread" />
          </div>
        </section>
      </main>
      {isLoading && <div className={styles.loading}>{getTranslation('loading')}<span>.</span><span>.</span><span>.</span></div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default DailyFrequenciesPage;
