import { BrowserRouter } from 'react-router-dom';
import { Routing } from './router'; // Asigură-te că calea este corectă
import React from 'react';
import './App.css';
import { AuthProvider } from './shared/AuthContext/AuthContext'; // Asigură-te că calea este corectă
import Notification from './shared/Notification/Notification'; // Asigură-te că calea este corectă
import { SelectedAccountProvider } from './shared/SelectedAccountContext/SelectedAccountContext'; // Asigură-te că calea este corectă

// Importuri pentru Redux
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './app/store'; // Asigură-te că calea este corectă

const App: React.FC = () => (
  // Ordinea providerilor externi (AuthProvider, ReduxProvider) poate conta
  // dacă unul depinde de celălalt. De obicei, ReduxProvider este destul de sus.
  <ReduxProvider store={store}>  {/* Provider-ul Redux la un nivel superior */}
    <AuthProvider>              {/* Apoi AuthProvider */}
      <SelectedAccountProvider> {/* Apoi SelectedAccountProvider */}
        <Notification />
        <BrowserRouter>
          <Routing /> {/* Routing și copiii săi vor avea acces la TOATE cele 3 contexte */}
        </BrowserRouter>
      </SelectedAccountProvider>
    </AuthProvider>
  </ReduxProvider>
);

export default App;