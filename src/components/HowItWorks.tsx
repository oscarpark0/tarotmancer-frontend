import React from 'react';
import './HowItWorks.css';

const ProcessStep: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <div className="processStep">
    <h3><span className="stepNumber">{number}</span>{title}</h3>
    {children}
  </div>
);

const HowItWorks: React.FC = () => {
  return (
    <div className="howItWorksContainer">
      <h1 className="title">tarotmancer: How It Works</h1>
      
      <p className="intro">tarotmancer doesn't just draw cards at random for your reading. Instead, it simulates thousands of tarot readings to provide you with a statistically significant and meaningful spread.</p>
      
      <h2>Here's how it works:</h2>

      <ProcessStep number={1} title="Virtual Deck Shuffling">
        <p>The app starts with a complete deck of 78 tarot cards. For each position in the spread (10 for Celtic Cross, 3 for Three Card), it shuffles this virtual deck thousands of times.</p>
      </ProcessStep>

      <ProcessStep number={2} title="Multiple Draws">
        <p>For each shuffle, the app draws the required number of cards (Celtic Cross - 10 |  Three Card Spread - 3) and records which card appears in each position.</p>
      </ProcessStep>

      <ProcessStep number={3} title="Counting Appearances">
        <p>As this process repeats thousands of times, the app keeps track of how often each card appears in each position. It also notes whether the card is drawn in an upright or reversed orientation.</p>
      </ProcessStep>

      <ProcessStep number={4} title="Statistical Analysis">
        <p>After all these virtual readings, the app analyzes the data to determine which card appeared most frequently in each position. This card becomes the one shown in your spread for that position.</p>
      </ProcessStep>

      <ProcessStep number={5} title="Significance of Numbers">
        <p>For the Celtic Cross, this process is repeated 10,000 times for each of the 10 positions.</p>
        <p>For the Three Card spread, it's also repeated 10,000 times for each of the 3 positions.</p>
        <div className="highlight">
          <p>This means that for a Celtic Cross reading, the app effectively draws and analyzes 100,000 cards (10 positions × 10,000 repetitions). For a Three Card reading, it's 30,000 cards (3 positions × 10,000 repetitions).</p>
        </div>
      </ProcessStep>

      <ProcessStep number={6} title="Ensuring Accuracy">
        <p>By using such large numbers, the app ensures that the final spread you see is not just a random draw, but a statistically significant representation of the most likely cards to appear in each position.</p>
      </ProcessStep>

      <ProcessStep number={7} title="Balancing Randomness and Meaning">
        <p>This method balances the randomness inherent in tarot readings with the need for meaningful, insightful spreads. It's like having a highly experienced tarot reader perform thousands of readings for you and then presenting the most consistent results.</p>
      </ProcessStep>

      <ProcessStep number={8} title="Unique Spreads">
        <p>Despite this statistical approach, each reading remains unique. The vast number of possible combinations ensures that your spread is tailored to your specific query or moment in time.</p>
      </ProcessStep>

      <ProcessStep number={9} title="Possibility of Duplicate Cards">
        <p>Due to the statistical nature of this process, it's possible to see the same card appear in multiple positions of a spread. This occurs when a particular card consistently shows up as the most frequent card for more than one position across the thousands of simulations. While uncommon in traditional tarot readings, in tarotmancer, it represents a strong recurring theme or message that the cards are emphasizing across different aspects of your question or situation.</p>
      </ProcessStep>

      <p className="conclusion">In essence, when you click draw, you're not just getting a simple random draw. You're receiving the distilled wisdom of thousands of virtual tarot readings, all performed in a split second to provide you with a deeply meaningful and statistically robust tarot spread.</p>
    </div>
  );
};

export default HowItWorks;