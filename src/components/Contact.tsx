import React from 'react';
import styles from './Contact.module.css';

const Contact: React.FC = () => {
  return (
    <div className={styles.contactContainer}>
      <h2 className={styles.title}>Contact</h2>
      <a href="mailto:tb@tarotmancer.com" className={styles.email}>
        tb@tarotmancer.com
      </a>
    </div>
  );
};

export default Contact;
