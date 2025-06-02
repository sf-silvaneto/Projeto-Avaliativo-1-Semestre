import {
  ConsultaDetalhada,
  ExameDetalhado,
  ProcedimentoDetalhado,
  EncaminhamentoDetalhado
} from './prontuarioRegistros';
import { Paciente as PacienteCompleto, Genero as PacienteGeneroEnum, Endereco as PacienteEndereco } from './paciente'; // Importando Paciente mais completo

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

export interface HistoricoMedico {
  id: string;
  data: string;
  descricao: string;
  responsavel: string;
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
  paciente: PacienteCompleto;
  medicoResponsavel?: Medico;
  administradorCriador?: { id: string; nome: string; email: string; };
  dataInicio: string;
  dataUltimaAtualizacao: string;

  historicoGeral?: HistoricoMedico[];
  consultas?: ConsultaDetalhada[];
  examesRegistrados?: ExameDetalhado[];
  procedimentosRegistrados?: ProcedimentoDetalhado[];
  encaminhamentosRegistrados?: EncaminhamentoDetalhado[];

  createdAt: string;
  updatedAt: string;
}

export interface BuscaProntuarioParams {
  termo?: string;
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