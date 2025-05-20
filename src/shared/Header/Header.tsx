// src/shared/Header/Header.tsx
import { useState, useEffect, useRef } from 'react'; // Adaugă useRef
import { useNavigate, Link } from 'react-router-dom';
import { AppRoutes } from '../../app/Router';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useSelectedAccount } from '../../context/SelectedAccountContext/SelectedAccountContext';
import './Header.css';
import Logo from '../../Logo.png';
import Conturi from '../Conturi/Conturi'; // Asigură-te că această cale e corectă
import { FaUserCircle, FaSignOutAlt} from 'react-icons/fa'; // Iconițe pentru dropdown

const Header = () => {
  const navigate = useNavigate();
  const { isLoggedIn, username, logout, /* userData - dacă ai mai multe date despre user în context */ } = useAuth();
  const { setSelectedAccount } = useSelectedAccount();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // State pentru dropdown user
  const userDropdownRef = useRef<HTMLDivElement>(null); // Ref pentru a detecta click în afara dropdown-ului

  const handleLogin = () => navigate(AppRoutes.LOGIN);
  const handleGoToMainAndResetAccount = () => {
    setSelectedAccount(null);
    navigate(AppRoutes.MAIN);
  };

  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  const handleLogout = () => {
    logout();
    setSelectedAccount(null);
    setIsUserDropdownOpen(false); // Închide dropdown-ul la logout
    navigate(AppRoutes.MAIN); // Redirecționează la pagina principală sau de login
  };

  // Efect pentru scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efect pentru a închide dropdown-ul la click în afara lui
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
        <Conturi />
        <Link to={AppRoutes.TRANSFERS} className="nav-btn">
          Istoric Transferuri
        </Link>



        {isLoggedIn ? (
          <div className="user-actions-container" ref={userDropdownRef}>
            <button className="user-profile-btn" onClick={toggleUserDropdown} aria-expanded={isUserDropdownOpen} aria-haspopup="true">
              <FaUserCircle className="user-profile-icon" />
              <span className="username-display">{username}</span>
              {/* Aici ai putea adăuga o săgeată mică pentru dropdown */}
            </button>
            {isUserDropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="user-dropdown-header">
                  Conectat ca: <strong>{username}</strong>
                </div>
                {/* Presupunând că ai aceste rute sau funcționalități */}
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