// sf-silvaneto/clientehm/ClienteHM-41ecd4803ba7d3cbda97c9d43527665950953ffb/cliente-hm-front-main/src/types/prontuario.ts

import {
  ConsultaDetalhada,
  ExameDetalhado,
  ProcedimentoDetalhado,
  EncaminhamentoDetalhado
} from './prontuarioRegistros';
import { Paciente as PacienteCompleto, Genero as PacienteGeneroEnum, Endereco as PacienteEndereco } from './paciente'; // Importando Paciente mais completo

// Medico e Endereco podem ser definidos localmente se forem mais simples ou importados se houver definições mais completas.
// Para este exemplo, manteremos as definições locais que você já tinha,
// mas o Paciente será o PacienteCompleto.

export interface Medico {
  id: number;
  nomeCompleto: string;
  crm: string;
  especialidade: string;
}

export interface Endereco { // Este Endereco é usado pelo PacienteCompleto, então está OK.
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

// Genero local (usado por PacienteCompleto, mas PacienteCompleto tem seu próprio Enum Genero)
// Se PacienteCompleto já importa e usa seu próprio Genero, este pode ser redundante aqui.
// Vamos assumir que PacienteCompleto usa o Genero de 'paciente.ts'.
// export enum Genero {
//   MASCULINO = 'MASCULINO',
//   FEMININO = 'FEMININO',
//   OUTRO = 'OUTRO',
//   NAO_INFORMADO = 'NAO_INFORMADO'
// }

export interface HistoricoMedico {
  id: string;
  data: string;
  descricao: string;
  responsavel: string;
  createdAt: string;
  updatedAt: string;
}

// A interface 'Exame' abaixo é o tipo simples.
// Para a lista de exames no prontuário, usaremos ExameDetalhado de prontuarioRegistros.ts
export interface Exame { // Este é o Exame simples, não o ExameDetalhado.
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
  paciente: PacienteCompleto; // Alterado para usar o tipo Paciente mais completo
  medicoResponsavel?: Medico;
  administradorCriador?: { id: string; nome: string; email: string; }; // Backend DTO usa Long para ID
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
    pacienteId: string; // No frontend, IDs de paciente são strings (UUID)
    medicoId: number;
}

export interface AdicionarHistoricoGeralRequest {
    descricao: string;
}