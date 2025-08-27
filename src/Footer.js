import React from 'react';
import './Footer.css';

function Footer() {
  const githubRepoUrl = 'https://github.com/marffinn/Convertly'; // Replace with your actual GitHub repo URL

  return (
    <footer className="app-footer">
      <div className="container footer-content">
        <p>&copy; {new Date().getFullYear()} Convertly. All rights reserved.</p>
        <a href={githubRepoUrl} target="_blank" rel="noopener noreferrer">
          <img src="/github-mark.svg" alt="GitHub" className="github-icon" />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
