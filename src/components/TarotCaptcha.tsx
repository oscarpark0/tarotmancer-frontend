import React, { useState, useEffect } from 'react';
import { IKImage } from 'imagekitio-react';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return <div className={styles.captchaContainer}>Loading captcha...</div>;
  }

  if (isVerified) {
    return <div className={styles.verifiedMessage} aria-live="polite">Captcha verified successfully!</div>;
  }

  if (!captchaData) {
    return <div className={styles.captchaContainer}>Error loading captcha. Please try again.</div>;
  }

  return (
    <>
      <div className={styles.overlay}></div>
      <div className={styles.captchaContainer}>
        <IKImage
          path={captchaData.correct_image}
          transformation={[{height: "300", width: "200"}]}
          loading="lazy"
          lqip={{active: true}}
          alt="Tarot Card"
          className={styles.cardImage}
        />
        <p className={styles.instructionText}>
          Please select the name of the Tarot card shown above:
        </p>
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
    </>
  );
};

export default TarotCaptcha;