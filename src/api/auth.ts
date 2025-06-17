import { apiClient } from './client';
import { ENDPOINTS } from './config';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};

export type User = {
  userId: string;
  email: string;
  username: string;
};

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Store token
    if (response.access_token) {
      apiClient.setToken(response.access_token);
    }
    
    return response;
  },

  logout() {
    apiClient.clearToken();
    localStorage.removeItem('userEmail');
  },

  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  },

  getStoredEmail(): string | null {
    return localStorage.getItem('userEmail');
  }
};