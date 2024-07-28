import React, { useState, useEffect } from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import styles from './PastDrawsModal.module.css';
import { useTranslation } from '../utils/translations';

interface Draw {
  id: number;
  spread_type: string;
  created_at: string;
  response: string | null;
}

interface PastDrawsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PastDrawsModal: React.FC<PastDrawsModalProps> = ({ isOpen, onClose }) => {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const { getToken, user } = useKindeAuth();
  const { getTranslation } = useTranslation();

  const removeDraw = async (drawId: number) => {
    if (!user) return;

    try {
      const token = await getToken();
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      if (user.id) {
        headers['User-ID'] = user.id;
      }

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/user-draws/${drawId}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (response.ok) {
        setDraws(draws.filter(draw => draw.id !== drawId));
        if (selectedDraw && selectedDraw.id === drawId) {
          setSelectedDraw(null);
        }
      } else {
        const errorText = await response.text();
        console.error(`Failed to remove draw. Status: ${response.status}, Error: ${errorText}`);
        // Optionally, you can show an error message to the user here
      }
    } catch (error) {
      console.error('Error removing draw:', error);
      // Optionally, you can show an error message to the user here
    }
  };

  useEffect(() => {
    const fetchDraws = async () => {
      if (!user) return;

      try {
        const token = await getToken();
        const headers: HeadersInit = {
          'Authorization': `Bearer ${token}`,
        };

        // Only add the User-ID header if user.id is not null
        if (user.id) {
          headers['User-ID'] = user.id;
        }

        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/user-draws`, {
          headers: headers
        });
        
        if (response.ok) {
          const drawsData = await response.json();
          setDraws(drawsData);
        } else {
          console.error('Failed to fetch user draws');
        }
      } catch (error) {
        console.error('Error fetching user draws:', error);
      }
    };

    if (isOpen) {
      fetchDraws();
    }
  }, [isOpen, getToken, user]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <span className={styles.closeButtonIcon}>✶</span>
        </button>
        <h2 className={styles.modalTitle}>{getTranslation('pastDraws')}</h2>
        {selectedDraw ? (
          <div className={styles.selectedDrawContent}>
            <div className={styles.buttonContainer}>
              <button 
                onClick={() => setSelectedDraw(null)} 
                className={styles.backButton}
              >
                <span className={styles.buttonIcon}>☽</span> {getTranslation('backToList')}
              </button>
              <button 
                onClick={() => removeDraw(selectedDraw.id)} 
                className={styles.removeButton}
              >
                <span className={styles.buttonIcon}>✧</span> {getTranslation('removeDraw')}
              </button>
            </div>
            <h3 className={styles.drawInfo}>{selectedDraw.spread_type} - {new Date(selectedDraw.created_at).toLocaleString()}</h3>
            <div className={styles.robotMonitor}>
              <div className={styles.screenContent}>
                {selectedDraw.response ? (
                  <p className={styles.responseText}>{selectedDraw.response}</p>
                ) : (
                  <p className={styles.noResponse}>{getTranslation('noResponseAvailable')}</p>
                )}
                <div className={styles.screenOverlay}></div>
                <div className={styles.screenScanlines}></div>
              </div>
            </div>
          </div>
        ) : (
          <ul className={styles.drawList}>
            {draws.map((draw) => (
              <li key={draw.id} className={styles.drawItem}>
                <span onClick={() => setSelectedDraw(draw)} className={styles.drawInfo}>
                  <span className={styles.drawIcon}>✧</span> {draw.spread_type} - {new Date(draw.created_at).toLocaleString()}
                </span>
                <button 
                  onClick={() => removeDraw(draw.id)} 
                  className={styles.removeButton}
                >
                  <span className={styles.buttonIcon}>✧</span> {getTranslation('removeDraw')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PastDrawsModal;