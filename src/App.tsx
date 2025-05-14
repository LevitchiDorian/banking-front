
import { BrowserRouter } from 'react-router-dom';
import { Routing } from './router';
import React from 'react';
import './App.css'; 
import { AuthProvider } from './shared/AuthContext/AuthContext'; 
import Notification from './shared/Notification/Notification'; 


const App: React.FC = () => (
  <AuthProvider>
    <Notification/>
    <BrowserRouter>
      <Routing />
    </BrowserRouter>
  </AuthProvider>
);
export default App;
