
import './Footer.css'; // Asigură-te că ai creat și stilizat acest fișier
import { 
  FaShieldAlt, FaPhoneAlt, FaEnvelope, FaTwitter, FaLinkedin, FaYoutube, 
  FaCreditCard // Iconiță nouă pentru PCI DSS
} from 'react-icons/fa';
import { BsShieldLock } from 'react-icons/bs'; // Iconiță nouă pentru SSL

const Footer = () => {
  return (
    <footer className="bank-footer">
      <div className="footer-grid">
        {/* ... secțiunile Contact, Services, Follow Us rămân la fel ... */}
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
            {/* Secțiunea de badge-uri modificată */}
            <div className="security-badges-container"> {/* Un nou container pentru layout */}
              <div className="security-badge-item">
                <BsShieldLock className="security-badge-icon" />
                <span className="security-badge-text">SSL Secured</span>
              </div>
              <div className="security-badge-item">
                <FaCreditCard className="security-badge-icon" />
                <span className="security-badge-text">PCI DSS Compliant</span>
              </div>
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
            <a href="https://twitter.com" aria-label="Twitter" className="social-link"><FaTwitter /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn" className="social-link"><FaLinkedin /></a>
            <a href="https://youtube.com" aria-label="YouTube" className="social-link"><FaYoutube /></a>
          </div>
        </div>
      </div>

      <div className="footer-legal">
        { /* ... secțiunea legală rămâne la fel ... */ }
        <div className="legal-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/security">Security Center</a>
          <a href="/accessibility">Accessibility</a>
        </div>
        <div className="copyright">
          © {new Date().getFullYear()} Digital Banking. All rights reserved.<br />
          Member FDIC. Equal Housing Lender.
        </div>
      </div>
    </footer>
  );
};

export default Footer;