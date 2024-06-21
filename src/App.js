import React, { useState } from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';

function App() {
  const [selectedSpread, setSelectedSpread] = useState('celtic');
  const isMobile = window.innerWidth <= 768;

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