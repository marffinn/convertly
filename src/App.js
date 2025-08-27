import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import HomePage from './HomePage';
import ConversionPage from './ConversionPage';
import './App.css';
import './dark-theme.css';
import { ThemeContext } from './ThemeContext';
import Footer from './Footer'; // Import Footer

function App() {
  const { theme, toggleTheme } = useContext(ThemeContext); // Added toggleTheme back

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <Router basename="/Convertly">
      <div className="app-container"> {/* Added app-container for flexbox */}
        <Header />
        <div className="content-wrapper"> {/* Added content-wrapper for main content */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/convert" element={<ConversionPage />} />
          </Routes>
        </div>
        <div className="theme-switcher-bottom"> {/* New div for theme switcher */}
          <div className="switch container">
            <label>
              Light
              <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
              <span className="lever"></span>
              Dark
            </label>
          </div>
        </div>
        <Footer /> {/* Add Footer component here */}
      </div>
    </Router>
  );
}

export default App;
