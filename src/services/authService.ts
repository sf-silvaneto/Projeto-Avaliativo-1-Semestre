import api, { setAuthToken, removeAuthToken } from './api';
import {
  LoginCredentials,
  RegisterCredentials,
  // UpdatePasswordRequest, // Removida se não for mais usada pelo novo fluxo
  UpdateProfileRequest, // Mantida para referência, mas o fluxo principal usa VerifiedProfileUpdateRequest
  User,
  VerifyKeywordCredentials,      // Importando o tipo para verificação
  FinalResetPasswordCredentials,  // Importando o tipo para redefinição final
  VerifiedProfileUpdateRequest   // <<< ADICIONADO SE NÃO ESTIVER PRESENTE, MAS JÁ ESTAVA EM SEUS ARQUIVOS
} from '../types/auth';

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post('/administradores/login', credentials);

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

// Esta função updateProfile usa o endpoint PUT /api/administradores/profile
// que parece ter sido substituído no backend pelo endpoint /profile/verified-update.
// Se este endpoint antigo não existir mais no backend, esta função não funcionará como esperado.
export const updateProfile = async (data: UpdateProfileRequest) => {
  try {
    console.warn("authService.updateProfile está usando o endpoint PUT /api/administradores/profile que pode estar desatualizado. Considere usar updateVerifiedProfileDetails.");
    const response = await api.put('/administradores/profile', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// >>> INÍCIO DA MODIFICAÇÃO/ADIÇÃO <<<
// Nova função para o fluxo de atualização de perfil verificado
export const updateVerifiedProfileDetails = async (data: VerifiedProfileUpdateRequest): Promise<{ mensagem: string, adminData: User }> => {
  try {
    const response = await api.put<{ mensagem: string, adminData: User }>('/administradores/profile/verified-update', data);
    return response.data;
  } catch (error) {
    console.error("Erro em authService.updateVerifiedProfileDetails:", error);
    throw error;
  }
};
// >>> FIM DA MODIFICAÇÃO/ADIÇÃO <<<


// A função updateKeyword parece redundante se updateVerifiedProfileDetails
// já lida com a atualização da palavra-chave. Considere remover se não for usada.
/*
interface UpdateKeywordRequest { // Este tipo não estava definido nos arquivos originais, adicionando para referência se for manter a função
  palavraChaveAtual: string;
  novaPalavraChave: string;
}
export const updateKeyword = async (data: UpdateKeywordRequest): Promise<void> => {
  try {
    const response = await api.put('/administradores/profile/keyword', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
*/

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

// Esta função parece ser para um endpoint genérico /user/change-password que não existe no AdministradorController.
// Pode ser de uma funcionalidade diferente ou desatualizada.
export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await api.post('/user/change-password', { // Este endpoint não parece corresponder ao controller do admin.
      senhaAtual: currentPassword,
      novaSenha: newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};