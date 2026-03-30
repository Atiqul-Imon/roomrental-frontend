import axios, { AxiosHeaders } from 'axios';
import { ErrorHandler } from './error-handler';
import { trackApiCall } from './performance';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and track performance
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add start time for performance tracking
      (config as any).__startTime = performance.now();
    }
    
    // FormData must NOT use application/json — Axios v1 uses AxiosHeaders where `delete` key may not work.
    // Let the runtime set multipart/form-data with the correct boundary.
    if (config.data instanceof FormData && config.headers) {
      if (config.headers instanceof AxiosHeaders) {
        config.headers.delete('Content-Type');
      } else {
        delete (config.headers as Record<string, unknown>)['Content-Type'];
        delete (config.headers as Record<string, unknown>)['content-type'];
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh, error tracking, and performance monitoring
api.interceptors.response.use(
  (response) => {
    // Track API call performance
    const config = response.config as any;
    if (config.__startTime && typeof window !== 'undefined') {
      const duration = performance.now() - config.__startTime;
      trackApiCall(
        config.method?.toUpperCase() || 'GET',
        config.url || '',
        duration,
        response.status
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Track API call performance even for errors
    if (originalRequest && typeof window !== 'undefined') {
      const config = originalRequest as any;
      if (config.__startTime) {
        const duration = performance.now() - config.__startTime;
        trackApiCall(
          config.method?.toUpperCase() || 'GET',
          config.url || '',
          duration,
          error.response?.status
        );
      }
    }

    // Track API errors (except 401 which is handled separately)
    if (error.response?.status !== 401) {
      ErrorHandler.logError(error, {
        source: 'api.interceptor',
        method: originalRequest?.method,
        url: originalRequest?.url,
        endpoint: originalRequest?.url?.replace(originalRequest?.baseURL || '', ''),
      }).catch(() => {
        // Don't let error tracking break the app
      });
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Track refresh token errors
        ErrorHandler.logError(refreshError, {
          source: 'api.interceptor',
          context: 'token_refresh_failed',
        }).catch(() => {
          // Don't let error tracking break the app
        });

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

