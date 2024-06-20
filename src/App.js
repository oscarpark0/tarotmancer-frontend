import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/">Celtic Spread</Link>
          </li>
          <li>
            <Link to="/three-card-spread">Three Card Spread</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<CelticSpread />} />
        <Route path="/celtic-spread" element={<CelticSpread />} />
        <Route path="/three-card-spread" element={<ThreeCardSpread />} />
      </Routes>
    </Router>
  );
}

export default App;

