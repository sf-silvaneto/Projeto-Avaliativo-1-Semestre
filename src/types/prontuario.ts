export interface Prontuario {
  id: string;
  numeroProntuario: string;
  paciente: Paciente; // Mantém a estrutura completa para exibição
  medicoResponsavel?: Medico; // Adicionado para exibir o médico responsável
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
  dataAlta?: string; // Adicionada data de alta opcional
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

// Adicionada interface Medico simplificada para uso no Prontuario
// Se já existir uma interface Medico em `src/types/medico.ts` com esses campos,
// você pode importá-la em vez de redeclarar aqui.
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
  ARQUIVADO = 'ARQUIVADO',
  ALTA = 'ALTA' // Adicionado status ALTA, se fizer sentido para o seu fluxo
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
  arquivo?: string; // URL do arquivo, se houver
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

// Alergia (Nova interface, se for gerenciada por prontuário/paciente)
// Se alergias são informações do PACIENTE e não do prontuário específico,
// esta interface deveria estar em `src/types/paciente.ts`.
export interface Alergia {
  id: string;
  descricao: string;
  // outros campos como data_descoberta, severidade, se necessário
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

// NovoProntuarioRequest MODIFICADO
export interface NovoProntuarioRequest {
  pacienteId: string; // Ou number, dependendo do tipo do ID do PacienteEntity no backend
  medicoId: number;   // ID do médico responsável selecionado
  tipoTratamento: TipoTratamento;
  historicoMedico: {
    descricao: string;
  };
}