
import React from 'react';
import DailyCardFrequencies from './DailyCardFrequencies';
import './DailyCardFrequenciesPage.module.css';

const DailyFrequenciesPage: React.FC = () => {
  return (
    <div className="dailyFrequenciesPage">
      <header className="pageHeader">
        <h1>Daily Tarot Card Frequencies</h1>
        <p>Explore the appearance frequency of Tarot cards for a specific date</p>
      </header>
      <main className="pageContent">
        <section className="frequenciesSection">
          <DailyCardFrequencies />
        </section>
      </main>
    </div>
  );
};

export default DailyFrequenciesPage;
