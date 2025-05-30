import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials, 
  // UpdatePasswordRequest, // Se o fluxo antigo de reset com token na URL foi removido de authService
  UpdateProfileRequest, 
  User,
  // Os tipos para o novo fluxo de recuperação de senha não são diretamente usados aqui,
  // mas as funções de authService que os usam serão expostas.
  // VerifyKeywordCredentials,
  // FinalResetPasswordCredentials
} from '../types/auth';
import * as authService from '../services/authService';
// Importar explicitamente as funções de manipulação de token do api.ts para clareza
import { getAuthToken, setAuthToken as storeTokenInCookie, removeAuthToken as removeTokenFromCookie } from '../services/api';

// Estado de autenticação padrão
const defaultAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Começa true para verificar o estado inicial de autenticação
  error: null,
};

// Tipagem para o contexto
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterCredentials) => Promise<void>; // Não fará login automático
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  clearError: () => void;
  // Expor as novas funções de recuperação de senha do authService
  verifyEmailAndKeyword: typeof authService.verifyEmailAndKeyword;
  resetPasswordAfterVerification: typeof authService.resetPasswordAfterVerification;
  // Se a antiga requestPasswordReset (que só envia email) e resetPassword (com token URL)
  // foram removidas ou renomeadas em authService.ts, remova-as daqui também.
  // requestPasswordReset: (email: string) => Promise<void>; 
  // resetPassword: (data: UpdatePasswordRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(defaultAuthState);

  // Verifica se o usuário já está autenticado ao carregar a aplicação
  useEffect(() => {
    const initAuth = async () => {
      console.log("AuthContext: initAuth - Verificando token inicial...");
      const token = getAuthToken(); 
      if (token) {
        console.log("AuthContext: initAuth - Token encontrado:", token);
        // Se um token existe, o interceptor do Axios já o usará.
        try {
          const user = await authService.getCurrentUser(); // Chama GET /api/administradores/me
          console.log("AuthContext: initAuth - Usuário recuperado:", user);
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('AuthContext: initAuth - Falha ao buscar usuário atual, limpando token:', error);
          removeTokenFromCookie(); // Limpa token inválido/expirado
          setState({
            ...defaultAuthState,
            isLoading: false, // Finaliza o carregamento
          });
        }
      } else {
        console.log("AuthContext: initAuth - Nenhum token encontrado.");
        setState({
          ...defaultAuthState,
          isLoading: false, // Finaliza o carregamento
        });
      }
    };
    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    console.log("AuthContext: login - Tentando login com:", credentials.email);
    try {
      const loginResponse = await authService.login(credentials); // authService.login já chama setAuthToken
      console.log("AuthContext: login - Resposta do backend (authService.login):", loginResponse);

      if (loginResponse && loginResponse.token) {
        // setAuthToken já foi chamado dentro de authService.login
        // Agora, buscar os dados completos do usuário
        const currentUser = await authService.getCurrentUser();
        console.log("AuthContext: login - Usuário atual recuperado após login:", currentUser);
        
        setState({
          user: currentUser,
          token: loginResponse.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        console.log("AuthContext: login - Estado atualizado, isAuthenticated: true");
      } else {
        console.error("AuthContext: login - Token não encontrado na resposta do backend.");
        throw new Error("Token não recebido do backend após login.");
      }
    } catch (error: any) {
      console.error("AuthContext: login - Falha no processo de login:", error);
      removeTokenFromCookie(); 
      setState(prevState => ({
        ...prevState, // Mantém outros estados se houver
        ...defaultAuthState, // Reseta user, token, isAuthenticated
        isLoading: false,
        error: error.response?.data?.mensagem || error.response?.data?.message || error.message || 'Erro ao fazer login',
      }));
      throw error;
    }
  };

  const register = async (userData: RegisterCredentials) => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    console.log("AuthContext: register - Tentando registrar usuário:", userData.email);
    try {
      await authService.register(userData); // Apenas registra, não faz login
      console.log("AuthContext: register - Registro bem-sucedido. Usuário deve fazer login manualmente.");
      
      // Não faz login automático. RegisterPage.tsx irá redirecionar para /login.
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: null, // Limpa qualquer erro anterior
        // O estado de autenticação (user, token, isAuthenticated) NÃO é alterado aqui.
      }));
      // Não precisa retornar nada ou pode retornar Promise<void>
    } catch (error: any) {
      console.error("AuthContext: register - Falha no processo de registro:", error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error.response?.data?.mensagem || error.response?.data?.message || error.message || 'Erro ao cadastrar',
      }));
      throw error;
    }
  };
  
  const logout = () => {
    console.log("AuthContext: logout - Deslogando usuário.");
    authService.logout(); // authService.logout() chama removeTokenFromCookie()
    setState({
      ...defaultAuthState,
      isLoading: false,
    });
    console.log("AuthContext: logout - Estado resetado para defaultAuthState.");
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    try {
      const updatedUser = await authService.updateProfile(data);
      console.log("AuthContext: updateProfile - Perfil atualizado:", updatedUser);
      setState(prevState => ({
        ...prevState,
        user: updatedUser, // Atualiza o usuário no estado
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("AuthContext: updateProfile - Falha ao atualizar perfil:", error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error.response?.data?.mensagem || error.response?.data?.message || 'Erro ao atualizar perfil',
      }));
      throw error;
    }
  };

  const clearError = () => {
    setState(prevState => ({ ...prevState, error: null }));
  };

  // As funções de recuperação de senha do authService são passadas diretamente
  // pois não manipulam o estado global do AuthContext diretamente,
  // a página ResetPasswordPage.tsx gerencia seus próprios estados de loading/error.
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    verifyEmailAndKeyword: authService.verifyEmailAndKeyword,
    resetPasswordAfterVerification: authService.resetPasswordAfterVerification,
    // Se as funções abaixo foram removidas de authService.ts, remova-as daqui também:
    // requestPasswordReset: authService.requestPasswordReset, 
    // resetPassword: authService.resetPassword 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};