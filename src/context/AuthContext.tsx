import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  UpdateProfileRequest,
  User,
} from '../types/auth';
import * as authService from '../services/authService';
import { getAuthToken, removeAuthToken as removeTokenFromCookie } from '../services/api';

const defaultAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  clearError: () => void;
  verifyEmailAndKeyword: typeof authService.verifyEmailAndKeyword;
  resetPasswordAfterVerification: typeof authService.resetPasswordAfterVerification;
  setAuthUserData: (userData: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(defaultAuthState);

  useEffect(() => {
    const initAuth = async () => {
      console.log("AuthContext: initAuth - Verificando token inicial...");
      const token = getAuthToken();
      if (token) {
        console.log("AuthContext: initAuth - Token encontrado:", token);
        try {
          const user = await authService.getCurrentUser();
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
          removeTokenFromCookie();
          setState({
            ...defaultAuthState,
            isLoading: false,
          });
        }
      } else {
        console.log("AuthContext: initAuth - Nenhum token encontrado.");
        setState({
          ...defaultAuthState,
          isLoading: false,
        });
      }
    };
    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    console.log("AuthContext: login - Tentando login com:", credentials.email);
    try {
      const loginResponse = await authService.login(credentials);
      console.log("AuthContext: login - Resposta do backend (authService.login):", loginResponse);

      if (loginResponse && loginResponse.token) {
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
        ...prevState,
        ...defaultAuthState,
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
      await authService.register(userData);
      console.log("AuthContext: register - Registro bem-sucedido. Usuário deve fazer login manualmente.");
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: null,
      }));
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
    authService.logout();
    setState({
      ...defaultAuthState,
      isLoading: false,
    });
    console.log("AuthContext: logout - Estado resetado para defaultAuthState.");
  };

  const setAuthUserData = (newUserData: User | null) => {
    setState(prevState => ({
      ...prevState,
      user: newUserData,
      isAuthenticated: !!newUserData,
      isLoading: false, 
      error: null,     
    }));
    if (newUserData) {
        console.log("AuthContext: setAuthUserData - Dados do usuário atualizados no contexto:", newUserData);
    } else {
        console.log("AuthContext: setAuthUserData - Usuário removido do contexto (logout ou erro).");
    }
  };
  const updateProfile = async (data: UpdateProfileRequest) => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    try {
      const updatedUserResponse = await authService.updateProfile(data);
      const userToUpdate = updatedUserResponse.adminData || updatedUserResponse;

      console.log("AuthContext: updateProfile (LEGADO/PROBLEMÁTICO) - Perfil atualizado:", userToUpdate);
      setState(prevState => ({
        ...prevState,
        user: userToUpdate,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("AuthContext: updateProfile (LEGADO/PROBLEMÁTICO) - Falha ao atualizar perfil:", error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error.response?.data?.mensagem || error.response?.data?.message || 'Erro ao atualizar perfil (legado)',
      }));
      throw error;
    }
  };


  const clearError = () => {
    setState(prevState => ({ ...prevState, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    verifyEmailAndKeyword: authService.verifyEmailAndKeyword,
    resetPasswordAfterVerification: authService.resetPasswordAfterVerification,
    setAuthUserData,
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