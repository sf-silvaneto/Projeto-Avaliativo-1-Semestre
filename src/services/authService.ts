import api, { setAuthToken, removeAuthToken } from './api';
import {
  LoginCredentials,
  RegisterCredentials,
  UpdateProfileRequest,
  User,
  VerifyKeywordCredentials,
  FinalResetPasswordCredentials,
  VerifiedProfileUpdateRequest
} from '../types/auth';

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post('/administradores/login', credentials);

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
    const response = await api.post('/administradores/registrar', userData);
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
    const response = await api.get('/administradores/me');
    return response.data.adminData || response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (data: UpdateProfileRequest) => {
  try {
    console.warn("authService.updateProfile está usando o endpoint PUT /api/administradores/profile que pode estar desatualizado. Considere usar updateVerifiedProfileDetails.");
    const response = await api.put('/administradores/profile', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateVerifiedProfileDetails = async (data: VerifiedProfileUpdateRequest): Promise<{ mensagem: string, adminData: User }> => {
  try {
    const response = await api.put<{ mensagem: string, adminData: User }>('/administradores/profile/verified-update', data);
    return response.data;
  } catch (error) {
    console.error("Erro em authService.updateVerifiedProfileDetails:", error);
    throw error;
  }
};

export const verifyEmailAndKeyword = async (credentials: VerifyKeywordCredentials) => {
  try {
    const response = await api.post('/administradores/verificar-palavra-chave', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPasswordAfterVerification = async (data: FinalResetPasswordCredentials) => {
  try {
    const payload = { email: data.email, novaSenha: data.novaSenha };
    const response = await api.put('/administradores/redefinir-senha', payload);
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