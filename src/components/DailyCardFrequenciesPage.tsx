import React from 'react';
import DailyCardFrequencies from './DailyCardFrequencies';
import './DailyCardFrequenciesPage.module.css';

const DailyFrequenciesPage: React.FC = () => {
  return (
    <div className="daily-frequencies-page">
      <header className="page-header">
        <h1>Daily Tarot Card Frequencies</h1>
      </header>
      <main className="page-content">
        <section className="frequencies-section">
          <DailyCardFrequencies />
        </section>
      </main>
    </div>
  );
};

export default DailyFrequenciesPage;