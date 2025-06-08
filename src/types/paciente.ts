// src/types/paciente.ts
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

// Novas interfaces para as coleções
export interface Alergia {
  id?: number; // Opcional para novos itens, para items existentes terá um ID do backend
  descricao: string;
}

export interface Comorbidade {
  id?: number; // Opcional para novos itens
  descricao: string;
}

export interface MedicamentoContinuo {
  id?: number; // Opcional para novos itens
  descricao: string;
}

export interface Paciente {
  id: string;
  nome: string;
  dataNascimento: string;
  cpf: string;
  rg?: string;
  genero: Genero;
  telefone: string;
  email: string;
  nomeMae: string;
  nomePai?: string;
  dataEntrada: string;
  cartaoSus?: string;
  racaCor?: RacaCor;
  tipoSanguineo?: TipoSanguineo;
  nacionalidade?: string;
  ocupacao?: string;
  endereco: Endereco;
  createdAt: string;
  updatedAt: string;
  // Remova os campos string individuais
  // alergiasDeclaradas?: string;
  // comorbidadesDeclaradas?: string;
  // medicamentosContinuos?: string;

  // Adicione as listas das novas interfaces
  alergias?: Alergia[];
  comorbidades?: Comorbidade[];
  medicamentosContinuos?: MedicamentoContinuo[];
}

// Atualize PacienteFormData para refletir as novas listas no formulário
export interface PacienteFormData {
  nome: string;
  dataNascimento: string;
  cpf: string;
  rg?: string;
  genero: Genero;
  telefone: string;
  email: string;
  nomeMae: string;
  nomePai?: string;
  dataEntrada?: string;
  cartaoSus?: string;
  racaCor?: RacaCor | '';
  tipoSanguineo?: TipoSanguineo | '';
  nacionalidade?: string;
  ocupacao?: string;
  
  // Remova as flags de 'sim'/'nao'
  // temAlergias?: 'sim' | 'nao';
  // temComorbidades?: 'sim' | 'nao';
  // usaMedicamentos?: 'sim' | 'nao';

  // Adicione as listas de DTOs para o formulário (campos do useFieldArray)
  alergias: { id?: number; descricao: string; }[];
  comorbidades: { id?: number; descricao: string; }[];
  medicamentosContinuos: { id?: number; descricao: string; }[];

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

export type PacienteCreateDTO = PacienteFormData;
export type PacienteUpdateDTO = Partial<Omit<PacienteFormData, 'alergias' | 'comorbidades' | 'medicamentosContinuos'>> & {
  alergias?: Alergia[];
  comorbidades?: Comorbidade[];
  medicamentosContinuos?: MedicamentoContinuo[];
};


export interface ResultadoBuscaPacientes {
  content: Paciente[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

export interface BuscaPacienteParams {
  pagina?: number;
  tamanho?: number;
  nome?: string;
  cpf?: string;
  sort?: string;
}