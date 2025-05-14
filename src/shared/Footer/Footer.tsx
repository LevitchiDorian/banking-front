// import React from 'react';
import './Footer.css';
import { FaShieldAlt, FaPhoneAlt, FaEnvelope, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bank-footer">
      <div className="footer-grid">
        <div className="footer-section">
          <h4 className="footer-heading"><FaPhoneAlt className="footer-icon" /> Contact</h4>
          <div className="footer-content">
            <p className="footer-item">
              24/7 Support: <a href="tel:0800123456">0800 123 456</a>
            </p>
            <p className="footer-item">
              <FaEnvelope className="icon-spacing" />
              <a href="mailto:support@digitalbank.com">support@digitalbank.com</a>
            </p>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading"><FaShieldAlt className="footer-icon" /> Security</h4>
          <div className="footer-content">
            <p className="footer-item">ISO 27001 Certified</p>
            <p className="footer-item">256-bit Encryption</p>
            <div className="security-badges">
              <img src="/ssl-badge.svg" alt="SSL Secured" className="security-badge" />
              <img src="/pci-dss.svg" alt="PCI DSS Compliant" className="security-badge" />
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Services</h4>
          <div className="footer-content">
            <a href="/personal-banking" className="service-link">Personal Banking</a>
            <a href="/business" className="service-link">Business Solutions</a>
            <a href="/loans" className="service-link">Loans & Mortgages</a>
            <a href="/investments" className="service-link">Investment Services</a>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Follow Us</h4>
          <div className="social-links">
            <a href="https://twitter.com" className="social-link"><FaTwitter /></a>
            <a href="https://linkedin.com" className="social-link"><FaLinkedin /></a>
            <a href="https://youtube.com" className="social-link"><FaYoutube /></a>
          </div>
        </div>
      </div>

      <div className="footer-legal">
        <div className="legal-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/security">Security Center</a>
          <a href="/accessibility">Accessibility</a>
        </div>
        <div className="copyright">
          © 2024 Digital Banking. All rights reserved.<br />
          Member FDIC. Equal Housing Lender.
        </div>
      </div>
    </footer>
  );
};

export default Footer;