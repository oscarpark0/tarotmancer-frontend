import React from 'react';
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
  useLanguage();

  return (
    <footer className={`${styles.footer} ${isDarkMode ? styles.darkMode : ''} footer`}>
      <div className={styles.footerContent}>
        <div className={styles.footerLinks}>
          <Link to="/terms-of-use" className={styles.footerLink}>{getTranslation('terms')}</Link>
          <Link to="/privacy-policy" className={styles.footerLink}>{getTranslation('privacy')}</Link>
          <Link to="/contact" className={styles.footerLink}>{getTranslation('contact')}</Link>
          <Link to="/resources" className={styles.footerLink}>{getTranslation('resources')}</Link>
          <Link to="/dailyFrequencies" className={styles.footerLink}>{getTranslation('dailyFrequencies')}</Link>
          <FeedbackButton isFooterLink={true} />
        </div>
        <div className={styles.footerInfo}>
          <p className={styles.footerText}>
            &copy; {new Date().getFullYear()} {getTranslation('tarotmancer')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;