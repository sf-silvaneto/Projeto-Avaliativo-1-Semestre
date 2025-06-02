export interface AnexoDetalhado {
  id: string;
  nomeOriginalArquivo: string;
  nomeArquivoArmazenado: string;
  tipoConteudo: string;
  tamanhoBytes?: number;
  dataUpload?: string;
  urlVisualizacao?: string;
}

export interface NovaConsultaRequest {
  dataHoraConsulta: string;
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

export interface AdicionarExameRequest {
  nome: string;
  data: string;
  resultado: string;
  observacoes?: string;
  arquivo?: File;
}
export type ExameDetalhado = import('./prontuario').Exame & { prontuarioId: string };

export interface NovaEncaminhamentoRequest {
  dataEncaminhamento: string;
  especialidadeDestino: string;
  motivoEncaminhamento: string;
  medicoSolicitanteId: number;
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

export interface AdicionarAnotacaoRequest {
  texto: string;
}
export type AnotacaoGeralDetalhada = import('./prontuario').Anotacao & { prontuarioId: string };

export type TipoPrimeiroRegistro = 'CONSULTA' | 'EXAME' | 'PROCEDIMENTO' | 'ENCAMINHAMENTO' | 'ANOTACAO_GERAL';

export interface PrimeiroRegistroData {
    tipo: TipoPrimeiroRegistro;
    dadosConsulta?: NovaConsultaRequest;
    dadosExame?: AdicionarExameRequest;
    dadosProcedimento?: NovaProcedimentoRequest;
    dadosEncaminhamento?: NovaEncaminhamentoRequest;
}