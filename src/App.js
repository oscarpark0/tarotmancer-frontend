import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import CelticSpread from './CelticSpread'; // Import CelticSpread
import Callback from './components/Callback'; // Import Callback component

function App() {
  return (
    <Router>
      <div>
        <Navigation />
        <Routes>
          <Route path="/" element={<CelticSpread />} /> {/* Define your home component */}
          <Route path="/celtic-spread" element={<CelticSpread />} /> {/* Define the route for CelticSpread */}
          <Route path="/callback" element={<Callback />} /> {/* Define the route for Callback */}
        </Routes>
      </div>
    </Router>
  );
}


export default App;
