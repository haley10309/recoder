import React from "react";
import "@Components/Nav/Footer.scss"; // Assuming you want to apply some styles

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy Policy</a>
        </div>
        <div className="footer-copy">
          <p>&copy; {new Date().getFullYear()} PTKOREA All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
