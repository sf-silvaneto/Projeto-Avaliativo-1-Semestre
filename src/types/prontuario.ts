// sf-silvaneto/clientehm/ClienteHM-057824fed8786ee29c7b4f9a2010aca3a83abc37/cliente-hm-front-main/src/types/prontuario.ts

import { ConsultaDetalhada } from './prontuarioRegistros'; 

export interface Paciente {
  id: string;
  nome: string;
  dataNascimento: string;
  cpf: string;
  genero: Genero;
  telefone: string;
  email: string;
  endereco: Endereco;
  createdAt: string;
  updatedAt: string;
  alergiasDeclaradas?: string;
  comorbidadesDeclaradas?: string;
  medicamentosContinuos?: string;
}

export interface Medico {
  id: number;
  nomeCompleto: string;
  crm: string;
  especialidade: string;
}

export interface Endereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export enum Genero {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO',
  OUTRO = 'OUTRO',
  NAO_INFORMADO = 'NAO_INFORMADO'
}

export interface HistoricoMedico {
  id: string;
  data: string; 
  descricao: string;
  responsavel: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medicacao {
  id: string;
  nome: string;
  dosagem: string;
  frequencia: string;
  dataInicio: string;
  dataFim?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exame { 
  id: string;
  nome: string;
  data: string; 
  resultado: string;
  observacoes?: string;
  createdAt: string; 
  updatedAt: string;
}

export interface Anotacao {
  id: string;
  data: string;
  texto: string;
  responsavel: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prontuario {
  id: string; 
  numeroProntuario: string;
  paciente: Paciente;
  medicoResponsavel?: Medico; 
  administradorCriador?: { id: string; nome: string; email: string; }; 
  dataInicio: string; 
  dataUltimaAtualizacao: string; 
  
  historicoGeral?: HistoricoMedico[]; 
  consultas?: ConsultaDetalhada[]; 
  examesRegistrados?: Exame[]; 
  medicacoes?: Medicacao[]; 
  anotacoesGerais?: Anotacao[]; 

  createdAt: string; 
  updatedAt: string; 
}

export interface BuscaProntuarioParams {
  termo?: string;
  // numeroProntuario?: string; // REMOVIDO
  pagina: number;
  tamanho: number;
  sort?: string;
}

export interface ResultadoBuscaProntuarios { 
  content: Prontuario[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

export interface IniciarProntuarioRequest { 
    pacienteId: string;
    medicoId: number; 
}

export interface AdicionarHistoricoGeralRequest {
    descricao: string;
}