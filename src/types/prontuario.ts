export interface Prontuario {
  id: string;
  numeroProntuario: string;
  paciente: Paciente;
  tipoTratamento: TipoTratamento;
  dataInicio: string;
  dataUltimaAtualizacao: string;
  status: StatusProntuario;
  historicoMedico: HistoricoMedico[];
  medicacoes: Medicacao[];
  exames: Exame[];
  anotacoes: Anotacao[];
  createdAt: string;
  updatedAt: string;
}

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

export enum TipoTratamento {
  TERAPIA_INDIVIDUAL = 'TERAPIA_INDIVIDUAL',
  TERAPIA_CASAL = 'TERAPIA_CASAL',
  TERAPIA_GRUPO = 'TERAPIA_GRUPO',
  TERAPIA_FAMILIAR = 'TERAPIA_FAMILIAR',
  OUTRO = 'OUTRO'
}

export enum StatusProntuario {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
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

export interface Exame {
  id: string;
  nome: string;
  data: string;
  resultado: string;
  arquivo?: string;
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

export interface BuscaProntuarioParams {
  termo?: string;
  numeroProntuario?: string;
  nomePaciente?: string;
  tipoTratamento?: TipoTratamento;
  status?: StatusProntuario;
  pagina: number;
  tamanho: number;
}

export interface ResultadoBusca {
  content: Prontuario[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  }
}

export interface NovoProntuarioRequest {
  paciente: {
    nome: string;
    dataNascimento: string;
    cpf: string;
    genero: Genero;
    telefone: string;
    email: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
    }
  };
  tipoTratamento: TipoTratamento;
  historicoMedico: {
    descricao: string;
  };
}