import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const { handleRedirectCallback } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    handleRedirectCallback().then(() => {
      navigate('/celtic-spread'); // Navigate to CelticSpread.jsx
    });
  }, [handleRedirectCallback, navigate]);

  return <div>Loading...</div>;
};

export default Callback;