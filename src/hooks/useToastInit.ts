import { useEffect } from 'react';
import { useToast, setToastInstance } from '../contexts/ToastContext';

export const useToastInit = () => {
  const toastContext = useToast();
  
  useEffect(() => {
    setToastInstance(toastContext);
  }, [toastContext]);
};