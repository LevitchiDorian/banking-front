import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../app/Router';
import { useAuth } from '../AuthContext/AuthContext';
import './AuthPages.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isLoggedIn, username: currentUser, login, logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Resetează eroarea înainte de cerere
    try {
      const response = await fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      // Verificăm mai întâi tipul de conținut al răspunsului
      const contentType = response.headers.get('Content-Type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        // Dacă răspunsul este JSON, îl parsăm
        data = await response.json();
      } else {
        // Dacă nu este JSON, luăm textul brut
        data = await response.text();
      }

      if (!response.ok) {
        // Dacă statusul nu este OK, aruncăm o eroare cu mesajul corespunzător
        throw new Error(
          typeof data === 'string' ? data : data.message || 'Credențiale invalide'
        );
      }

      // Dacă totul este OK, folosim funcția login din context
      login(username, data.token);
      navigate(AppRoutes.MAIN);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'A apărut o eroare la autentificare');
      console.error('Login error:', error);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Bun venit, {currentUser}!</h2>
          <button
            onClick={logout}
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

          <button type="submit" className="auth-btn">
            Conectare
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