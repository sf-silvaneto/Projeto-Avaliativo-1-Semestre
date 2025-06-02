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

// --- Consulta ---
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

// --- Internação (REMOVIDO) ---
// REMOVIDO: NovaInternacaoRequest
// REMOVIDO: InternacaoDetalhada
// REMOVIDO: RegistrarAltaInternacaoRequest

// --- Exame ---
export interface AdicionarExameRequest {
  nome: string;
  data: string;
  resultado: string;
  observacoes?: string;
  arquivo?: File;
}
export type ExameDetalhado = import('./prontuario').Exame & { prontuarioId: string };


// --- Encaminhamento Médico (NOVO) ---
export interface NovaEncaminhamentoRequest {
  dataEncaminhamento: string; // ISOString (ex: "2024-05-31T14:30:00")
  especialidadeDestino: string;
  motivoEncaminhamento: string;
  medicoSolicitanteId: number; // ID do médico que está fazendo o encaminhamento
  observacoes?: string;
}

export interface EncaminhamentoDetalhado {
  id: string;
  prontuarioId: string;
  dataEncaminhamento: string;
  especialidadeDestino: string;
  motivoEncaminhamento: string;
  medicoSolicitanteId?: number;
  medicoSolicitanteNome?: string;
  medicoSolicitanteCRM?: string;
  observacoes?: string;
  anexos?: AnexoDetalhado[];
  createdAt: string;
  updatedAt: string;
}


// --- Procedimento ---
export interface NovaProcedimentoRequest {
  dataProcedimento: string;
  descricaoProcedimento: string;
  relatorioProcedimento?: string;
  medicoExecutorId: number;
}

export interface ProcedimentoDetalhado {
  id: string;
  prontuarioId: string;
  dataProcedimento: string;
  descricaoProcedimento: string;
  relatorioProcedimento?: string;
  medicoExecutorId?: number;
  medicoExecutorNome?: string;
  anexos?: AnexoDetalhado[];
  createdAt: string;
  updatedAt: string;
}

// --- Anotação Geral ---
export interface AdicionarAnotacaoRequest {
  texto: string;
}
export type AnotacaoGeralDetalhada = import('./prontuario').Anotacao & { prontuarioId: string };

// --- Tipos para o Wizard de Criação de Prontuário ---
export type TipoPrimeiroRegistro = 'CONSULTA' | 'EXAME' | 'PROCEDIMENTO' | 'ENCAMINHAMENTO' | 'ANOTACAO_GERAL'; // 'INTERNACAO' removido, 'ENCAMINHAMENTO' adicionado

export interface PrimeiroRegistroData {
    tipo: TipoPrimeiroRegistro;
    dadosConsulta?: NovaConsultaRequest;
    // dadosInternacao?: NovaInternacaoRequest; // Removido
    dadosExame?: AdicionarExameRequest;
    dadosProcedimento?: NovaProcedimentoRequest;
    dadosEncaminhamento?: NovaEncaminhamentoRequest; // Adicionado
}