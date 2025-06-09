import api from './api';
import {
  Medico,
  MedicoCreateDTO,
  MedicoUpdateDTO,
  ResultadoBuscaMedicos,
  BuscaMedicoParams,
} from '../types/medico';

export const buscarMedicos = async (params: BuscaMedicoParams): Promise<ResultadoBuscaMedicos> => {
  try {
    const response = await api.get('/medicos', { params });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar médicos:", error);
    throw error;
  }
};

export const buscarMedicoPorId = async (id: number): Promise<Medico> => {
  try {
    const response = await api.get<Medico>(`/medicos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar médico com ID ${id}:`, error);
    throw error;
  }
};

export const criarMedico = async (data: MedicoCreateDTO): Promise<Medico> => {
  try {
    const response = await api.post<Medico>('/medicos', data);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar médico:", error);
    throw error;
  }
};

export const atualizarMedico = async (id: number, data: MedicoUpdateDTO): Promise<Medico> => {
  try {
    const response = await api.put<Medico>(`/medicos/${id}`, data);
    return response.data;
  }catch (error) {
    console.error(`Erro ao atualizar médico com ID ${id}:`, error);
    throw error;
  }
};

export const ativarMedico = async (id: number): Promise<Medico> => {
  try {
    const response = await api.patch<Medico>(`/medicos/${id}/ativar`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao ativar médico com ID ${id}:`, error);
    throw error;
  }
};

export const inativarMedico = async (id: number): Promise<Medico> => {
  try {
    const response = await api.patch<Medico>(`/medicos/${id}/inativar`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao inativar médico com ID ${id}:`, error);
    throw error;
  }
};


export const deletarMedico = async (id: number): Promise<void> => {
  try {
    await api.delete(`/medicos/${id}`);
  } catch (error) {
    console.error(`Erro ao deletar médico com ID ${id}:`, error);
    throw error;
  }
};