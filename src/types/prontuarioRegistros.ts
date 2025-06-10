// filename: sf-silvaneto/clientehm/ClienteHM-6a1521d7c1550a92b879e103ac7f5c0dc5ff8d33/cliente-hm-front-main/src/types/prontuarioRegistros.ts

export interface AnexoDetalhado {
    id: string;
    nomeOriginalArquivo: string;
    nomeArquivoArmazenado: string;
    tipoConteudo: string;
    tamanhoBytes?: number;
    dataUpload?: string;
    urlVisualizacao?: string;
}

export interface SinaisVitais {
    pressaoArterial?: string;
    temperatura?: string;
    frequenciaCardiaca?: string;
    saturacao?: string;
    hgt?: string;
}

export interface NovaConsultaRequest {
    // Adicionado
    dataConsulta?: string; // Será preenchido pelo front se não houver um no initialData. No back, se nulo, será preenchido como agora.
    motivoConsulta: string;
    queixasPrincipais: string;
    sinaisVitais?: SinaisVitais;
    exameFisico?: string;
    hipoteseDiagnostica?: string;
    condutaPlanoTerapeutico?: string;
    detalhesConsulta?: string;
    observacoesConsulta?: string;
}

export interface AtualizarConsultaRequest {
    id?: string;
    // Adicionado
    dataConsulta?: string; // Campo para edição da data
    motivoConsulta?: string;
    queixasPrincipais?: string;
    sinaisVitais?: SinaisVitais;
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
    dataConsulta: string; // Campo obrigatório após a criação
    motivoConsulta?: string;
    queixasPrincipais?: string;
    sinaisVitais?: SinaisVitais;
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
    anexos?: AnexoDetalhado[];
    createdAt: string;
    updatedAt: string;
}

export interface AdicionarExameRequest {
    nome: string;
    resultado: string;
    observacoes?: string;
    arquivo?: File;
    dataExame?: string; // Adicionado, será preenchido pelo front ou back
}

export interface AtualizarExameRequest {
    id?: string;
    dataExame?: string; // Adicionado
    nome?: string;
    resultado?: string;
    observacoes?: string;
    medicoResponsavelExameId?: number | null;
}

export type ExameDetalhado = import('./prontuario').Exame & {
    prontuarioId: string;
    dataExame: string; // Adicionado
    medicoResponsavelExameId?: number;
    medicoResponsavelExameNome?: string;
};

export interface NovaEncaminhamentoRequest {
    dataEncaminhamento?: string; // Adicionado
    especialidadeDestino: string;
    motivoEncaminhamento: string;
    medicoSolicitanteId: number;
    observacoes?: string;
}

export interface AtualizarEncaminhamentoRequest {
    id?: string;
    dataEncaminhamento?: string; // Adicionado
    especialidadeDestino?: string;
    motivoEncaminhamento?: string;
    medicoSolicitanteId?: number | null;
    observacoes?: string;
}

export type EncaminhamentoDetalhado = import('./prontuario').Encaminhamento & {
    prontuarioId: string;
    dataEncaminhamento: string; // Adicionado
    medicoSolicitanteId?: number;
    medicoSolicitanteNome?: string;
    medicoSolicitanteCRM?: string;
    medicoSolicitanteEspecialidade?: string;
};

export interface NovaProcedimentoRequest {
    dataProcedimento?: string; // Adicionado
    descricaoProcedimento: string;
    relatorioProcedimento?: string;
    medicoExecutorId: number;
}

export interface AtualizarProcedimentoRequest {
    id?: string;
    dataProcedimento?: string; // Adicionado
    descricaoProcedimento?: string;
    relatorioProcedimento?: string;
    medicoExecutorId?: number | null;
}

export type ProcedimentoDetalhado = import('./prontuario').Procedimento & {
    prontuarioId: string;
    dataProcedimento: string; // Adicionado
    medicoExecutorId?: number;
    medicoExecutorNome?: string;
    medicoExecutorEspecialidade?: string;
};


export interface AdicionarAnotacaoRequest {
    texto: string;
}
export type AnotacaoGeralDetalhada = import('./prontuario').Anotacao & { prontuarioId: string };

export type TipoPrimeiroRegistro = 'CONSULTA' | 'EXAME' | 'PROCEDIMENTO' | 'ENCAMINHAMENTO';

export interface PrimeiroRegistroData {
    tipo: TipoPrimeiroRegistro;
    dadosConsulta?: NovaConsultaRequest;
    dadosExame?: AdicionarExameRequest;
    dadosProcedimento?: NovaProcedimentoRequest;
    dadosEncaminhamento?: NovaEncaminhamentoRequest;
}