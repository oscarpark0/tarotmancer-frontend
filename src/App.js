import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CelticSpread from './CelticSpread';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CelticSpread />} />
        <Route path="/celtic-spread" element={<CelticSpread />} />
      </Routes>
    </Router>
  );
}

export default App;
