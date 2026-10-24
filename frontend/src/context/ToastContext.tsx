import { createContext, useContext, useState, type ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';

interface Toast { message: string; severity: 'error' | 'success' }
interface ToastApi { showError: (message: string) => void; showSuccess: (message: string) => void }

const ToastContext = createContext<ToastApi>({ showError: () => {}, showSuccess: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const api: ToastApi = {
    showError: message => setToast({ message, severity: 'error' }),
    showSuccess: message => setToast({ message, severity: 'success' }),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)}>
        <Alert severity={toast?.severity} variant="filled">{toast?.message}</Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
