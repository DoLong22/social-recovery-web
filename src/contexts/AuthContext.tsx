import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { LoginRequest } from '../api/auth';
import type { ApiError } from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  email: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const isAuth = authApi.isAuthenticated();
      const storedEmail = authApi.getStoredEmail();
      
      setIsAuthenticated(isAuth);
      setEmail(storedEmail);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null);
      await authApi.login(credentials);
      
      // Store email
      localStorage.setItem('userEmail', credentials.email);
      
      setIsAuthenticated(true);
      setEmail(credentials.email);
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      email,
      login,
      logout,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};