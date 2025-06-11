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

export interface Alergia {
  id?: number;
  descricao: string;
}

export interface Comorbidade {
  id?: number;
  descricao: string;
}

export interface MedicamentoContinuo {
  id?: number;
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
  cartaoSus?: string;
  racaCor?: RacaCor;
  tipoSanguineo?: TipoSanguineo;
  nacionalidade?: string;
  ocupacao?: string;
  endereco: Endereco;
  createdAt: string;
  updatedAt: string;
  alergias?: Alergia[];
  comorbidades?: Comorbidade[];
  medicamentosContinuos?: MedicamentoContinuo[];
}

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
  cartaoSus?: string;
  racaCor?: RacaCor | '';
  tipoSanguineo?: TipoSanguineo | '';
  nacionalidade?: string;
  ocupacao?: string;
  
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
export type PacienteUpdateDTO = Partial<Omit<PacienteFormData, 'alergias' | 'comorbidades' | 'medicamentosContinuos' | 'dataEntrada'>> & {
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