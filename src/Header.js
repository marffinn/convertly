import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import './Header.css';
import logo from './convertly.png';
console.log('Logo imported:', logo);

function Header() {
  const { } = useContext(ThemeContext);

  return (
    <header className="app-header">
      <div className="container narrow-container">
        <div className="header-content">
          <img src={logo} alt="Convertly Logo" className="logo" />
          
        </div>
      </div>
    </header>
  );
}

export default Header;
