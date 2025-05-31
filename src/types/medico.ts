// src/types/medico.ts

export enum StatusMedico {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

export interface Medico {
  id: number; // Corrigido para number se o backend usa Long/long
  nomeCompleto: string;
  crm: string;
  especialidade: string;
  resumoEspecialidade?: string; // Marcar como opcional se pode ser nulo/vazio
  rqe?: string; // Marcar como opcional
  status: StatusMedico;
  createdAt: string; // Ou Date, dependendo de como você vai formatar
  updatedAt: string; // Ou Date
}

// DTO para criar um novo médico (payload para o POST)
export interface MedicoCreateDTO {
  nomeCompleto: string;
  crm: string;
  especialidade: string;
  resumoEspecialidade?: string;
  rqe?: string;
  // status é definido no backend como ATIVO por padrão
}

// DTO para atualizar um médico (payload para o PUT)
export interface MedicoUpdateDTO {
  nomeCompleto?: string;
  crm?: string; // Geralmente não se atualiza CRM, mas incluído por completude do DTO backend
  especialidade?: string;
  resumoEspecialidade?: string;
  rqe?: string;
  status?: StatusMedico; // Para permitir a atualização de status através do PUT geral
}

// DTO para atualizar apenas o status (payload para o PATCH)
export interface MedicoStatusUpdateDTO {
  status: StatusMedico;
}

// Para paginação de médicos
export interface ResultadoBuscaMedicos {
  content: Medico[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
  // Adicione outros campos de paginação se o backend os retornar
}

// Parâmetros para busca e filtragem de médicos
export interface BuscaMedicoParams {
  pagina?: number;
  tamanho?: number;
  nome?: string;
  crm?: string; // Adicionado para filtro
  especialidade?: string; // Adicionado para filtro
  status?: StatusMedico;
  sort?: string; // Ex: "nomeCompleto,asc"
}