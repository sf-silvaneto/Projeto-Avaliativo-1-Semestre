import axios, { AxiosError, AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const TOKEN_KEY = 'auth_token';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url;

    console.log(`API Error Interceptor: Status ${status} on URL ${requestUrl}`);
    if (error.response?.data) {
      console.log('API Error Interceptor: Error data:', error.response.data);
    }

    const localErrorHandlingPaths = [
      '/api/administradores/profile',               
      '/api/administradores/profile/verified-update', 
      '/api/administradores/verificar-palavra-chave', 
    ];

    const adjustedLocalErrorHandlingPaths = [
      '/administradores/profile',
      '/administradores/profile/verified-update',
      '/administradores/verificar-palavra-chave',
    ];

    const isLocalErrorHandlingPath = adjustedLocalErrorHandlingPaths.some(path => requestUrl?.endsWith(path) || requestUrl === path);

    console.log('API Interceptor - calculated isLocalErrorHandlingPath:', isLocalErrorHandlingPath, 'for requestUrl:', requestUrl);


    if (status === 401) {
      if (!isLocalErrorHandlingPath) {
        console.warn('Interceptor: Redirecionando para login devido a 401 em:', requestUrl);
        Cookies.remove(TOKEN_KEY);
        window.location.href = '/login?session=expired';
      } else {
        console.info('Interceptor: Erro 401 em rota com tratamento local, deixando o componente tratar:', requestUrl);
      }
    } else if (status === 403) {
      if (!isLocalErrorHandlingPath) {
        console.warn('Interceptor: Redirecionando para /sem-permissao devido a 403 em:', requestUrl);
        window.location.href = '/sem-permissao';
      } else {
        console.info('Interceptor: Erro 403 em rota com tratamento local, deixando o componente tratar:', requestUrl);
      }
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { 
    expires: 1, 
    secure: window.location.protocol === 'https:',
    sameSite: 'strict'
  });
};

export const getAuthToken = (): string | null => {
  return Cookies.get(TOKEN_KEY) || null;
};

export const removeAuthToken = () => {
  Cookies.remove(TOKEN_KEY);
};

export default api;