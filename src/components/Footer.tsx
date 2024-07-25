import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

interface FooterProps {
  isDarkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => {
  return (
    <footer className={`${styles.footer} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.footerContent}>
        <div className={styles.footerLinks}>
          <Link to="/terms-of-use" className={styles.footerLink}>Terms of Use</Link>
          <Link to="/privacy-policy" className={styles.footerLink}>Privacy Policy</Link>
        </div>
        <div className={styles.footerDivider}></div>
        <div className={styles.footerInfo}>
          <p className={styles.footerText}>&copy; {new Date().getFullYear()} Tarotmancer</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;