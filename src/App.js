import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';

function App() {
  const [selectedSpread, setSelectedSpread] = useState('celtic');

  const handleSpreadSelect = (selectedSpread) => {
    setSelectedSpread(selectedSpread);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={selectedSpread === 'celtic' ? <CelticSpread onSpreadSelect={handleSpreadSelect} selectedSpread={selectedSpread} /> : <ThreeCardSpread onSpreadSelect={handleSpreadSelect} selectedSpread={selectedSpread} />} />
      </Routes>
    </Router>
  );
}

export default App;