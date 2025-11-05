/**
 * API Client
 * @description Axios instance with interceptors for auth and error handling
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await useAuthStore.getState().refreshAccessToken();
        const newToken = useAuthStore.getState().accessToken;

        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Format error response
    const errorResponse = {
      message: getErrorMessage(error),
      status: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(errorResponse);
  }
);

/**
 * Extract error message from various error formats
 */
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;
    return data.message || data.error || 'An error occurred';
  }

  if (error.message === 'Network Error') {
    return 'Unable to connect to the server';
  }

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out';
  }

  return error.message || 'An unexpected error occurred';
}

/**
 * Helper function for GET requests
 */
export const get = <T>(url: string, config?: AxiosRequestConfig) =>
  api.get<T>(url, config).then((res) => res.data);

/**
 * Helper function for POST requests
 */
export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
  api.post<T>(url, data, config).then((res) => res.data);

/**
 * Helper function for PUT requests
 */
export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
  api.put<T>(url, data, config).then((res) => res.data);

/**
 * Helper function for DELETE requests
 */
export const del = <T>(url: string, config?: AxiosRequestConfig) =>
  api.delete<T>(url, config).then((res) => res.data);

export default api;
