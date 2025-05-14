// src/hooks/useNotification.ts
import { toast } from 'react-hot-toast';

const useNotification = () => {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    loading: (message: string) => toast.loading(message),
    dismiss: (id: string) => toast.dismiss(id)
  };
};

export default useNotification;