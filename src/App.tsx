// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext/AuthContext';
import Notification from './shared/Notification/Notification';
import { SelectedAccountProvider } from './context/SelectedAccountContext/SelectedAccountContext';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './app/store';

// Importă paginile principale
import LandingPage from './pages/LandigPage/LandingPage'; // Ajustează calea dacă e 'LandigPage'
import MainPage from './pages/MainPage/MainPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import TransfersPage from './pages/TransfersPage/TransfersPage'; // Aceasta este pagina pentru ISTORICUL transferurilor

import { AppRoutes } from './app/Router'; // Ajustează calea

import type { ReactElement } from 'react'; // Necesită 'React' importat

// Componenta pentru rute protejate
const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const auth = useAuth();
  if (!auth.isLoggedIn) {
    return <Navigate to={AppRoutes.LOGIN} replace />;
  }
  return children;
};

// Componenta care va gestiona rutele
const AppRouterLogic = () => {
  const auth = useAuth();

  return (
    <Routes>
      <Route 
        path={AppRoutes.MAIN} 
        element={auth.isLoggedIn ? <MainPage /> : <LandingPage />} 
      />
      <Route path={AppRoutes.LOGIN} element={<LoginPage />} />
      <Route path={AppRoutes.REGISTER} element={<RegisterPage />} />
      
      {/* Ruta pentru pagina de istoric al transferurilor (dacă așa este intenția) */}
      <Route 
        path={AppRoutes.TRANSFERS} 
        element={<ProtectedRoute><TransfersPage /></ProtectedRoute>} 
      />

      <Route path="*" element={<Navigate to={AppRoutes.MAIN} replace />} />
    </Routes>
  );
};

const App: React.FC = () => (
  <ReduxProvider store={store}>
    <AuthProvider>
      <SelectedAccountProvider>
        <Notification />
        <BrowserRouter>
          <AppRouterLogic />
        </BrowserRouter>
      </SelectedAccountProvider>
    </AuthProvider>
  </ReduxProvider>
);

export default App;