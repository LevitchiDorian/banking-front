import { useNavigate, Link } from 'react-router-dom';
import { AppRoutes } from '../../app/Router';
import { useAuth } from '../AuthContext/AuthContext'; // Importă contextul de autentificare
import './Header.css';
import Logo from '../../Logo.png';
import Conturi from '../Conturi/Conturi';

const Header = () => {
  const navigate = useNavigate();
  const { isLoggedIn, username, logout } = useAuth(); // Folosește contextul

  const handleLogin = () => {
    navigate(AppRoutes.LOGIN);
  };

  return (
    <header className="bank-header">
      <div className="header-left">
        <Link to={AppRoutes.MAIN} className="logo-link">
          <img src={Logo} alt="Bank Logo" className="logo" />
        </Link>
        <Link to={AppRoutes.MAIN} className="bank-name">
          Digital Banking
        </Link>
      </div>

      <nav className="header-nav">
        <Conturi />

        <Link to={AppRoutes.TRANSFERS} className="nav-btn">
          Transferuri
        </Link>

        {isLoggedIn ? (
          <div className="user-profile">
            <span className="username">{username}</span>
            <button className="logout-btn" onClick={logout}>
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