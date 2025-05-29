import api, { setAuthToken, removeAuthToken } from './api';
import { LoginCredentials, RegisterCredentials, UpdatePasswordRequest, UpdateProfileRequest, User } from '../types/auth';

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData: RegisterCredentials) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  try {
    removeAuthToken();
    return true;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return false;
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get('/user/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (data: UpdateProfileRequest) => {
  try {
    const response = await api.put('/user/profile', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const requestPasswordReset = async (email: string) => {
  try {
    const response = await api.post('/auth/password-reset-request', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (data: UpdatePasswordRequest) => {
  try {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await api.post('/user/change-password', {
      senhaAtual: currentPassword,
      novaSenha: newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};