import { BrowserRouter } from 'react-router-dom';
import { Routing } from './router';
import React from 'react';
import './App.css';
import { AuthProvider } from './shared/AuthContext/AuthContext';
import Notification from './shared/Notification/Notification';
import { Provider as ReduxProvider } from 'react-redux'; // Importă Redux Provider
import { store } from './app/store'; // Importă store-ul (asigură-te că calea este corectă)


const App: React.FC = () => (
  <AuthProvider>
    <ReduxProvider store={store}> {/* Redux Provider înfășoară partea care are nevoie de Redux */}
      <Notification /> {/* Notification ar putea sau nu să aibă nevoie de Redux */}
      <BrowserRouter>
        <Routing /> {/* Routing și copiii săi vor avea acces la Redux */}
      </BrowserRouter>
    </ReduxProvider>
  </AuthProvider>
);
export default App;