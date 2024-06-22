import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';

function App() {
  const [selectedSpread, setSelectedSpread] = useState('celtic');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSpreadSelect = (spread) => {
    setSelectedSpread(spread);
  };

  return (
    <Router>
      <div className="App">
        {selectedSpread === 'celtic' ? (
          <CelticSpread
            onSpreadSelect={handleSpreadSelect}
            selectedSpread={selectedSpread}
            isMobile={isMobile}
          />
        ) : (
          <ThreeCardSpread
            onSpreadSelect={handleSpreadSelect}
            selectedSpread={selectedSpread}
            isMobile={isMobile}
          />
        )}
      </div>
    </Router>
  );
}

export default App;