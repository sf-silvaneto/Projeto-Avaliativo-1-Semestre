// Reutilizando e estendendo o Genero de prontuario.ts se aplicável ou definindo aqui
// import { Genero as GeneroProntuario, Endereco as EnderecoProntuario } from './prontuario';

// Se Genero, RacaCor, TipoSanguineo não estiverem em prontuario.ts, defina-os aqui
export enum Genero {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO',
  OUTRO = 'OUTRO',
  NAO_INFORMADO = 'NAO_INFORMADO'
}

export enum RacaCor {
  BRANCA = 'BRANCA',
  PRETA = 'PRETA',
  PARDA = 'PARDA',
  AMARELA = 'AMARELA',
  INDIGENA = 'INDIGENA',
  NAO_DECLARADO = 'NAO_DECLARADO'
}

export enum TipoSanguineo {
  A_POSITIVO = 'A_POSITIVO', A_NEGATIVO = 'A_NEGATIVO',
  B_POSITIVO = 'B_POSITIVO', B_NEGATIVO = 'B_NEGATIVO',
  AB_POSITIVO = 'AB_POSITIVO', AB_NEGATIVO = 'AB_NEGATIVO',
  O_POSITIVO = 'O_POSITIVO', O_NEGATIVO = 'O_NEGATIVO',
  NAO_SABE = 'NAO_SABE', NAO_INFORMADO = 'NAO_INFORMADO'
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

export interface Paciente {
  id: string; // Ou number, dependendo do backend (Long vira string ou number no JSON)
  nome: string;
  dataNascimento: string; // "AAAA-MM-DD"
  cpf: string;
  rg?: string;
  genero: Genero;
  telefone: string;
  email: string;
  nomeMae: string;
  nomePai?: string;
  dataEntrada: string; // "AAAA-MM-DD"
  cartaoSus?: string;
  racaCor?: RacaCor;
  tipoSanguineo?: TipoSanguineo;
  nacionalidade?: string;
  ocupacao?: string;
  endereco: Endereco;
  createdAt: string; // "AAAA-MM-DDTHH:mm:ss"
  updatedAt: string; // "AAAA-MM-DDTHH:mm:ss"
}

export interface PacienteFormData { // Para formulários de criação/edição
  nome: string;
  dataNascimento: string;
  cpf: string;
  rg?: string;
  genero: Genero;
  telefone: string;
  email: string;
  nomeMae: string;
  nomePai?: string;
  dataEntrada?: string; // Pode ser opcional no form e default no backend
  cartaoSus?: string;
  racaCor?: RacaCor | ''; // Permitir string vazia para selects não selecionados
  tipoSanguineo?: TipoSanguineo | ''; // Permitir string vazia
  nacionalidade?: string;
  ocupacao?: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

// DTO para criar (payload para o POST)
export type PacienteCreateDTO = PacienteFormData;

// DTO para atualizar (payload para o PUT, todos os campos de PacienteFormData são opcionais)
export type PacienteUpdateDTO = Partial<PacienteFormData>;

// Para paginação de pacientes
export interface ResultadoBuscaPacientes {
  content: Paciente[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

// Parâmetros para busca e filtragem de pacientes
export interface BuscaPacienteParams {
  pagina?: number;
  tamanho?: number;
  nome?: string;
  cpf?: string;
  // Adicionar outros filtros conforme necessidade
  sort?: string; // Ex: "nome,asc"
}