import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';

function App() {
  const handleSpreadSelect = (selectedSpread) => {
    // Handle spread selection logic here
    console.log('Selected spread:', selectedSpread);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<CelticSpread onSpreadSelect={handleSpreadSelect} />} />
        <Route path="/celtic-spread" element={<CelticSpread onSpreadSelect={handleSpreadSelect} />} />
        <Route path="/three-card-spread" element={<ThreeCardSpread onSpreadSelect={handleSpreadSelect} />} />
      </Routes>
    </Router>
  );
}

export default App;