export interface Prontuario {
  id: string;
  numeroProntuario: string;
  paciente: Paciente;
  medicoResponsavel?: Medico;
  // tipoTratamento: TipoTratamento; // REMOVIDO
  dataInicio: string;
  dataUltimaAtualizacao: string;
  status: StatusProntuario;
  historicoMedico: HistoricoMedico[];
  medicacoes: Medicacao[];
  exames: Exame[];
  anotacoes: Anotacao[];
  createdAt: string;
  updatedAt: string;
  dataAlta?: string;
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

// export enum TipoTratamento { // REMOVIDO
//   TERAPIA_INDIVIDUAL = 'TERAPIA_INDIVIDUAL',
//   TERAPIA_CASAL = 'TERAPIA_CASAL',
//   TERAPIA_GRUPO = 'TERAPIA_GRUPO',
//   TERAPIA_FAMILIAR = 'TERAPIA_FAMILIAR',
//   OUTRO = 'OUTRO'
// }

export enum StatusProntuario {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  ARQUIVADO = 'ARQUIVADO',
  ALTA = 'ALTA'
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

export interface Alergia {
  id: string;
  descricao: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuscaProntuarioParams {
  termo?: string;
  numeroProntuario?: string;
  nomePaciente?: string;
  status?: StatusProntuario;
  pagina: number;
  tamanho: number;
  sort?: string;
}

export interface ResultadoBusca {
  content: Prontuario[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

export interface NovoProntuarioRequest {
  pacienteId: string;
  medicoId: number;
  // tipoTratamento: TipoTratamento; // REMOVIDO
  historicoMedico: {
    descricao: string;
  };
}