import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ResourcesPage.module.css';

const ResourcesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const resources = [
    {
      name: 'Aeclectic Tarot',
      url: 'http://www.aeclectic.net/tarot/',
      description: 'Extensive tarot deck reviews and tarot card meanings.'
    },
    {
      name: 'Biddy Tarot',
      url: 'https://www.biddytarot.com/',
      description: 'Comprehensive tarot card meanings and readings.'
    },
    {
      name: 'Corax Tarot',
      url: 'http://corax.com/tarot/index.html',
      description: 'In-depth tarot card meanings and interpretations.'
    },
    {
      name: 'Labyrinthos',
      url: 'https://labyrinthos.co/',
      description: 'Tarot and oracle card meanings, with a focus on learning and education.'
    },
    {
      name: 'Random Tarot Card',
      url: 'https://randomtarotcard.com/',
      description: 'Generate random tarot cards.'
    }
  ];

  return (
    <div className={styles.resourcesPage}>
      <button className={styles.backButton} onClick={handleBack}>
        <span className={styles.backButtonIcon}>☽</span> Back
      </button>
      <header className={styles.pageHeader}>
        <h1>Tarot Resources</h1>
      </header>
      <main className={styles.pageContent}>
        <ul className={styles.resourceList}>
          {resources.map((resource, index) => (
            <li key={index} className={styles.resourceItem}>
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className={styles.resourceLink}>

                {resource.name}
              </a>
              <p className={styles.resourceDescription}>{resource.description}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default ResourcesPage;