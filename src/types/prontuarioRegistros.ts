// src/types/prontuarioRegistros.ts

export interface AnexoDetalhado {
  id: string;
  nomeOriginalArquivo: string;
  nomeArquivoArmazenado: string;
  tipoConteudo: string;
  tamanhoBytes?: number;
  dataUpload?: string; // ISOString
  urlVisualizacao?: string; 
}

// --- Consulta (Adaptado de Entrada Médica) ---
export interface NovaConsultaRequest {
  dataHoraConsulta: string; // ISOString (ex: "2024-05-31T14:30:00")
  motivoConsulta: string; 
  queixasPrincipais: string; 
  
  pressaoArterial?: string;
  temperatura?: string;
  frequenciaCardiaca?: string;
  saturacao?: string;
  
  exameFisico?: string;
  hipoteseDiagnostica?: string;
  condutaPlanoTerapeutico?: string;

  // NOVOS CAMPOS ADICIONADOS
  detalhesConsulta?: string;
  observacoesConsulta?: string; 
}

export interface ConsultaDetalhada {
  id: string;
  prontuarioId: string;
  dataHoraConsulta: string; 
  motivoConsulta?: string; 
  queixasPrincipais?: string;
  
  pressaoArterial?: string;
  temperatura?: string;
  frequenciaCardiaca?: string;
  saturacao?: string;
  
  exameFisico?: string;
  hipoteseDiagnostica?: string;
  condutaPlanoTerapeutico?: string;

  // NOVOS CAMPOS ADICIONADOS
  detalhesConsulta?: string;
  observacoesConsulta?: string;

  tipoResponsavel?: "MEDICO" | "ADMINISTRADOR" | string;
  responsavelId?: string | number;
  responsavelNomeCompleto?: string;
  responsavelEspecialidade?: string;
  responsavelCRM?: string;

  anexos?: AnexoDetalhado[];
  createdAt: string;
  updatedAt: string;
}

// --- Internação ---
export interface NovaInternacaoRequest {
  pacienteId: string;
  medicoResponsavelAdmissaoId: number;
  dataAdmissao: string; 
  motivoInternacao: string; 
  historiaDoencaAtual?: string; 
  dataAltaPrevista?: string; 
}

export interface InternacaoDetalhada {
  id: string;
  prontuarioId: string;
  dataAdmissao: string;
  motivoInternacao?: string;
  historiaDoencaAtual?: string;
  tipoResponsavelAdmissao?: "MEDICO" | "ADMINISTRADOR" | string;
  responsavelAdmissaoId?: string | number;
  responsavelAdmissaoNomeCompleto?: string;
  responsavelAdmissaoEspecialidade?: string; 
  responsavelAdmissaoCRM?: string;
  dataAltaPrevista?: string;
  dataAltaEfetiva?: string;
  resumoAlta?: string;
  medicoResponsavelAltaId?: number;
  medicoResponsavelAltaNome?: string;
  anexos?: AnexoDetalhado[];
  createdAt: string;
  updatedAt: string;
}

export interface RegistrarAltaInternacaoRequest {
    dataAltaEfetiva: string; 
    resumoAlta: string;
    medicoResponsavelAltaId: number;
}

// --- Exame (Mantido para referência) ---
export interface AdicionarExameRequest { 
  nome: string;
  data: string; 
  resultado: string;
  observacoes?: string;
  arquivo?: File; 
}
export type ExameDetalhado = import('./prontuario').Exame; // Assumindo que Exame de prontuario.ts é o detalhado

// --- Cirurgia (Exemplo, se for implementar) ---
export interface NovaCirurgiaRequest {
  dataCirurgia: string; 
  descricaoCirurgia: string;
  relatorioCirurgico?: string;
  medicoCirurgiaoId: number;
}

export interface CirurgiaDetalhada {
  id: string;
  prontuarioId: string;
  dataCirurgia: string;
  descricaoCirurgia: string;
  relatorioCirurgico?: string;
  medicoCirurgiaoId?: number;
  medicoCirurgiaoNome?: string;
  anexos?: AnexoDetalhado[];
  createdAt: string;
  updatedAt: string;
}

// --- Anotação Geral (Mantida) ---
export interface AdicionarAnotacaoRequest { 
  texto: string;
}
export type AnotacaoGeralDetalhada = import('./prontuario').Anotacao;

// --- Tipos para o Wizard de Criação de Prontuário ---
export type TipoPrimeiroRegistro = 'CONSULTA' | 'INTERNACAO' | 'EXAME' | 'CIRURGIA' | 'ANOTACAO_GERAL';

export interface PrimeiroRegistroData { // Usado pelo ProntuarioForm.tsx
    tipo: TipoPrimeiroRegistro;
    // Os dados específicos serão coletados nos formulários subsequentes
    dadosConsulta?: NovaConsultaRequest;
    dadosInternacao?: NovaInternacaoRequest;
    // ... outros tipos
}