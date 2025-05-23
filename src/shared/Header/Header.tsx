// src/shared/Header/Header.tsx
import React, { useState, useEffect, useRef } from 'react'; // Adaugă React dacă lipsește
import { useNavigate, Link } from 'react-router-dom';
import { AppRoutes } from '../../app/Router'; // Ajustează calea
import { useAuth } from '../../context/AuthContext/AuthContext'; // Ajustează calea
import { useSelectedAccount } from '../../context/SelectedAccountContext/SelectedAccountContext'; // Ajustează calea
import './Header.css';
import Logo from '../../Logo.png'; // Ajustează calea
import Conturi from '../Conturi/Conturi'; // Calea corectă relativă la Header.tsx
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, username, logout } = useAuth(); // Obține starea de autentificare
  const { setSelectedAccount } = useSelectedAccount();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const handleLogin = () => navigate(AppRoutes.LOGIN);
  const handleGoToMainAndResetAccount = () => {
    setSelectedAccount(null);
    navigate(AppRoutes.MAIN);
  };

  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  const handleLogout = () => {
    logout();
    setSelectedAccount(null);
    setIsUserDropdownOpen(false);
    navigate(AppRoutes.MAIN);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  console.log("Header isLoggedIn:", isLoggedIn); // Verifică starea isLoggedIn

  return (
    <header className={`bank-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-left">
        <div onClick={handleGoToMainAndResetAccount} className="logo-link-wrapper">
          <Link to={AppRoutes.MAIN} className="logo-link">
            <img src={Logo} alt="Bank Logo" className="logo" />
          </Link>
          <Link to={AppRoutes.MAIN} className="bank-name">
            Digital Banking
          </Link>
        </div>
      </div>

      <nav className="header-nav">
        {isLoggedIn && ( // Afișează Conturi și Istoric Transferuri doar dacă utilizatorul este logat
          <>
            <Conturi />
            <Link to={AppRoutes.TRANSFERS} className="nav-btn">
              Istoric Transferuri
            </Link>
          </>
        )}

        {isLoggedIn ? (
          <div className="user-actions-container" ref={userDropdownRef}>
            <button className="user-profile-btn" onClick={toggleUserDropdown} aria-expanded={isUserDropdownOpen} aria-haspopup="true">
              <FaUserCircle className="user-profile-icon" />
              <span className="username-display">{username}</span>
            </button>
            {isUserDropdownOpen && (
              <div className={`user-dropdown-menu ${isUserDropdownOpen ? 'active' : ''}`}> {/* Adaugă clasa 'active' corect */}
                <div className="user-dropdown-header">
                  Conectat ca: <strong>{username}</strong>
                </div>
                <Link to={AppRoutes.MAIN /* Modifică cu AppRoutes.PROFILE_DETAILS sau similar */} className="user-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                  <FaUserCircle className="dropdown-item-icon" /> Detalii Profil
                </Link>
                <button onClick={handleLogout} className="user-dropdown-item logout">
                  <FaSignOutAlt className="dropdown-item-icon" /> Delogare
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="nav-btn login-btn" onClick={handleLogin}>
            Logare
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;