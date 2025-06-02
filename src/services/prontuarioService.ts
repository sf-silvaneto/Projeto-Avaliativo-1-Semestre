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
    AdicionarExameRequest,
    ExameDetalhado,
    NovaProcedimentoRequest,
    ProcedimentoDetalhado,
    NovaEncaminhamentoRequest,
    EncaminhamentoDetalhado
} from '../types/prontuarioRegistros';

// --- Funções de Busca e Detalhe (permanecem as mesmas) ---
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
    console.log('prontuarioService: adicionarConsultaComNovoProntuario - pacienteId:', pacienteId, 'medicoExecutorId:', medicoExecutorId, 'dadosConsulta:', JSON.stringify(dadosConsulta, null, 2));
    try {
        const endpoint = `/prontuarios/consultas`;
        console.log('prontuarioService: CHAMANDO API POST', endpoint, 'com params:', { pacienteId, medicoExecutorId });
        const response = await api.post(endpoint, dadosConsulta, {
            params: { pacienteId, medicoExecutorId }
        });
        console.log('prontuarioService: RESPOSTA API para consulta:', response.data);
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
): Promise<ExameDetalhado> => {
    console.log('prontuarioService: adicionarExameComNovoProntuario - pacienteId:', pacienteId, 'medicoResponsavelExameId:', medicoResponsavelExameId, 'dadosExame:', JSON.stringify(dadosExame, null, 2));
    try {
        const endpoint = `/prontuarios/exames`; // Endpoint NOVO no backend
        console.log('prontuarioService: CHAMANDO API POST', endpoint, 'com params:', { pacienteId, medicoResponsavelExameId });
        const response = await api.post(endpoint, dadosExame, {
            params: { pacienteId, medicoResponsavelExameId },
        });
        console.log('prontuarioService: RESPOSTA API para exame:', response.data);
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
    console.log('prontuarioService: adicionarProcedimentoComNovoProntuario - pacienteId:', pacienteId, 'dadosProcedimento:', JSON.stringify(dadosProcedimento, null, 2));
    try {
        const endpoint = `/prontuarios/procedimentos`; // Endpoint NOVO no backend
        console.log('prontuarioService: CHAMANDO API POST', endpoint, 'com params:', { pacienteId });
        const response = await api.post(endpoint, dadosProcedimento, {
            params: { pacienteId }
        });
        console.log('prontuarioService: RESPOSTA API para procedimento:', response.data);
        return response.data;
    } catch (error) {
        console.error("Erro em adicionarProcedimentoComNovoProntuario (SERVICE):", error);
        throw error;
    }
};

export const adicionarEncaminhamentoComNovoProntuario = async (
    pacienteId: string,
    dadosEncaminhamento: NovaEncaminhamentoRequest
): Promise<EncaminhamentoDetalhado> => {
    console.log('prontuarioService: adicionarEncaminhamentoComNovoProntuario - pacienteId:', pacienteId, 'dadosEncaminhamento:', JSON.stringify(dadosEncaminhamento, null, 2));
    try {
        const endpoint = `/prontuarios/encaminhamentos`; // Endpoint NOVO no backend
        console.log('prontuarioService: CHAMANDO API POST', endpoint, 'com params:', { pacienteId });
        const response = await api.post(endpoint, dadosEncaminhamento, {
            params: { pacienteId }
        });
        console.log('prontuarioService: RESPOSTA API para encaminhamento:', response.data);
        return response.data;
    } catch (error) {
        console.error("Erro em adicionarEncaminhamentoComNovoProntuario (SERVICE):", error);
        throw error;
    }
};


// --- Adicionar Registros a um Prontuário Existente ---
// (As funções abaixo são para adições futuras, não diretamente usadas pelo wizard de criação inicial,
// mas mantidas para consistência e potencial uso futuro. Elas foram adaptadas para usar os
// endpoints de "criação" por enquanto, pois o backend pode não ter endpoints específicos para
// adicionar a um prontuário já existente via /prontuarios/{prontuarioId}/registros ainda.)

export const adicionarConsultaAProntuarioExistente = async (
    prontuarioId: string,
    medicoExecutorId: number,
    dadosConsulta: NovaConsultaRequest
): Promise<ConsultaDetalhada> => {
    try {
        console.warn("adicionarConsultaAProntuarioExistente pode precisar de endpoint dedicado no backend: /prontuarios/{id}/consultas. Usando endpoint de criação por enquanto.");
        const prontuario = await buscarProntuarioPorId(prontuarioId);
        if (!prontuario.paciente) throw new Error("Paciente não encontrado para o prontuário existente.");
        // Reutilizando a lógica de adicionar com novo prontuário, o backend faz o "findOrCreate"
        return adicionarConsultaComNovoProntuario(prontuario.paciente.id, medicoExecutorId, dadosConsulta);
    } catch (error) {
        console.error(`Erro em adicionarConsultaAProntuarioExistente para prontuario ${prontuarioId}:`, error);
        throw error;
    }
};

export const adicionarExameAProntuarioExistente = async (
    prontuarioId: string,
    medicoResponsavelExameId: number,
    dadosExame: AdicionarExameRequest
): Promise<ExameDetalhado> => {
    try {
        console.warn("adicionarExameAProntuarioExistente pode precisar de endpoint dedicado no backend: /prontuarios/{id}/exames. Usando endpoint de criação por enquanto.");
        const prontuario = await buscarProntuarioPorId(prontuarioId);
        if (!prontuario.paciente) throw new Error("Paciente não encontrado para o prontuário existente.");
        return adicionarExameComNovoProntuario(prontuario.paciente.id, medicoResponsavelExameId, dadosExame);
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
        console.warn("adicionarProcedimentoAProntuarioExistente pode precisar de endpoint dedicado no backend: /prontuarios/{id}/procedimentos. Usando endpoint de criação por enquanto.");
        const prontuario = await buscarProntuarioPorId(prontuarioId);
        if (!prontuario.paciente) throw new Error("Paciente não encontrado para o prontuário existente.");
        return adicionarProcedimentoComNovoProntuario(prontuario.paciente.id, dadosProcedimento);
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
        console.warn("adicionarEncaminhamentoAProntuarioExistente pode precisar de endpoint dedicado no backend: /prontuarios/{id}/encaminhamentos. Usando endpoint de criação por enquanto.");
        const prontuario = await buscarProntuarioPorId(prontuarioId);
        if (!prontuario.paciente) throw new Error("Paciente não encontrado para o prontuário existente.");
        return adicionarEncaminhamentoComNovoProntuario(prontuario.paciente.id, dadosEncaminhamento);
    } catch (error) {
        console.error(`Erro em adicionarEncaminhamentoAProntuarioExistente para prontuario ${prontuarioId}:`, error);
        throw error;
    }
};

export const atualizarDadosBasicosProntuario = async (id: string, dados: Partial<Pick<Prontuario, 'medicoResponsavel'>>) : Promise<Prontuario> => {
  try {
    const payload: any = {};
    if (dados.medicoResponsavel && dados.medicoResponsavel.id) {
        payload.medicoResponsavelId = dados.medicoResponsavel.id;
    }
    if (Object.keys(payload).length === 0) {
        console.warn("Nenhuma alteração fornecida para atualizarDadosBasicosProntuario.");
        return buscarProntuarioPorId(id);
    }
    const response = await api.put(`/prontuarios/${id}/dados-basicos`, payload);
    return response.data;
  } catch (error) {
    console.error(`Erro em atualizarDadosBasicosProntuario ${id}:`, error);
    throw error;
  }
};