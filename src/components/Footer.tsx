import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import FeedbackButton from './FeedbackButton';

interface FooterProps {
  isDarkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => {
  return (
    <footer className={`${styles.footer} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.footerContent}>
        <div className={styles.footerLinks}>
          <Link to="/terms-of-use" className={styles.footerLink}>Terms</Link>
          <Link to="/privacy-policy" className={styles.footerLink}>Privacy</Link>
          <Link to="/contact" className={styles.footerLink}>Contact</Link>
          <FeedbackButton />
        </div>
        <div className={styles.footerInfo}>
          <p className={styles.footerText}>&copy; {new Date().getFullYear()} tarotmancer</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;