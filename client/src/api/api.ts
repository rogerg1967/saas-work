import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
});

let accessToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Function to subscribe to token refresh
const subscribeToTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Function to notify all subscribers with new token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Function to check if token is about to expire
const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // If token expires in less than 2 minutes, consider it expiring soon
    return decoded.exp - currentTime < 120;
  } catch (error) {
    return true; // If we can't decode the token, assume it's expiring
  }
};

// Function to refresh the access token
const refreshAccessToken = async (): Promise<string> => {
  console.log('Starting token refresh process, refresh token available:', !!refreshToken);
  try {
    if (!refreshToken) {
      refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
    }

    const { data } = await axios.post(`/api/auth/refresh`, { refreshToken });

    console.log('Token refresh response:', {
      success: data.success,
      hasAccessToken: !!data.data?.accessToken,
      hasRefreshToken: !!data.data?.refreshToken
    });

    if (data.success) {
      const newAccessToken = data.data.accessToken;
      const newRefreshToken = data.data.refreshToken;

      // Update tokens in local storage
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Update in-memory tokens
      accessToken = newAccessToken;
      refreshToken = newRefreshToken;

      return newAccessToken;
    } else {
      throw new Error(data.error || 'Failed to refresh token');
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Clear tokens and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    accessToken = null;
    refreshToken = null;
    window.location.href = '/login';
    throw error;
  }
};

// Axios request interceptor: Attach access token to headers and handle token refresh
api.interceptors.request.use(
  async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
    if (!accessToken) {
      accessToken = localStorage.getItem('accessToken');
    }

    if (!refreshToken) {
      refreshToken = localStorage.getItem('refreshToken');
    }

    console.log('Request interceptor, token status:', {
      hasAccessToken: !!accessToken,
      isExpiring: accessToken ? isTokenExpiringSoon(accessToken) : false,
      isRefreshing
    });

    // If we have an access token and it's about to expire, refresh it proactively
    if (accessToken && isTokenExpiringSoon(accessToken) && !isRefreshing && refreshToken) {
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;

        // Update the current request with the new token
        if (config.headers) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }

        // Notify all pending requests
        onTokenRefreshed(newToken);
      } catch (error) {
        isRefreshing = false;
        console.error('Failed to refresh token:', error);
      }
    } else if (accessToken && config.headers) {
      // Just attach the current token
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    console.log('Request:', config.method, config.url, config.data);
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Axios response interceptor: Handle 401 errors
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    console.log('Response interceptor error:', {
      status: error.response?.status,
      isRetry: !!(error.config as any)?._retry,
      isRefreshing
    });
    
    console.error('Response error:', error.response?.status, error.response?.data);
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If the error is due to an expired access token
    if ([401, 403].includes(error.response?.status) && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried

      if (isRefreshing) {
        // If a refresh is already in progress, wait for the new token
        try {
          const newToken = await new Promise<string>((resolve) => {
            subscribeToTokenRefresh((token: string) => {
              resolve(token);
            });
          });

          // Retry the original request with the new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        } catch (error) {
          return Promise.reject(error);
        }
      } else {
        // Start a new refresh process
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          isRefreshing = false;

          // Retry the original request with the new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          // Notify all pending requests
          onTokenRefreshed(newToken);

          return api(originalRequest);
        } catch (error) {
          isRefreshing = false;
          return Promise.reject(error);
        }
      }
    }

    return Promise.reject(error); // Pass other errors through
  }
);

export default api;