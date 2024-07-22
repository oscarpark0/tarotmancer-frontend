import React, { useState, useEffect } from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import styles from './PastDrawsModal.module.css';

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
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2 style={{ color: '#333' }}>Past Draws</h2>
        {selectedDraw ? (
          <div>
            <button 
              onClick={() => setSelectedDraw(null)} 
              style={{ backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', padding: '10px', cursor: 'pointer' }} 
            >
              Back to list
            </button>
            <h3 style={{ color: '#555' }}>{selectedDraw.spread_type} - {new Date(selectedDraw.created_at).toLocaleString()}</h3>
            {selectedDraw.response ? (
              <p className={styles.responseText}>{selectedDraw.response}</p>
            ) : (
              <p>No response available for this draw.</p>
            )}
          </div>
        ) : (
          <ul>
            {draws.map((draw) => (
              <li key={draw.id} onClick={() => setSelectedDraw(draw)}>
                {draw.spread_type} - {new Date(draw.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PastDrawsModal;