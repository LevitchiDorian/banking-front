import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../app/Router';
import Logo from '../../Logo.png'; // Asigură-te că ai Logo.png în src sau ajustează calea
import './LandingHeader.css';
import { FaBars, FaTimes } from 'react-icons/fa'; // Pentru meniul mobil

const LandingHeader = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleNavLinkClick = (hash: string) => {
    closeMobileMenu();
    const element = document.getElementById(hash.substring(1));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(AppRoutes.MAIN + hash); // Navighează la /#hash dacă e pe altă pagină
    }
  };


  return (
    <header className={`landing-header ${isScrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
      <div className="landing-header-content">
        <Link to={AppRoutes.MAIN} className="landing-logo-link" onClick={closeMobileMenu}>
          <img src={Logo} alt="Digital Banking Logo" className="landing-logo" />
          <span className="landing-bank-name">Digital Banking</span>
        </Link>

        <nav className={`landing-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <a href="/#hero" onClick={() => handleNavLinkClick('#hero')} className="landing-nav-link">Acasă</a>
          <a href="/#services" onClick={() => handleNavLinkClick('#services')} className="landing-nav-link">Servicii</a>
          <a href="/#benefits" onClick={() => handleNavLinkClick('#benefits')} className="landing-nav-link">Avantaje</a>
          <a href="/#contact-cta" onClick={() => handleNavLinkClick('#contact-cta')} className="landing-nav-link">Contact</a>
        </nav>

        <div className="landing-auth-buttons">
          <button onClick={() => { navigate(AppRoutes.LOGIN); closeMobileMenu(); }} className="landing-btn login">Logare</button>
          <button onClick={() => { navigate(AppRoutes.REGISTER); closeMobileMenu(); }} className="landing-btn register">Înregistrare</button>
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </header>
  );
};

export default LandingHeader;