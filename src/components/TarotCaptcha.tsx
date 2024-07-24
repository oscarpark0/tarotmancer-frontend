import React, { useState, useEffect } from 'react';
import { TAROT_IMAGE_BASE_URL } from "../utils/config";
import styles from './TarotCaptcha.module.css';

interface TarotCaptchaProps {
  onVerify: (isVerified: boolean) => void;
}

const TarotCaptcha: React.FC<TarotCaptchaProps> = ({ onVerify }) => {
  const [cardImage, setCardImage] = useState('');
  const [userInput, setUserInput] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');

  useEffect(() => {
    fetchRandomCard();
  }, []);

  const fetchRandomCard = async () => {
    try {
      const response = await fetch('/api/random-tarot-card');
      const data = await response.json();
      setCardImage(`${TAROT_IMAGE_BASE_URL}/${data.image}`);
      setCorrectAnswer(data.name.toLowerCase());
    } catch (error) {
      console.error('Error fetching random card:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = userInput.toLowerCase() === correctAnswer;
    onVerify(isCorrect);
    if (!isCorrect) {
      setUserInput('');
      fetchRandomCard();
    }
  };

  return (
    <div className={styles.captchaContainer}>
      <img src={cardImage} alt="Tarot Card" className={styles.cardImage} />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter the card name"
          className={styles.input}
        />
        <button type="submit" className={styles.submitButton}>Verify</button>
      </form>
    </div>
  );
};

export default TarotCaptcha;