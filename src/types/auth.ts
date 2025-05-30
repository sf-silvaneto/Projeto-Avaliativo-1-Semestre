export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string; // Mantenha se o backend enviar via /me ou após atualizações
  updatedAt: string; // Mantenha se o backend enviar via /me ou após atualizações
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

// DTO para a aba "Dados Pessoais" original (se você ainda a usar ou para referência)
// Foi solicitado remover a aba de alterar senha de login,
// e integrar nome/email com a verificação de palavra-chave.
// Esta interface UpdateProfileRequest será para o endpoint que atualiza nome/email
// e pode ser chamada APÓS a verificação da palavra-chave, ou diretamente se a
// verificação de palavra-chave não for um pré-requisito para nome/email.
// Com a nova lógica, esta pode não ser mais necessária se tudo for feito pelo VerifiedProfileUpdateRequest.
// Vamos manter a versão que atualiza nome e email, usada pelo updateProfile do serviço.
export interface UpdateProfileRequest {
  nome: string;
  email: string;
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

// Interface para a requisição de atualização de perfil APÓS verificação da palavra-chave
export interface VerifiedProfileUpdateRequest {
  nome?: string;
  email?: string;
  novaPalavraChave?: string;
}

// Interface para o fluxo de alterar senha de login (que foi removido do ProfilePage)
// Se esta funcionalidade for movida para outro lugar, esta interface ainda pode ser útil.
// Por agora, como foi removida do ProfilePage, ela não é diretamente usada lá.
export interface UpdatePasswordRequest {
  senhaAtual: string;
  novaSenha: string; // Renomeado de 'senha' para clareza
  confirmarSenha: string;
}