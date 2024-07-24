import React, { useState, useEffect } from 'react';
import { TAROT_IMAGE_BASE_URL } from "../utils/config";
import styles from './TarotCaptcha.module.css';

interface TarotCaptchaProps {
  onVerify: (isVerified: boolean) => void;
}

interface CaptchaData {
  correct_card: string;
  correct_image: string;
  options: string[];
}

const TarotCaptcha: React.FC<TarotCaptchaProps> = ({ onVerify }) => {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const response = await fetch('/api/captcha');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setCaptchaData(data);
    } catch (error) {
      console.error('Error fetching captcha:', error);
      // You might want to set some error state here to display to the user
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaData && selectedOption) {
      const isCorrect = selectedOption === captchaData.correct_card;
      onVerify(isCorrect);
      if (!isCorrect) {
        setSelectedOption(null);
        fetchCaptcha();
      }
    }
  };

  if (!captchaData) {
    return <div>Loading captcha...</div>;
  }

  return (
    <div className={styles.captchaContainer}>
      <img 
        src={`${TAROT_IMAGE_BASE_URL}/${captchaData.correct_image}`} 
        alt="Tarot Card" 
        className={styles.cardImage} 
      />
      <form onSubmit={handleSubmit}>
        {captchaData.options.map((option, index) => (
          <label key={index} className={styles.optionLabel}>
            <input
              type="radio"
              name="captchaOption"
              value={option}
              checked={selectedOption === option}
              onChange={() => setSelectedOption(option)}
            />
            {option}
          </label>
        ))}
        <button type="submit" className={styles.submitButton} disabled={!selectedOption}>
          Verify
        </button>
      </form>
    </div>
  );
};

export default TarotCaptcha;