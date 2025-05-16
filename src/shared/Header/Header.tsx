// src/components/Header/Header.tsx
import React, { useState, useEffect } from 'react'; // Importă useState și useEffect
import { useNavigate, Link } from 'react-router-dom';
import { AppRoutes } from '../../app/Router';
import { useAuth } from '../../shared/AuthContext/AuthContext';
import { useSelectedAccount } from '../SelectedAccountContext/SelectedAccountContext'; // Importă contextul pentru contul selectat
import './Header.css';
import Logo from '../../Logo.png';
import Conturi from '../Conturi/Conturi';

const Header = () => {
  const navigate = useNavigate();
  const { isLoggedIn, username, logout } = useAuth();
  const { setSelectedAccount } = useSelectedAccount();
  const [isScrolled, setIsScrolled] = useState(false); // State pentru starea de scroll

  const handleLogin = () => {
    navigate(AppRoutes.LOGIN);
  };

  const handleGoToMainAndResetAccount = () => {
    setSelectedAccount(null);
    navigate(AppRoutes.MAIN);
  };

  // Efect pentru a detecta scroll-ul
  useEffect(() => {
    const handleScroll = () => {
      // Setează isScrolled la true dacă s-a scrollat mai mult de ~10px (sau o valoare preferată)
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup la unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Rulează o singură dată la montare

  return (
    // Adaugă clasa 'scrolled' condiționat
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
          Transferuri
        </Link>
        {/* ... restul navigației ... */}
        {isLoggedIn ? (
          <div className="user-profile">
            <span className="username">{username}</span>
            <button className="logout-btn" onClick={() => {
              logout();
              setSelectedAccount(null);
            }}>
              Delogare
            </button>
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