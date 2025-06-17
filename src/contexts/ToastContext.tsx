import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Toast } from '../components/ui/Toast';

export type ToastType = 'success' | 'error' | 'info';

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none p-4 space-y-2">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            className="pointer-events-auto"
            style={{ 
              transform: `translateY(${index * 10}px)`,
              zIndex: 50 - index 
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Export a singleton instance for use outside of React components
let toastInstance: ToastContextType | null = null;

export const setToastInstance = (instance: ToastContextType) => {
  toastInstance = instance;
};

export const toast = {
  show: (message: string, type: ToastType) => {
    if (toastInstance) {
      toastInstance.showToast(message, type);
    }
  },
  success: (message: string) => {
    if (toastInstance) {
      toastInstance.showSuccess(message);
    }
  },
  error: (message: string) => {
    if (toastInstance) {
      toastInstance.showError(message);
    }
  },
  info: (message: string) => {
    if (toastInstance) {
      toastInstance.showInfo(message);
    }
  },
};