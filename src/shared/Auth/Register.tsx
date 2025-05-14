import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../app/Router';
import './AuthPages.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

 
  const COUNTRY_DIAL_CODE = '373';
  const COUNTRY_FLAG = '🇲🇩';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Verificări locale actualizate
    const passwordsMatch = password === confirmPassword;
    const isPhoneValid = phoneNumber.length === 8;

    if (!passwordsMatch || !isPhoneValid) {
      setError('Verifică parola sau numărul de telefon');
      return;
    }

    try {
      setLoading(true);
      const fullPhoneNumber = `${COUNTRY_DIAL_CODE}${phoneNumber}`;
      
      // Adăugat log pentru verificare
      console.log('Trimitem:', {
        username,
        password,
        email,
        phoneNumber: fullPhoneNumber
      });

      const response = await fetch('http://localhost:8081/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          email,
          phoneNumber: fullPhoneNumber
        }),
      });
    
      const text = await response.text(); 
      console.log('Răspuns:', text);

      if (response.ok) {
        navigate(AppRoutes.LOGIN);
      } else {
        throw new Error(text || 'Înregistrarea a eșuat'); 
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'A apărut o eroare la înregistrare');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = password === confirmPassword;
  const isPhoneValid = phoneNumber.length >= 8;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Înregistrare</h2>
        {error && <div className="error-message global-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nume utilizator</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Parolă</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Confirmă parola</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={!passwordsMatch ? 'input-error' : ''}
            />
            {!passwordsMatch && (
              <span className="error-message">Parolele nu coincid</span>
            )}
          </div>

          <div className="form-group">
            <label>Număr de telefon</label>
            <div className="phone-input-group">
              <div className="country-code-container">
                <span className="country-flag">{COUNTRY_FLAG}</span>
                <span className="country-code">+{COUNTRY_DIAL_CODE}</span>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="69012345"
                required
                className={!isPhoneValid ? 'input-error' : ''}
                minLength={8}
                maxLength={8}
                pattern="[0-9]{8}"
              />
            </div>
            {!isPhoneValid && (
              <span className="error-message">
                Numărul trebuie să conțină exact 8 cifre
              </span>
            )}
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={!passwordsMatch || !isPhoneValid || loading}
          >
            {loading ? 'Se înregistrează...' : 'Înregistrare'}
          </button>
        </form>

        <div className="auth-switch">
          Ai deja cont? <Link to={AppRoutes.LOGIN}>Conectează-te</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;