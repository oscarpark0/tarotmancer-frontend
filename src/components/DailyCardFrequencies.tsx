import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IKImage } from 'imagekitio-react';
import styles from './DailyCardFrequenciesPage.module.css';
import { useTranslation } from '../utils/translations';

interface CardFrequency {
  card_name: string;
  card_img: string;
  frequency: number;
  date: string;
  orientation: string;
}

interface DailyCardFrequenciesProps {
  frequencies: CardFrequency[];
  isLoading: boolean;
  error: string | null;
  selectedDate: string;
}

const DailyCardFrequencies: React.FC<DailyCardFrequenciesProps> = ({ 
  frequencies, 
  isLoading, 
  error, 
  selectedDate 
}) => {
  const { getTranslation } = useTranslation();

  const getMaxFrequency = () => {
    return Math.max(...frequencies.map(freq => freq.frequency), 1);
  };

  const getImagePath = (fullUrl: string) => {
    // If it's already a full URL, extract just the filename
    if (fullUrl && fullUrl.startsWith('http')) {
      return fullUrl.replace('https://ik.imagekit.io/tarotmancer/', '');
    }
    // If it contains a slash but no protocol, it might be a relative path
    else if (fullUrl && fullUrl.includes('/')) {
      return fullUrl.split('/').pop() || fullUrl;
    }
    // Make sure we have the .webp extension for card images
    else if (fullUrl && !fullUrl.includes('.')) {
      // This is likely just a card name, so we need to convert it to a filename
      // For example, 'the_fool' should become 'm00.webp'
      const cardNameMapping: Record<string, string> = {
        'the_fool': 'm00.webp',
        'the_magician': 'm01.webp',
        'the_high_priestess': 'm02.webp',
        'the_empress': 'm03.webp',
        'the_emperor': 'm04.webp',
        'the_hierophant': 'm05.webp',
        'the_lovers': 'm06.webp',
        'the_chariot': 'm07.webp',
        'strength': 'm08.webp',
        'the_hermit': 'm09.webp',
        'wheel_of_fortune': 'm10.webp',
        'justice': 'm11.webp',
        'the_hanged_man': 'm12.webp',
        'death': 'm13.webp',
        'temperance': 'm14.webp',
        'the_devil': 'm15.webp',
        'the_tower': 'm16.webp',
        'the_star': 'm17.webp',
        'the_moon': 'm18.webp',
        'the_sun': 'm19.webp',
        'judgement': 'm20.webp',
        'the_world': 'm21.webp'
      };
      
      const normalizedCardName = fullUrl.toLowerCase().replace(/ /g, '_');
      return cardNameMapping[normalizedCardName] || fullUrl;
    }
    // Otherwise, return as is (might be just a filename)
    return fullUrl || '';
  };

  return (
    <div className={styles.dailyCardFrequencies}>
      <div className={styles.barChartContainer}>
        <AnimatePresence>
          {frequencies.map((freq, index) => (
            <motion.div
              key={`${freq.card_name}-${index}`}
              className={styles.barChartItem}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className={styles.cardImageWrapper}>
                <IKImage 
                  path={getImagePath(freq.card_img)}
                  loading="lazy"
                  className={styles.cardImage}
                  alt={freq.card_name}
                  urlEndpoint="https://ik.imagekit.io/tarotmancer"
                />
              </div>
              <div className={styles.barWrapper}>
                <div className={styles.barLabel}>
                  {freq.card_name}
                  <span className={styles.orientationIcon}>
                    {freq.orientation === 'upright' ? '↑' : freq.orientation === 'reversed' ? '↓' : '↕'}
                  </span>
                </div>
                <motion.div 
                  className={styles.bar} 
                  style={{ width: `${(freq.frequency / getMaxFrequency()) * 100}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(freq.frequency / getMaxFrequency()) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <span className={styles.barValue}>{freq.frequency}</span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {isLoading && <div className={styles.loading}>{getTranslation('loading')}<span>.</span><span>.</span><span>.</span></div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default DailyCardFrequencies;