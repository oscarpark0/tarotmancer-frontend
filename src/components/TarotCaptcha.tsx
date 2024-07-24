import React, { useState, useEffect } from 'react';
import { TAROT_IMAGE_BASE_URL } from "../utils/config";
import styles from './TarotCaptcha.module.css';

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

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
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/captcha`);
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
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (captchaData && selectedOption) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/verify-captcha`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            selected_option: selectedOption,
            correct_card: captchaData.correct_card,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setIsVerified(result.isCorrect);
          onVerify(result.isCorrect);
          if (!result.isCorrect) {
            setSelectedOption(null);
            fetchCaptcha();
          }
        } else {
          throw new Error('Failed to verify captcha');
        }
      } catch (error) {
        console.error('Error verifying captcha:', error);
        onVerify(false);
      }
    }
  };

  if (!captchaData) {
    return <div>Loading captcha...</div>;
  }

  if (isVerified) {
    return <div className={styles.verifiedMessage}>Captcha verified successfully!</div>;
  }

  return (
    <div className={styles.captchaContainer}>
      <img 
        src={`${TAROT_IMAGE_BASE_URL}/${captchaData.correct_image}`} 
        alt="Tarot Card" 
        className={styles.cardImage} 
      />
      <div>
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
        <button 
          onClick={handleSubmit} 
          className={styles.submitButton} 
          disabled={!selectedOption}
        >
          Verify
        </button>
      </div>
    </div>
  );
};

export default TarotCaptcha;