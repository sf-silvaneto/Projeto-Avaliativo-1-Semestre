export interface Medico {
  id: number;
  nomeCompleto: string;
  crm: string;
  especialidade: string;
  resumoEspecialidade?: string;
  rqe?: string;
  deletedAt?: string; // Renomeado de excludedAt
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
  deletedAt?: string | null; // Renomeado de excludedAt
}

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
  status?: 'ATIVO' | 'INATIVO' | ''; 
  sort?: string;
}