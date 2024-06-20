import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CelticSpread from './CelticSpread';
import ThreeCardSpread from './ThreeCardSpread';
import './App.css'; // Import the CSS file

function App() {
  return (
    <Router>
      <nav className="nav">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/" className="nav-link">Celtic Spread</Link>
          </li>
          <li className="nav-item">
            <Link to="/three-card-spread" className="nav-link">Three Card Spread</Link>
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
