import React from 'react';
import DailyCardFrequencies from './DailyCardFrequencies';

const DailyFrequenciesPage: React.FC = () => {
  return (
    <div className="daily-frequencies-page">
      <h1>Daily Tarot Card Frequencies</h1>
      <DailyCardFrequencies />
    </div>
  );
};

export default DailyFrequenciesPage;