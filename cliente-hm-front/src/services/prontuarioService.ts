import api from './api';
import { 
  BuscaProntuarioParams, 
  NovoProntuarioRequest, 
  Prontuario, 
  ResultadoBusca 
} from '../types/prontuario';

export const buscarProntuarios = async (params: BuscaProntuarioParams): Promise<ResultadoBusca> => {
  try {
    const response = await api.get('/prontuarios', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const buscarProntuarioPorId = async (id: string): Promise<Prontuario> => {
  try {
    const response = await api.get(`/prontuarios/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const criarProntuario = async (dados: NovoProntuarioRequest): Promise<Prontuario> => {
  try {
    const response = await api.post('/prontuarios', dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const atualizarProntuario = async (id: string, dados: Partial<NovoProntuarioRequest>): Promise<Prontuario> => {
  try {
    const response = await api.put(`/prontuarios/${id}`, dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const adicionarHistoricoMedico = async (prontuarioId: string, dados: { descricao: string }) => {
  try {
    const response = await api.post(`/prontuarios/${prontuarioId}/historico-medico`, dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const adicionarMedicacao = async (prontuarioId: string, dados: {
  nome: string;
  dosagem: string;
  frequencia: string;
  dataInicio: string;
  dataFim?: string;
  observacoes?: string;
}) => {
  try {
    const response = await api.post(`/prontuarios/${prontuarioId}/medicacoes`, dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const adicionarExame = async (prontuarioId: string, dados: {
  nome: string;
  data: string;
  resultado: string;
  observacoes?: string;
  arquivo?: File;
}) => {
  try {
    // Se tiver arquivo, usa FormData
    if (dados.arquivo) {
      const formData = new FormData();
      formData.append('nome', dados.nome);
      formData.append('data', dados.data);
      formData.append('resultado', dados.resultado);
      
      if (dados.observacoes) {
        formData.append('observacoes', dados.observacoes);
      }
      
      formData.append('arquivo', dados.arquivo);
      
      const response = await api.post(`/prontuarios/${prontuarioId}/exames`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Sem arquivo, usa JSON normal
      const response = await api.post(`/prontuarios/${prontuarioId}/exames`, dados);
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};

export const adicionarAnotacao = async (prontuarioId: string, dados: {
  texto: string;
}) => {
  try {
    const response = await api.post(`/prontuarios/${prontuarioId}/anotacoes`, dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const mudarStatusProntuario = async (prontuarioId: string, status: string) => {
  try {
    const response = await api.patch(`/prontuarios/${prontuarioId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};