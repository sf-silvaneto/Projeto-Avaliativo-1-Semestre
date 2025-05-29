export interface User {
  id: string;
  nome: string;
  email: string;
  cpf: string;
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
  cpf: string;
  senha: string;
  confirmarSenha: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  token: string;
  senha: string;
  confirmarSenha: string;
}

export interface UpdateProfileRequest {
  nome: string;
  email: string;
  cpf: string;
}