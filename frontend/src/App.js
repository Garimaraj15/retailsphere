import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import WhisprCart from './pages/WhisprCart';
import ScanPage from './pages/ScanPage';
import ProductDetails from './pages/ProductDetails';
import FeedbackPage from './pages/FeedbackPage';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/whisprcart" element={<WhisprCart />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
