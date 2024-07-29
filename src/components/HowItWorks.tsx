import React from 'react';
import './HowItWorks.css';

const HowItWorks: React.FC = () => {
  return (
    <div className="how-it-works">
      <h1>tarotmancer: How It Works</h1>
      
      <p className="intro">tarotmancer doesn't just draw cards at random for your reading. Instead, it simulates thousands of tarot readings to provide you with a statistically significant and meaningful spread.</p>
      
      <h2>Here's how it works:</h2>

      <div className="process-step">
        <h3>1. Virtual Deck Shuffling</h3>
        <p>The app starts with a complete deck of 78 tarot cards. For each position in the spread (10 for Celtic Cross, 3 for Three Card), it shuffles this virtual deck thousands of times.</p>
      </div>

      <div className="process-step">
        <h3>2. Multiple Draws</h3>
        <p>For each shuffle, the app draws the required number of cards (10 or 3) and records which card appears in each position.</p>
      </div>

      <div className="process-step">
        <h3>3. Counting Appearances</h3>
        <p>As this process repeats thousands of times, the app keeps track of how often each card appears in each position. It also notes whether the card is drawn in an upright or reversed orientation.</p>
      </div>

      <div className="process-step">
        <h3>4. Statistical Analysis</h3>
        <p>After all these virtual readings, the app analyzes the data to determine which card appeared most frequently in each position. This card becomes the one shown in your spread for that position.</p>
      </div>

      <div className="process-step">
        <h3>5. Significance of Numbers</h3>
        <p>For the Celtic Cross, this process is repeated 10,000 times for each of the 10 positions.</p>
        <p>For the Three Card spread, it's also repeated 10,000 times for each of the 3 positions.</p>
        <p className="highlight">This means that for a Celtic Cross reading, the app effectively draws and analyzes 100,000 cards (10 positions × 10,000 repetitions). For a Three Card reading, it's 30,000 cards (3 positions × 10,000 repetitions).</p>
      </div>

      <div className="process-step">
        <h3>6. Ensuring Accuracy</h3>
        <p>By using such large numbers, the app ensures that the final spread you see is not just a random draw, but a statistically significant representation of the most likely cards to appear in each position.</p>
      </div>

      <div className="process-step">
        <h3>7. Balancing Randomness and Meaning</h3>
        <p>This method balances the randomness inherent in tarot readings with the need for meaningful, insightful spreads. It's like having a highly experienced tarot reader perform thousands of readings for you and then presenting the most consistent results.</p>
      </div>

      <div className="process-step">
        <h3>8. Unique Spreads</h3>
        <p>Despite this statistical approach, each reading remains unique. The vast number of possible combinations ensures that your spread is tailored to your specific query or moment in time.</p>
      </div>

      <p className="conclusion">In essence, when you click draw, you're not just getting a simple random draw. You're receiving the distilled wisdom of thousands of virtual tarot readings, all performed in a split second to provide you with a deeply meaningful and statistically robust tarot spread.</p>
    </div>
  );
};

export default HowItWorks;