// src/types/medico.ts
// Remova o enum StatusMedico
// export enum StatusMedico {
//   ATIVO = 'ATIVO',
//   INATIVO = 'INATIVO',
// }

export interface Medico {
  id: number;
  nomeCompleto: string;
  crm: string;
  especialidade: string;
  resumoEspecialidade?: string;
  rqe?: string;
  // Remova o campo status
  // status: StatusMedico;
  excludedAt?: string; // Novo campo: data e hora de inativação (se houver)
  createdAt: string;
  updatedAt: string;
}

export interface MedicoCreateDTO {
  nomeCompleto: string;
  crm: string;
  especialidade: string;
  resumoEspecialidade?: string;
  rqe?: string;
}

export interface MedicoUpdateDTO {
  nomeCompleto?: string;
  crm?: string;
  especialidade?: string;
  resumoEspecialidade?: string;
  rqe?: string;
  // Remova o campo status
  // status?: StatusMedico;
  excludedAt?: string | null; // Pode ser null para reativar
}

// Este DTO não será mais usado, pois a ativação/inativação será por PATCH /ativar ou /inativar
// export interface MedicoStatusUpdateDTO {
//   status: StatusMedico;
// }

export interface ResultadoBuscaMedicos {
  content: Medico[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

export interface BuscaMedicoParams {
  pagina?: number;
  tamanho?: number;
  nome?: string;
  crm?: string;
  especialidade?: string;
  // O status aqui agora pode ser 'ATIVO', 'INATIVO' ou vazio
  status?: 'ATIVO' | 'INATIVO' | ''; 
  sort?: string;
}