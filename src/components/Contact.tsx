import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Contact.module.css';

const Contact: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.contactContainer}>
      <button className={styles.backButton} onClick={handleBack}>
        <span className={styles.backButtonIcon}>☽</span> Back
      </button>
      <h2 className={styles.title}>Contact</h2>
      <a href="mailto:tb@tarotmancer.com" className={styles.email}>
        <span className={styles.emailIcon}>✧</span> tb@tarotmancer.com
      </a>
    </div>
  );
};

export default Contact;