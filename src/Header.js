import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import logo from './convertly.png';
console.log('Logo imported:', logo);

function Header() {
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
        </div>
      </div>
    </header>
  );
}

export default Header;