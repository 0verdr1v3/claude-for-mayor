import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SomaliScanPage from './pages/SomaliScanPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/somaliscan" element={<SomaliScanPage />} />
      </Routes>
    </Router>
  );
}

export default App;
