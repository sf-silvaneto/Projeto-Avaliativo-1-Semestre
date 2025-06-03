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

export interface AtualizarConsultaRequest {
    id?: string;
    dataHoraConsulta?: string;
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
    medicoExecutorId?: number | null;
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
  responsavelMedico?: {
    id: number;
    nomeCompleto: string;
    especialidade?: string;
    crm?: string;
  };
  responsavelAdmin?: {
    id: number;
    nome: string;
  };
  nomeResponsavelDisplay?: string;
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

export interface AtualizarExameRequest {
    id?: string;
    nome?: string;
    data?: string;
    resultado?: string;
    observacoes?: string;
    medicoResponsavelExameId?: number | null;
}

export type ExameDetalhado = import('../prontuario').Exame & { 
    prontuarioId: string;
    medicoResponsavelExameId?: number;
    medicoResponsavelExameNome?: string;
    nomeResponsavelDisplay?: string;
};

export interface NovaEncaminhamentoRequest {
  dataEncaminhamento: string;
  especialidadeDestino: string;
  motivoEncaminhamento: string;
  medicoSolicitanteId: number;
  observacoes?: string;
}

export interface AtualizarEncaminhamentoRequest {
    id?: string;
    dataEncaminhamento?: string;
    especialidadeDestino?: string;
    motivoEncaminhamento?: string;
    medicoSolicitanteId?: number | null;
    observacoes?: string;
}

export type EncaminhamentoDetalhado = import('../prontuario').Encaminhamento & {
    prontuarioId: string;
    medicoSolicitanteId?: number;
    medicoSolicitanteNome?: string;
    medicoSolicitanteCRM?: string;
    medicoSolicitanteEspecialidade?: string;
    nomeResponsavelDisplay?: string;
};

export interface NovaProcedimentoRequest {
  dataProcedimento: string;
  descricaoProcedimento: string;
  relatorioProcedimento?: string;
  medicoExecutorId: number;
}

export interface AtualizarProcedimentoRequest {
    id?: string;
    dataProcedimento?: string;
    descricaoProcedimento?: string;
    relatorioProcedimento?: string;
    medicoExecutorId?: number | null;
}

export type ProcedimentoDetalhado = import('../prontuario').Procedimento & {
    prontuarioId: string;
    medicoExecutorId?: number;
    medicoExecutorNome?: string;
    medicoExecutorEspecialidade?: string;
    nomeResponsavelDisplay?: string;
};


export interface AdicionarAnotacaoRequest {
  texto: string;
}
export type AnotacaoGeralDetalhada = import('../prontuario').Anotacao & { prontuarioId: string };

export type TipoPrimeiroRegistro = 'CONSULTA' | 'EXAME' | 'PROCEDIMENTO' | 'ENCAMINHAMENTO';

export interface PrimeiroRegistroData {
    tipo: TipoPrimeiroRegistro;
    dadosConsulta?: NovaConsultaRequest;
    dadosExame?: AdicionarExameRequest;
    dadosProcedimento?: NovaProcedimentoRequest;
    dadosEncaminhamento?: NovaEncaminhamentoRequest;
}