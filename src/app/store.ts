import { configureStore } from '@reduxjs/toolkit';
import { bankingApiSlice } from '../store/bankingApi'; // Corecția este aici

// Importă alte reduceri dacă ai
// import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    [bankingApiSlice.reducerPath]: bankingApiSlice.reducer,
    // auth: authReducer, // Dacă ai un slice separat pentru starea de autentificare
    // alte reduceri
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(bankingApiSlice.middleware),
});

// Tipuri pentru uz în aplicație
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;