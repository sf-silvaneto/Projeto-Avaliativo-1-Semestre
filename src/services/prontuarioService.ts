// src/services/prontuarioService.ts
import api from './api';
import { 
  BuscaProntuarioParams, 
  // NovoProntuarioRequest, // Esta interface será menos usada ou modificada
  Prontuario, 
  ResultadoBuscaProntuarios, // Renomeado de ResultadoBusca
  AdicionarHistoricoGeralRequest, // Para histórico geral, se mantido
  Exame, // Para tipo de retorno de adicionarExame
  Medicacao // Para tipo de retorno de adicionarMedicacao
} from '../types/prontuario';

import { 
    NovaConsultaRequest, 
    ConsultaDetalhada,
    NovaInternacaoRequest, 
    InternacaoDetalhada,
    RegistrarAltaInternacaoRequest,
    AdicionarExameRequest as NovaExameRequest, // Reutilizando/Renomeando para clareza
    // Adicionar tipos para Cirurgia se for implementar
} from '../types/prontuarioRegistros'; 

// --- Funções de Busca e Detalhe (geralmente mantidas) ---
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
    return response.data; // Backend retorna ProntuarioDTO que mapeia para Prontuario no frontend
  } catch (error) {
    console.error(`Erro em buscarProntuarioPorId ${id}:`, error);
    throw error;
  }
};

// --- Criação de Prontuário e Primeiros Registros ---
// A criação de prontuário agora é implícita ao adicionar o primeiro registro.
// Os métodos abaixo refletem essa nova abordagem.

export const adicionarConsultaComNovoProntuario = async (
    pacienteId: string, 
    medicoExecutorId: number, 
    dadosConsulta: NovaConsultaRequest
): Promise<ConsultaDetalhada> => { 
    // O backend espera pacienteId e medicoExecutorId como query params no endpoint /api/prontuarios/consultas
    try {
        const response = await api.post(`/prontuarios/consultas`, dadosConsulta, {
            params: {
                pacienteId,
                medicoExecutorId
            }
        });
        // Espera-se que o backend retorne o ConsultaDetalhada que inclui o prontuarioId
        return response.data; 
    } catch (error) {
        console.error("Erro em adicionarConsultaComNovoProntuario:", error);
        throw error;
    }
};

export const adicionarInternacaoComNovoProntuario = async (
    dadosInternacao: NovaInternacaoRequest // Este DTO já contém pacienteId e medicoResponsavelAdmissaoId
): Promise<InternacaoDetalhada> => {
    // O backend espera os IDs dentro do corpo do DTO no endpoint /api/prontuarios/internacoes
    try {
        const response = await api.post(`/prontuarios/internacoes`, dadosInternacao);
        // Espera-se que o backend retorne o InternacaoDetalhada que inclui o prontuarioId
        return response.data;
    } catch (error) {
        console.error("Erro em adicionarInternacaoComNovoProntuario:", error);
        throw error;
    }
};


// --- Adicionar Registros a um Prontuário Existente ---

export const adicionarConsultaAProntuarioExistente = async (
    prontuarioId: string,
    medicoExecutorId: number, // Ou obter do contexto/seleção se for o usuário logado e médico
    dadosConsulta: NovaConsultaRequest
): Promise<ConsultaDetalhada> => {
    try {
        // Se o endpoint for diferente para prontuário existente
        // Ex: /api/prontuarios/{prontuarioId}/consultas
        // Se for o mesmo endpoint /api/prontuarios/consultas, o backend precisa diferenciar
        // Aqui vamos assumir um endpoint diferente para clareza, ou que o backend trata isso
        // Se o backend usa o mesmo, a chamada seria similar a adicionarConsultaComNovoProntuario,
        // mas o prontuarioId seria usado implicitamente ou como parte do corpo/path.
        // Para este exemplo, vamos assumir um endpoint específico para adicionar a um existente
        // ou que o backend identifica via prontuarioId no DTO (se o DTO incluísse)
        // Mas, baseado no controller: POST /api/prontuarios/{prontuarioId}/consultas
        // O medicoExecutorId ainda seria um query param.

        const response = await api.post(`/prontuarios/${prontuarioId}/consultas`, dadosConsulta, {
             params: { medicoExecutorId } // Se o endpoint for /api/prontuarios/{prontuarioId}/consultas
        });
        return response.data;
    } catch (error) {
        console.error(`Erro em adicionarConsultaAProntuarioExistente para prontuario ${prontuarioId}:`, error);
        throw error;
    }
};

export const adicionarInternacaoAProntuarioExistente = async (
    prontuarioId: string,
    dadosInternacao: Omit<NovaInternacaoRequest, 'pacienteId'> // Não precisa de pacienteId aqui
): Promise<InternacaoDetalhada> => {
    try {
        // Assumindo endpoint POST /api/prontuarios/{prontuarioId}/internacoes
        // O dadosInternacao aqui não precisaria do pacienteId, pois o prontuário já existe.
        // medicoResponsavelAdmissaoId ainda é necessário no DTO.
        const response = await api.post(`/prontuarios/${prontuarioId}/internacoes`, dadosInternacao);
        return response.data;
    } catch (error) {
        console.error(`Erro em adicionarInternacaoAProntuarioExistente para prontuario ${prontuarioId}:`, error);
        throw error;
    }
};


