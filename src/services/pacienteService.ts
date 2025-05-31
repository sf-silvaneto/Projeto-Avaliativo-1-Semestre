import api from './api';
import {
  Paciente,
  PacienteCreateDTO,
  PacienteUpdateDTO,
  ResultadoBuscaPacientes,
  BuscaPacienteParams,
} from '../types/paciente';

export const buscarPacientes = async (params: BuscaPacienteParams): Promise<ResultadoBuscaPacientes> => {
  try {
    const response = await api.get('/pacientes', { params });
    return response.data; 
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    throw error;
  }
};

export const buscarPacientePorId = async (id: string): Promise<Paciente> => {
  try {
    const response = await api.get<{dados: Paciente}>(`/pacientes/${id}`);
    return response.data.dados;
  } catch (error) {
    console.error(`Erro ao buscar paciente com ID ${id}:`, error);
    throw error;
  }
};

export const criarPaciente = async (data: PacienteCreateDTO): Promise<Paciente> => {
  try {
    const response = await api.post<{dados: Paciente}>('/pacientes', data);
    return response.data.dados;
  } catch (error) {
    console.error("Erro ao criar paciente:", error);
    throw error;
  }
};

export const atualizarPaciente = async (id: string, data: PacienteUpdateDTO): Promise<Paciente> => {
  try {
    const response = await api.put<{dados: Paciente}>(`/pacientes/${id}`, data);
    return response.data.dados;
  } catch (error) {
    console.error(`Erro ao atualizar paciente com ID ${id}:`, error);
    throw error;
  }
};

export const deletarPaciente = async (id: string): Promise<void> => {
  try {
    await api.delete(`/pacientes/${id}`);
  } catch (error) {
    console.error(`Erro ao deletar paciente com ID ${id}:`, error);
    throw error;
  }
};