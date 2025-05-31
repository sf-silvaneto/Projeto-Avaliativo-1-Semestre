export enum StatusMedico {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

export interface Medico {
  id: number;
  nomeCompleto: string;
  crm: string;
  especialidade: string;
  resumoEspecialidade?: string;
  rqe?: string;
  status: StatusMedico;
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
  status?: StatusMedico;
}

export interface MedicoStatusUpdateDTO {
  status: StatusMedico;
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
  status?: StatusMedico;
  sort?: string;
}