export const registrarAltaInternacao = async (
    internacaoId: string, 
    dadosAlta: RegistrarAltaInternacaoRequest
): Promise<InternacaoDetalhada> => {
    try {
        const response = await api.put(`/prontuarios/internacoes/${internacaoId}/alta`, dadosAlta);
        return response.data;
    } catch (error) {
        console.error(`Erro em registrarAltaInternacao para internação ${internacaoId}:`, error);
        throw error;
    }
};


// --- Funções para outros registros (Exames, Anotações, etc.) ---
// Manter ou adaptar as funções existentes de adicionarExame, adicionarAnotacao, etc.
// Elas agora podem precisar do medicoExecutorId ou que o backend determine o responsável.

export const adicionarExame = async (prontuarioId: string, dados: NovaExameRequest): Promise<Exame> => {
  try {
    if (dados.arquivo) {
      const formData = new FormData();
      formData.append('nome', dados.nome);
      formData.append('data', dados.data);
      formData.append('resultado', dados.resultado);
      if (dados.observacoes) formData.append('observacoes', dados.observacoes);
      formData.append('arquivo', dados.arquivo);
      
      const response = await api.post(`/prontuarios/${prontuarioId}/exames`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } else {
      const response = await api.post(`/prontuarios/${prontuarioId}/exames`, dados);
      return response.data;
    }
  } catch (error) {
    console.error(`Erro em adicionarExame para prontuario ${prontuarioId}:`, error);
    throw error;
  }
};

export const adicionarAnotacaoGeral = async (prontuarioId: string, dados: { texto: string }): Promise<import('../types/prontuario').Anotacao> => {
  try {
    // Assumindo que o endpoint para anotações gerais é /prontuarios/{prontuarioId}/anotacoes-gerais
    // ou o backend diferencia o tipo de anotação.
    const response = await api.post(`/prontuarios/${prontuarioId}/anotacoes-gerais`, dados);
    return response.data;
  } catch (error) {
    console.error(`Erro em adicionarAnotacaoGeral para prontuario ${prontuarioId}:`, error);
    throw error;
  }
};


// Adicionar Histórico Geral (se a entidade HistoricoMedicoEntity for mantida para notas gerais)
export const adicionarHistoricoGeral = async (prontuarioId: string, dados: AdicionarHistoricoGeralRequest): Promise<import('../types/prontuario').HistoricoMedico> => {
  try {
    const response = await api.post(`/prontuarios/${prontuarioId}/historico-geral`, dados);
    return response.data;
  } catch (error) {
    console.error(`Erro em adicionarHistoricoGeral para prontuario ${prontuarioId}:`, error);
    throw error;
  }
};

// Atualizar Prontuário (para campos básicos como médico responsável, status administrativo de arquivamento)
// Esta função pode precisar de um DTO específico no backend se os campos atualizáveis forem limitados.
export const atualizarDadosBasicosProntuario = async (id: string, dados: Partial<Pick<Prontuario, 'medicoResponsavel' | 'status' | 'dataAltaAdministrativa'>>): Promise<Prontuario> => {
  try {
    // O backend precisaria de um endpoint PUT /api/prontuarios/{id}/dados-basicos (ou similar)
    // que aceite um DTO com apenas os campos permitidos para atualização.
    const payload: any = {};
    if (dados.medicoResponsavel && dados.medicoResponsavel.id) {
        payload.medicoId = dados.medicoResponsavel.id;
    }
    if (dados.status) {
        payload.status = dados.status;
    }
    if (dados.dataAltaAdministrativa) {
        payload.dataAltaAdministrativa = dados.dataAltaAdministrativa;
    }
    const response = await api.put(`/prontuarios/${id}/dados-basicos`, payload);
    return response.data;
  } catch (error) {
    console.error(`Erro em atualizarDadosBasicosProntuario ${id}:`, error);
    throw error;
  }
};

// Mudar Status do Prontuário (pode ser usado para arquivamento manual se necessário)
export const mudarStatusProntuario = async (prontuarioId: string, status: string): Promise<Prontuario> => {
  try {
    const response = await api.patch(`/prontuarios/${prontuarioId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Erro em mudarStatusProntuario para ${prontuarioId}:`, error);
    throw error;
  }
};


// Medicações - Mantido como exemplo, pode ser um evento também
export const adicionarMedicacao = async (prontuarioId: string, dados: Omit<Medicacao, 'id'|'createdAt'|'updatedAt'>): Promise<Medicacao> => {
  try {
    const response = await api.post(`/prontuarios/${prontuarioId}/medicacoes`, dados);
    return response.data;
  } catch (error) {
    console.error(`Erro em adicionarMedicacao para prontuario ${prontuarioId}:`, error);
    throw error;
  }
};