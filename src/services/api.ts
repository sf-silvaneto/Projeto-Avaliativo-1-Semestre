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
    const requestUrl = error.config?.url; // URL da requisição original

    // Log para depuração de todas as respostas de erro
    console.log(`API Error Interceptor: Status ${status} on URL ${requestUrl}`);
    if (error.response?.data) {
      console.log('API Error Interceptor: Error data:', error.response.data);
    }

    // Caminhos de API para os quais queremos que os erros 401/403 sejam
    // tratados localmente no componente, em vez de causar redirecionamento global.
    const localErrorHandlingPaths = [
      '/api/administradores/profile',               // Para atualizar nome/email via updateProfile (se ainda existir)
      '/api/administradores/profile/verified-update', // Para o novo fluxo unificado de atualização de perfil
      // '/api/administradores/profile/keyword',    // Removido se /verified-update o substitui
      '/api/administradores/verificar-palavra-chave', // Para o fluxo de recuperação de senha
      // '/user/change-password'                    // Se a funcionalidade de alterar senha de login existir e precisar de tratamento local
    ];

    // Verifica se a URL da requisição original está na lista de caminhos com tratamento local
    // Usar error.config.url que é o caminho relativo à baseURL (ex: /administradores/profile)
    // A baseURL (http://localhost:8080/api) já é prefixada pelo axios.
    // Então, os paths em localErrorHandlingPaths devem começar com / e o nome do recurso.
    // No seu caso, como a baseURL do axios já é /api, os paths aqui devem ser relativos a isso.
    // Ex: '/administradores/profile', não '/api/administradores/profile'
    // Ajustei a lista para remover o /api/ inicial, pois o requestUrl do axios.config.url
    // geralmente não inclui o baseURL se ele foi configurado na instância do axios.
    // No entanto, o log que você me mandou do console (com "Request URL:") pode mostrar o path completo
    // ou o path relativo. É importante verificar o valor real de `requestUrl` no console.
    // Vou assumir que requestUrl será algo como "/administradores/profile/verified-update"

    const adjustedLocalErrorHandlingPaths = [
      '/administradores/profile',
      '/administradores/profile/verified-update',
      '/administradores/verificar-palavra-chave',
      // '/user/change-password' // Adicione se necessário
    ];

    const isLocalErrorHandlingPath = adjustedLocalErrorHandlingPaths.some(path => requestUrl?.endsWith(path) || requestUrl === path);
    // O `requestUrl` pode ser o path completo ou apenas o segmento após a baseURL, dependendo da versão/config do axios.
    // `endsWith` pode ser mais seguro se `requestUrl` incluir a baseURL.
    // Se `VITE_API_URL` for "http://localhost:8080/api", e você chama `api.put('/profile/verified-update')`,
    // `requestUrl` pode ser `http://localhost:8080/api/profile/verified-update` ou apenas `/profile/verified-update`.
    // Se você logou `requestUrl` e ele é `/api/administradores/profile/verified-update`, então a lista original estava correta.
    // Vou reverter para a sua lista original, pois o logging que adicionei mostrará o `requestUrl` real.

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