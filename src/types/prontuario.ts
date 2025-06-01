// src/types/prontuario.ts

import { ConsultaDetalhada, InternacaoDetalhada } from './prontuarioRegistros';

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

// StatusProntuario ATUALIZADO
export enum StatusProntuario {
  EM_ELABORACAO = 'EM_ELABORACAO', // Status inicial antes do primeiro evento (opcional)
  INTERNADO = 'INTERNADO',
  ARQUIVADO = 'ARQUIVADO'
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

export interface AnexoSimples {
    id: string;
    nomeOriginalArquivo: string;
    urlVisualizacao?: string; 
    tipoConteudo?: string;
}

export interface Exame { 
  id: string;
  nome: string;
  data: string;
  resultado: string;
  arquivoUrl?: string; 
  anexos?: AnexoSimples[]; 
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
  status: StatusProntuario;
  
  historicoGeral?: HistoricoMedico[]; 
  consultas?: ConsultaDetalhada[]; 
  internacoes?: InternacaoDetalhada[]; 
  examesRegistrados?: Exame[]; 
  medicacoes?: Medicacao[]; 
  anotacoesGerais?: Anotacao[]; 

  createdAt: string; 
  updatedAt: string; 
  dataAltaAdministrativa?: string; 
}

export interface BuscaProntuarioParams {
  termo?: string;
  numeroProntuario?: string;
  status?: StatusProntuario | ''; 
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