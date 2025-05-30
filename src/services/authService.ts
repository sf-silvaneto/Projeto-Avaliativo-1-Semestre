import api, { setAuthToken, removeAuthToken } from './api';
import { 
  LoginCredentials, 
  RegisterCredentials, 
  // UpdatePasswordRequest, // Removida se não for mais usada pelo novo fluxo
  UpdateProfileRequest, 
  User,
  VerifyKeywordCredentials,      // Importando o tipo para verificação
  FinalResetPasswordCredentials  // Importando o tipo para redefinição final
} from '../types/auth';

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post('/administradores/login', credentials);
    
    // A lógica de chamar setAuthToken aqui ou no AuthContext pode ser discutida.
    // Se o AuthContext chama getCurrentUser após o login, o token precisa ser setado antes.
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    
    return response.data; // Retorna { token, nome, email, mensagem }
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
    removeAuthToken(); // Remove o token do cookie
    return true;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return false;
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    // Garanta que o backend tenha um endpoint GET /api/administradores/me
    // que retorne um objeto compatível com a interface User.
    const response = await api.get('/administradores/me');
    // Se o backend retorna { ..., adminData: { id, nome, ... } }, use response.data.adminData
    // Se retorna o objeto User diretamente, use response.data
    return response.data.adminData || response.data; 
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (data: UpdateProfileRequest) => {
  try {
    // Garanta que o backend tenha um endpoint PUT /api/administradores/profile
    const response = await api.put('/administradores/profile', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateKeyword = async (data: UpdateKeywordRequest): Promise<void> => { // Pode retornar User se o backend o fizer
  try {
    // Você precisará criar este endpoint no backend:
    const response = await api.put('/administradores/profile/keyword', data);
    return response.data; // Ou apenas retornar void se o backend não devolver dados do usuário
  } catch (error) {
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