import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import HomePage from '././HomePage';
import ConversionPage from './ConversionPage';
import './App.css';
import './dark-theme.css';
import { ThemeContext } from './ThemeContext';
import Footer from './Footer';

function App() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <Router basename="/Convertly">
      <div className="app-container">
        <Header />
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/convert" element={<ConversionPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;