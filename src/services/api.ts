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
    const originalRequestUrl = error.config?.url; // URL da requisição original

    // Caminho do endpoint de verificação de palavra-chave
    const verifyKeywordPath = '/administradores/verificar-palavra-chave';

    if (status === 401) {
      // SÓ redireciona para /login se NÃO for um erro 401 da verificação de palavra-chave
      if (originalRequestUrl !== verifyKeywordPath) {
        Cookies.remove(TOKEN_KEY);
        // Considerar usar navigate do react-router-dom aqui se o api.ts tiver acesso a ele,
        // em vez de window.location.href, para uma navegação mais SPA-friendly.
        // Mas window.location.href funciona.
        window.location.href = '/login?session=expired';
      }
    }

    if (status === 403) {
      // O mesmo pode ser aplicado aqui se houver cenários de 403 que não devem redirecionar
      window.location.href = '/sem-permissao';
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