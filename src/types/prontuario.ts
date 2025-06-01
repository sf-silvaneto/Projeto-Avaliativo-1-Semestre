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
  // Campos adicionais que podem ser úteis para exibir no contexto do prontuário
  alergiasDeclaradas?: string;
  comorbidadesDeclaradas?: string;
  medicamentosContinuos?: string;
}

export interface Medico {
  id: number; // No seu Medico.ts, o ID é number
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
  ALTA = 'ALTA'
}

export interface HistoricoMedico {
  id: string;
  data: string; // Mantido como string, assumindo que vem como ISO e é formatado no frontend
  descricao: string;
  responsavel: string; // Nome do responsável
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

// AnexoSimples é usado em prontuarioRegistros.ts, definindo aqui para centralizar se necessário
export interface AnexoSimples {
    id: string; // ou number
    nomeOriginalArquivo: string;
    urlVisualizacao?: string; // URL para visualização/download
    tipoConteudo?: string;
}

export interface Exame {
  id: string;
  nome: string;
  data: string;
  resultado: string;
  arquivoUrl?: string; // Mantido como no seu DTO, o frontend pode ter usado 'arquivo' para File
  anexos?: AnexoSimples[]; // Para consistência com outros registros que podem ter anexos
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Anotacao {
  id: string;
  data: string; // Mantido como string
  texto: string;
  responsavel: string; // Nome do responsável
  createdAt: string;
  updatedAt: string;
}

export interface Alergia {
  id: string;
  descricao: string;
  createdAt: string;
  updatedAt: string;
}

// Parâmetros para busca de prontuários - tipoTratamento REMOVIDO
export interface BuscaProntuarioParams {
  termo?: string; // Busca geral por nome do paciente, CPF, ou número do prontuário
  numeroProntuario?: string;
  nomePaciente?: string; // Se quiser um filtro específico para nome do paciente
  // tipoTratamento?: TipoTratamento; // REMOVIDO CONFORME SOLICITAÇÃO
  status?: StatusProntuario;
  pagina: number;
  tamanho: number;
  // Adicionar outros campos de ordenação se necessário, ex: sort?: string (ex: "paciente.nome,asc")
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

// DTO para criar um novo prontuário (request para o backend)
// Mantido como estava no seu arquivo original
export interface NovoProntuarioRequest {
  pacienteId: string; 
  medicoId: number;
  tipoTratamento: TipoTratamento;
  historicoMedico: { // Simplificado para o histórico inicial
    descricao: string;
  };
  // Não incluir paciente: PacienteRequestDTO; aqui se o paciente deve ser pré-existente
}

// Se você tiver um PacienteRequestDTO para criar um paciente junto com o prontuário (opcional)
// export interface PacienteRequestDTO {
//   nome: string;
//   dataNascimento: string;
//   cpf: string;
//   genero: Genero;
//   telefone: string;
//   email: string;
//   endereco: Endereco;
// }