import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DailyCardFrequencies from './DailyCardFrequencies';
import './DailyCardFrequenciesPage.module.css';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

interface PositionInfo {
  position_name: string;
  most_common_card: string;
  most_common_card_img: string;
  count: number;
  orientation: string;
}

const Spread: React.FC<{ spread: PositionInfo[], title: string }> = ({ spread, title }) => {
  return (
    <div className="spreadContainer">
      <h2>{title}</h2>
      <div className="spreadCards">
        {spread.map((position, index) => (
          <div key={index} className="spreadCard">
            <img 
              src={position.most_common_card_img} 
              alt={position.most_common_card} 
              className={`cardImage ${position.orientation === 'reversed' ? 'reversed' : ''}`}
            />
            <p>{position.position_name}</p>
            <p>{position.most_common_card}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const DailyCardFrequenciesComponent: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [celticSpread, setCelticSpread] = useState<PositionInfo[]>([]);
  const [threeCardSpread, setThreeCardSpread] = useState<PositionInfo[]>([]);
  const { getToken } = useKindeAuth();

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

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
    }
  }, [getToken]);

  useEffect(() => {
    fetchMostCommonCards(selectedDate);
  }, [fetchMostCommonCards, selectedDate]);

  return (
    <div className="dailyCardFrequencies">
      <div className="dateSelector">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
      <Spread spread={celticSpread} title="Celtic Cross Spread" />
      <Spread spread={threeCardSpread} title="Three Card Spread" />
      {/* ... existing code for frequency chart ... */}
    </div>
  );
};

const DailyFrequenciesPage: React.FC = () => {
  return (
    <div className="dailyFrequenciesPage">
      <header className="pageHeader">
        <h1>Daily Tarot Card Frequencies</h1>
        <p>Explore the appearance frequency of Tarot cards for a specific date</p>
      </header>
      <main className="pageContent">
        <section className="spreadsSection">
          <h2>Most Common Cards in Spreads</h2>
          <DailyCardFrequenciesComponent />
        </section>
        <section className="frequenciesSection">
          <h2>Individual Card Frequencies</h2>
          <DailyCardFrequencies />
        </section>
      </main>
    </div>
  );
};

export default DailyFrequenciesPage;