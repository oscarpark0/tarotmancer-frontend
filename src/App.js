import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';

function App() {
  const [selectedSpread, setSelectedSpread] = useState('celtic');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSpreadSelect = (selectedSpread) => {
    setSelectedSpread(selectedSpread);
  };

  return (
    <Router>
      <div>
        {isMobile ? (
          selectedSpread === 'celtic' ? (
            <CelticSpread onSpreadSelect={handleSpreadSelect} selectedSpread={selectedSpread} />
          ) : (
            <ThreeCardSpread onSpreadSelect={handleSpreadSelect} selectedSpread={selectedSpread} />
          )
        ) : (
          selectedSpread === 'celtic' ? (
            <CelticSpread onSpreadSelect={handleSpreadSelect} selectedSpread={selectedSpread} />
          ) : (
            <ThreeCardSpread onSpreadSelect={handleSpreadSelect} selectedSpread={selectedSpread} />
          )
        )}
      </div>
    </Router>
  );
}

export default App;