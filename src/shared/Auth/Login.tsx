import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../app/Router'; // Asigură-te că această cale este corectă
import { useAuth } from '../../context/AuthContext/AuthContext'; // Asigură-te că această cale este corectă
import { useLoginUserMutation } from '../../store/bankingApi'; // IMPORTĂ MUTAȚIA RTK QUERY
import './AuthPages.css';
import { IUserDTO } from '../../entities/IUserDTO'; // Importă interfața dacă nu o ai deja global

const Login = () => {
  const [usernameInput, setUsernameInput] = useState(''); // Redenumit pentru a evita conflictul cu username din useAuth
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = useAuth(); // Păstrăm useAuth pentru a apela auth.login DUPĂ succesul mutației RTK

  // Utilizează hook-ul de mutație RTK Query
  const [loginUserRTK, { isLoading /* , error: rtkQueryError */ }] = useLoginUserMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const credentials: IUserDTO = { username: usernameInput, password };

    try {
      // Apelul către backend prin mutația RTK Query
      // .unwrap() va arunca o eroare dacă request-ul eșuează (ex: 401, 400),
      // care va fi prinsă de blocul catch.
      console.log('[Login.tsx] Attempting login with RTK Mutation for user:', usernameInput);
      const loginResponse = await loginUserRTK(credentials).unwrap();

      // Dacă login-ul prin RTK Query a reușit și avem token (loginResponse este ILoginResponse):
      // Logica din onQueryStarted din bankingApi.ts (care conține localStorage.setItem) se va fi executat deja.
      // Acum, actualizăm și starea AuthContext.
      console.log('[Login.tsx] RTK Mutation successful. Calling auth.login(). Token:', loginResponse.token ? loginResponse.token.substring(0,15) + "..." : "undefined");
      auth.login(usernameInput, loginResponse.token); // Actualizează starea AuthContext

      navigate(AppRoutes.MAIN); // Sau unde vrei să mergi după login
    } catch (err: any) { // Tipăm err ca any pentru a accesa proprietăți nestandard
      console.error('[Login.tsx] Login failed:', err);
      // RTK Query, când .unwrap() eșuează, aruncă un obiect care poate conține .data (body-ul erorii de la server) și .status
      if (err.data && err.data.message) {
        setError(err.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('A apărut o eroare la autentificare. Vă rugăm încercați din nou.');
      }
    }
  };

  if (auth.isLoggedIn) { // Folosim auth.isLoggedIn și auth.username din context
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Bun venit, {auth.username}!</h2>
          <button
            onClick={() => {
              auth.logout(); // Apelăm logout din AuthContext
              // Opcional: Poți apela și mutația logoutUser din RTK Query dacă face mai mult decât localStorage.removeItem
              // logoutUserRTK(); 
            }}
            className="auth-btn"
            style={{ marginTop: '20px' }}
          >
            Deconectare
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Logare</h2>
        {error && <div className="error-message global-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nume utilizator</label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Parolă</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Se conectează...' : 'Conectare'}
          </button>
        </form>

        <div className="auth-switch">
          Nu ai cont? <Link to={AppRoutes.REGISTER}>Înregistrare</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;