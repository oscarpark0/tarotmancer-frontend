import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import FeedbackButton from './FeedbackButton';
import { useTranslation } from '../utils/translations';
import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
  isDarkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => {
  const { getTranslation } = useTranslation();
  const { selectedLanguage } = useLanguage();

  useEffect(() => {
    console.log('Component language updated:', selectedLanguage);
  }, [selectedLanguage]);

  return (
    <footer className={`${styles.footer} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.footerContent}>
        <div className={styles.footerLinks}>
          <Link to="/how-it-works" className={styles.footerLink}>{getTranslation('howItWorks')}</Link>
          <Link to="/terms-of-use" className={styles.footerLink}>{getTranslation('terms')}</Link>
          <Link to="/privacy-policy" className={styles.footerLink}>{getTranslation('privacy')}</Link>
          <Link to="/contact" className={styles.footerLink}>{getTranslation('contact')}</Link>
          <Link to="/resources" className={styles.footerLink}>{getTranslation('resources')}</Link>
          <Link to="/dailyFrequencies" className={styles.footerLink}>{getTranslation('frequencies')}</Link>
          <FeedbackButton isFooterLink={true} />
        </div>
        <div className={styles.footerInfo}>
          <p className={`${styles.footerText} ${styles.hideOnMobile}`}>
            &copy; {new Date().getFullYear()} {getTranslation('tarotmancer')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;