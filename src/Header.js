import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from './ThemeContext';
import './Header.css';
import logo from './convertly.png';
console.log('Logo imported:', logo);

function Header() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="container narrow-container">
        <div className="header-content">
          <div onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img src={logo} alt="Convertly Logo" className="logo" />
          </div>
          <div className="switch-wrapper">
            <div className="switch">
              <label>
                Light
                <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
                <span className="lever"></span>
                Dark
              </label>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
