// src/components/Notification/Notification.tsx
import { Toaster } from 'react-hot-toast';
import './Notification.css';

const Notification = () => {
  return (
    <Toaster
      position="top-center"
      gutter={8}
      toastOptions={{
        className: 'custom-notification',
        duration: 3000,
        success: {
          className: 'notification-success',
          iconTheme: {
            primary: 'var(--success-color)',
            secondary: 'var(--background-color)'
          }
        },
        error: {
          className: 'notification-error',
          iconTheme: {
            primary: 'var(--error-color)',
            secondary: 'var(--background-color)'
          }
        },
        loading: {
          className: 'notification-loading'
        }
      }}
    />
  );
};

export default Notification;