import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

interface CardFrequency {
  card_name: string;
  card_img: string;
  frequency: number;
  date: string;
}

const DailyCardFrequencies: React.FC = () => {
  const [frequencies, setFrequencies] = useState<CardFrequency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useKindeAuth();

  useEffect(() => {
    const fetchFrequencies = async () => {
      try {
        const token = await getToken();
        const response = await axios.get<CardFrequency[]>(`${process.env.REACT_APP_BASE_URL}/api/daily-card-frequencies`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setFrequencies(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch card frequencies');
        setLoading(false);
      }
    };

    fetchFrequencies();
  }, [getToken]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="daily-card-frequencies">
      <h2>Daily Card Frequencies</h2>
      <ul>
        {frequencies.map((freq) => (
          <li key={freq.card_name}>
            <img src={freq.card_img} alt={freq.card_name} width="50" height="100" />
            <span>{freq.card_name}: {freq.frequency} times</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DailyCardFrequencies;