export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterCredentials {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  palavraChave: string;
}

export interface VerifyKeywordCredentials {
  email: string;
  palavraChave: string;
}

export interface FinalResetPasswordCredentials {
  email: string;
  novaSenha: string;
  confirmarNovaSenha: string;
}

export interface UpdatePasswordRequest {
  token: string;
  senha: string;
  confirmarSenha: string;
}