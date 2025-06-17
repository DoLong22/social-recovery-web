import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from './config';
import { toast } from '../contexts/ToastContext';

// Response types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    timestamp: string;
    requestId: string;
    version: string;
  };
};

// Error class
export class ApiError extends Error {
  code: string;
  status: number;
  details?: any;
  
  constructor(
    message: string,
    code: string,
    status: number,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from storage
    this.token = localStorage.getItem('authToken');

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        // Add cache prevention headers
        config.headers['Cache-Control'] = 'no-cache';
        config.headers['Pragma'] = 'no-cache';
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError<ApiResponse>) => {
        if (error.response) {
          const { status, data } = error.response;
          
          // Handle 401 - Unauthorized
          if (status === 401) {
            this.clearToken();
            // Show toast notification instead of redirecting
            if (window.location.pathname !== '/login') {
              toast.error('Session expired. Please login again.');
              // Use React Router navigation instead of page reload
              setTimeout(() => {
                window.location.pathname = '/login';
              }, 1500);
            }
          }
          
          const errorMessage = data?.error?.message || 'An error occurred';
          const errorCode = data?.error?.code || 'UNKNOWN_ERROR';
          
          throw new ApiError(errorMessage, errorCode, status, data?.error?.details);
        }
        
        if (error.request) {
          throw new ApiError('Network error - check if backend is running', 'NETWORK_ERROR', 0);
        }
        
        throw new ApiError('Request failed', 'REQUEST_ERROR', 0);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    return this.token;
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data as T;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data as T;
  }
}

export const apiClient = new ApiClient();