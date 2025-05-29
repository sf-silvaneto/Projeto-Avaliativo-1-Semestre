import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthState, LoginCredentials, RegisterCredentials, UpdatePasswordRequest, UpdateProfileRequest, User } from '../types/auth';
import * as authService from '../services/authService';
import { getAuthToken } from '../services/api';

// Default auth state
const defaultAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Create context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  resetPassword: (data: UpdatePasswordRequest) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(defaultAuthState);

  // Check if user is already authenticated
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Failed to get current user:', error);
          setState({
            ...defaultAuthState,
            isLoading: false,
          });
        }
      } else {
        setState({
          ...defaultAuthState,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  // Login
  const login = async (credentials: LoginCredentials) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      const { user, token } = await authService.login(credentials);
      
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        ...state,
        isLoading: false,
        error: error.response?.data?.message || 'Erro ao fazer login',
      });
      throw error;
    }
  };

  // Register
  const register = async (userData: RegisterCredentials) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      await authService.register(userData);
      
      // After registration, login with the new credentials
      await login({
        email: userData.email,
        senha: userData.senha,
      });
    } catch (error: any) {
      setState({
        ...state,
        isLoading: false,
        error: error.response?.data?.message || 'Erro ao cadastrar',
      });
      throw error;
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setState({
      ...defaultAuthState,
      isLoading: false,
    });
  };

  // Update profile
  const updateProfile = async (data: UpdateProfileRequest) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      const updatedUser = await authService.updateProfile(data);
      
      setState({
        ...state,
        user: updatedUser,
        isLoading: false,
      });
    } catch (error: any) {
      setState({
        ...state,
        isLoading: false,
        error: error.response?.data?.message || 'Erro ao atualizar perfil',
      });
      throw error;
    }
  };

  // Request password reset
  const requestPasswordReset = async (email: string) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      await authService.requestPasswordReset(email);
      setState({ ...state, isLoading: false });
    } catch (error: any) {
      setState({
        ...state,
        isLoading: false,
        error: error.response?.data?.message || 'Erro ao solicitar redefinição de senha',
      });
      throw error;
    }
  };

  // Reset password with token
  const resetPassword = async (data: UpdatePasswordRequest) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      await authService.resetPassword(data);
      setState({ ...state, isLoading: false });
    } catch (error: any) {
      setState({
        ...state,
        isLoading: false,
        error: error.response?.data?.message || 'Erro ao redefinir senha',
      });
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    setState({ ...state, error: null });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    requestPasswordReset,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};