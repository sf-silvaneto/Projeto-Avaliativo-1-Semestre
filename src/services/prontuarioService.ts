import api from './api';
import {
    BuscaProntuarioParams,
    Prontuario,
    ResultadoBuscaProntuarios,
} from '../types/prontuario';

import {
    NovaConsultaRequest,
    AtualizarConsultaRequest,
    ConsultaDetalhada,
    AdicionarExameRequest,
    AtualizarExameRequest,
    ExameDetalhada,
    NovaProcedimentoRequest,
    AtualizarProcedimentoRequest,
    ProcedimentoDetalhado,
    NovaEncaminhamentoRequest,
    AtualizarEncaminhamentoRequest,
    EncaminhamentoDetalhada
} from '../types/prontuarioRegistros';

export const buscarProntuarios = async (params: BuscaProntuarioParams): Promise<ResultadoBuscaProntuarios> => {
    try {
        const response = await api.get('/prontuarios', { params });
        return response.data;
    } catch (error) {
        console.error("Erro em buscarProntuarios:", error);
        throw error;
    }
};

export const buscarProntuarioPorId = async (id: string): Promise<Prontuario> => {
    try {
        const response = await api.get(`/prontuarios/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro em buscarProntuarioPorId ${id}:`, error);
        throw error;
    }
};

export const adicionarConsultaComNovoProntuario = async (
    pacienteId: string,
    medicoExecutorId: number,
    dadosConsulta: NovaConsultaRequest
): Promise<ConsultaDetalhada> => {
    try {
        const endpoint = `/prontuarios/consultas`;
        const response = await api.post(endpoint, dadosConsulta, {
            params: { pacienteId, medicoExecutorId }
        });
        return response.data;
    } catch (error) {
        console.error("Erro em adicionarConsultaComNovoProntuario (SERVICE):", error);
        throw error;
    }
};

export const adicionarExameComNovoProntuario = async (
    pacienteId: string,
    medicoResponsavelExameId: number,
    dadosExame: AdicionarExameRequest
): Promise<ExameDetalhada> => {
    try {
        const endpoint = `/prontuarios/exames`;
        const response = await api.post(endpoint, dadosExame, {
            params: { pacienteId, medicoResponsavelExameId },
        });
        return response.data;
    } catch (error) {
        console.error("Erro em adicionarExameComNovoProntuario (SERVICE):", error);
        throw error;
    }
};

export const adicionarProcedimentoComNovoProntuario = async (
    pacienteId: string,
    dadosProcedimento: NovaProcedimentoRequest
): Promise<ProcedimentoDetalhado> => {
    try {
        const endpoint = `/prontuarios/procedimentos`;
        const response = await api.post(endpoint, dadosProcedimento, {
            params: { pacienteId }
        });
        return response.data;
    } catch (error) {
        console.error("Erro em adicionarProcedimentoComNovoProntuario (SERVICE):", error);
        throw error;
    }
};

export const adicionarEncaminhamentoComNovoProntuario = async (
    pacienteId: string,
    dadosEncaminhamento: NovaEncaminhamentoRequest
): Promise<EncaminhamentoDetalhada> => {
    try {
        const endpoint = `/prontuarios/encaminhamentos`;
        const response = await api.post(endpoint, dadosEncaminhamento, {
            params: { pacienteId }
        });
        return response.data;
    } catch (error) {
        console.error("Erro em adicionarEncaminhamentoComNovoProntuario (SERVICE):", error);
        throw error;
    }
};

export const atualizarConsultaNoProntuario = async (
    consultaId: string,
    dadosAtualizacao: AtualizarConsultaRequest
): Promise<ConsultaDetalhada> => {
    try {
        const response = await api.put<ConsultaDetalhada>(`/prontuarios/consultas/${consultaId}`, dadosAtualizacao);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar consulta ${consultaId}:`, error);
        throw error;
    }
};

export const atualizarExameNoProntuario = async (
    exameId: string,
    dadosAtualizacao: AtualizarExameRequest
): Promise<ExameDetalhada> => {
    try {
        const response = await api.put<ExameDetalhada>(`/prontuarios/exames/${exameId}`, dadosAtualizacao);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar exame ${exameId}:`, error);
        throw error;
    }
};

export const atualizarProcedimentoNoProntuario = async (
    procedimentoId: string,
    dadosAtualizacao: AtualizarProcedimentoRequest
): Promise<ProcedimentoDetalhado> => {
    try {
        const response = await api.put<ProcedimentoDetalhado>(`/prontuarios/procedimentos/${procedimentoId}`, dadosAtualizacao);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar procedimento ${procedimentoId}:`, error);
        throw error;
    }
};

export const atualizarEncaminhamentoNoProntuario = async (
    encaminhamentoId: string,
    dadosAtualizacao: AtualizarEncaminhamentoRequest
): Promise<EncaminhamentoDetalhada> => {
    try {
        const response = await api.put<EncaminhamentoDetalhada>(`/prontuarios/encaminhamentos/${encaminhamentoId}`, dadosAtualizacao);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar encaminhamento ${encaminhamentoId}:`, error);
        throw error;
    }
};


export const atualizarDadosBasicosProntuario = async (id: string, dados: { medicoResponsavelId?: number }) : Promise<Prontuario> => {
    try {
        const payload: any = {};
        if (dados.medicoResponsavelId) {
            payload.medicoResponsavelId = dados.medicoResponsavelId;
        }
        const response = await api.put(`/prontuarios/${id}/dados-basicos`, payload);
        return response.data;
    } catch (error) {
        console.error(`Erro em atualizarDadosBasicosProntuario ${id}:`, error);
        throw error;
    }
};