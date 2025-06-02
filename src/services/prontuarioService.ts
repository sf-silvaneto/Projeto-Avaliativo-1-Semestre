// src/services/prontuarioService.ts
import api from './api';
import {
  BuscaProntuarioParams,
  Prontuario,
  ResultadoBuscaProntuarios,
} from '../types/prontuario';

import {
    NovaConsultaRequest,
    ConsultaDetalhada,
    // NovaInternacaoRequest, // Removido
    // InternacaoDetalhada, // Removido
    // RegistrarAltaInternacaoRequest, // Removido
    AdicionarExameRequest,
    ExameDetalhado,
    NovaProcedimentoRequest,
    ProcedimentoDetalhado,
    NovaEncaminhamentoRequest, // Adicionado
    EncaminhamentoDetalhado    // Adicionado
} from '../types/prontuarioRegistros';

// --- Funções de Busca e Detalhe ---
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

// --- Criação de Prontuário e Primeiros Registros ---
export const adicionarConsultaComNovoProntuario = async (
    pacienteId: string,
    medicoExecutorId: number,
    dadosConsulta: NovaConsultaRequest
): Promise<ConsultaDetalhada> => {
    try {
        const response = await api.post(`/prontuarios/consultas`, dadosConsulta, {
            params: { pacienteId, medicoExecutorId }
        });
        return response.data;
    } catch (error) {
        console.error("Erro em adicionarConsultaComNovoProntuario:", error);
        throw error;
    }
};

// REMOVIDO: adicionarInternacaoComNovoProntuario

export const adicionarExameComNovoProntuario = async (
    pacienteId: string,
    medicoResponsavelId: number,
    dadosExame: AdicionarExameRequest
): Promise<ExameDetalhado> => {
    try {
        const endpoint = `/prontuarios/exames`; // Endpoint hipotético
        let response;
        if (dadosExame.arquivo) {
            const formData = new FormData();
            formData.append('nome', dadosExame.nome);
            formData.append('data', dadosExame.data);
            formData.append('resultado', dadosExame.resultado);
            if (dadosExame.observacoes) formData.append('observacoes', dadosExame.observacoes);
            formData.append('arquivo', dadosExame.arquivo);
            response = await api.post(endpoint, formData, {
                params: { pacienteId, medicoResponsavelId },
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } else {
            response = await api.post(endpoint, dadosExame, {
                params: { pacienteId, medicoResponsavelId },
            });
        }
        return response.data;
    } catch (error) {
        console.error("Erro em adicionarExameComNovoProntuario:", error);
        throw error;
    }
};

export const adicionarProcedimentoComNovoProntuario = async (
    pacienteId: string,
    dadosProcedimento: NovaProcedimentoRequest
): Promise<ProcedimentoDetalhado> => {
    try {
        const endpoint = `/prontuarios/procedimentos`; // Endpoint hipotético
        const response = await api.post(endpoint, dadosProcedimento, {
            params: { pacienteId } // medicoExecutorId já está em dadosProcedimento
        });
        return response.data;
    } catch (error) {
        console.error("Erro em adicionarProcedimentoComNovoProntuario:", error);
        throw error;
    }
};

export const adicionarEncaminhamentoComNovoProntuario = async (
    pacienteId: string,
    dadosEncaminhamento: NovaEncaminhamentoRequest
): Promise<EncaminhamentoDetalhado> => {
    try {
        const endpoint = `/prontuarios/encaminhamentos`; // Endpoint hipotético
        // medicoSolicitanteId está em dadosEncaminhamento
        const response = await api.post(endpoint, dadosEncaminhamento, {
            params: { pacienteId }
        });
        return response.data;
    } catch (error) {
        console.error("Erro em adicionarEncaminhamentoComNovoProntuario:", error);
        throw error;
    }
};


// --- Adicionar Registros a um Prontuário Existente ---
export const adicionarConsultaAProntuarioExistente = async (
    prontuarioId: string,
    medicoExecutorId: number,
    dadosConsulta: NovaConsultaRequest
): Promise<ConsultaDetalhada> => {
    try {
        const response = await api.post(`/prontuarios/${prontuarioId}/consultas`, dadosConsulta, {
             params: { medicoExecutorId }
        });
        return response.data;
    } catch (error) {
        console.error(`Erro em adicionarConsultaAProntuarioExistente para prontuario ${prontuarioId}:`, error);
        throw error;
    }
};

// REMOVIDO: adicionarInternacaoAProntuarioExistente
// REMOVIDO: registrarAltaInternacao

export const adicionarExameAProntuarioExistente = async (
    prontuarioId: string,
    medicoResponsavelId: number,
    dadosExame: AdicionarExameRequest
): Promise<ExameDetalhado> => {
    try {
        const endpoint = `/prontuarios/${prontuarioId}/exames`;
        let response;
        if (dadosExame.arquivo) {
            const formData = new FormData();
            formData.append('nome', dadosExame.nome);
            formData.append('data', dadosExame.data);
            formData.append('resultado', dadosExame.resultado);
            if (dadosExame.observacoes) formData.append('observacoes', dadosExame.observacoes);
            formData.append('arquivo', dadosExame.arquivo);
            response = await api.post(endpoint, formData, {
                params: { medicoResponsavelId },
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } else {
            response = await api.post(endpoint, dadosExame, {
                params: { medicoResponsavelId },
            });
        }
        return response.data;
    } catch (error) {
        console.error(`Erro em adicionarExameAProntuarioExistente para prontuario ${prontuarioId}:`, error);
        throw error;
    }
};

export const adicionarProcedimentoAProntuarioExistente = async (
    prontuarioId: string,
    dadosProcedimento: NovaProcedimentoRequest
): Promise<ProcedimentoDetalhado> => {
    try {
        const endpoint = `/prontuarios/${prontuarioId}/procedimentos`;
        const response = await api.post(endpoint, dadosProcedimento); // medicoExecutorId está em dadosProcedimento
        return response.data;
    } catch (error) {
        console.error(`Erro em adicionarProcedimentoAProntuarioExistente para prontuario ${prontuarioId}:`, error);
        throw error;
    }
};

export const adicionarEncaminhamentoAProntuarioExistente = async (
    prontuarioId: string,
    dadosEncaminhamento: NovaEncaminhamentoRequest
): Promise<EncaminhamentoDetalhado> => {
    try {
        const endpoint = `/prontuarios/${prontuarioId}/encaminhamentos`;
        // medicoSolicitanteId está em dadosEncaminhamento
        const response = await api.post(endpoint, dadosEncaminhamento);
        return response.data;
    } catch (error) {
        console.error(`Erro em adicionarEncaminhamentoAProntuarioExistente para prontuario ${prontuarioId}:`, error);
        throw error;
    }
};


export const atualizarDadosBasicosProntuario = async (id: string, dados: Partial<Pick<Prontuario, 'medicoResponsavel' | 'status' | 'dataAltaAdministrativa'>>): Promise<Prontuario> => {
  try {
    const payload: any = {};
    if (dados.medicoResponsavel && dados.medicoResponsavel.id) {
        payload.medicoResponsavelId = dados.medicoResponsavel.id;
    }
    if (dados.status) {
        payload.status = dados.status;
    }
    if (dados.hasOwnProperty('dataAltaAdministrativa')) {
        payload.dataAltaAdministrativa = dados.dataAltaAdministrativa === undefined ? null : dados.dataAltaAdministrativa;
    }
    const response = await api.put(`/prontuarios/${id}/dados-basicos`, payload);
    return response.data;
  } catch (error) {
    console.error(`Erro em atualizarDadosBasicosProntuario ${id}:`, error);
    throw error;
  }
};