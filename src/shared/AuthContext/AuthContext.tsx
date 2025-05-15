// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  login: (username: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_TOKEN_KEY = 'authToken'; // Definește cheia ca o constantă
const USERNAME_KEY = 'username';    // Și pentru username, pentru consistență

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // La inițializare, verifică dacă există un token și un username
    // Este mai sigur să verifici token-ul pentru a determina starea de logat,
    // nu doar username-ul, deoarece token-ul este dovada autentificării.
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUsername = localStorage.getItem(USERNAME_KEY);

    if (storedToken && storedUsername) {
      // Aici ai putea adăuga o verificare a validității token-ului (de ex., decodare pentru a verifica data de expirare)
      // Pentru simplitate, acum doar presupunem că dacă există, e ok.
      setIsLoggedIn(true);
      setUsername(storedUsername);
      console.log('[AuthContext] User session restored from localStorage for:', storedUsername);
    } else {
      console.log('[AuthContext] No active session found in localStorage.');
    }
  }, []);

  const login = (usernameValue: string, tokenValue: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, tokenValue); // Folosește AUTH_TOKEN_KEY
    localStorage.setItem(USERNAME_KEY, usernameValue);
    setIsLoggedIn(true);
    setUsername(usernameValue);
    toast.success(`Bun venit, ${usernameValue}!`);
    console.log('[AuthContext] User logged in. Token saved with key:', AUTH_TOKEN_KEY);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY); // Folosește AUTH_TOKEN_KEY
    localStorage.removeItem(USERNAME_KEY);
    setIsLoggedIn(false);
    setUsername('');
    toast.success('Te-ai delogat cu succes!');
    console.log('[AuthContext] User logged out. Token removed with key:', AUTH_TOKEN_KEY);
    // Este o idee bună să cureți și cache-ul RTK Query la logout, dacă nu o faci deja
    // în mutația logoutUser din bankingApiSlice.
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};