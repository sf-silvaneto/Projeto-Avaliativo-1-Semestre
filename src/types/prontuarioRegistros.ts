// src/types/prontuarioRegistros.ts

import { AnexoSimples } from './prontuario'; // Supondo que AnexoSimples está em prontuario.ts

// --- Entrada Médica ---
export interface NovaEntradaMedicaRequest {
  dataHoraEntrada: string; // ISOString (ex: "2024-05-31T14:30:00")
  motivoEntrada: string;
  queixasPrincipais: string;
  pressaoArterial?: string;
  temperatura?: string;      // Ex: "36.5"
  frequenciaCardiaca?: string; // Ex: "75"
  saturacao?: string;          // Ex: "98"
  alergiasDetalhe?: string;
  semAlergiasConhecidas?: boolean;
  temComorbidades?: string; // "sim" ou "nao"
  comorbidadesDetalhes?: string;
  usaMedicamentosContinuos?: string; // "sim" ou "nao"
  medicamentosContinuosDetalhes?: string;
  historicoFamiliarRelevante?: string;
  // Anexos seriam tratados separadamente, possivelmente com um FormData se for upload direto,
  // ou uma lista de IDs de AnexoEntity se os anexos forem carregados antes.
}

export interface EntradaMedicaDetalhada { // Resposta do backend
  id: string; // ou number
  prontuarioId: string; // ou number
  dataHoraEntrada: string;
  motivoEntrada?: string;
  queixasPrincipais?: string;
  pressaoArterial?: string;
  temperatura?: string;
  frequenciaCardiaca?: string;
  saturacao?: string;
  alergiasDetalhe?: string;
  semAlergiasConhecidas?: boolean;
  temComorbidades?: boolean;
  comorbidadesDetalhes?: string;
  usaMedicamentosContinuos?: boolean;
  medicamentosContinuosDetalhes?: string;
  historicoFamiliarRelevante?: string;
  responsavelNome?: string; 
  responsavelDetalhes?: string; 
  anexos?: AnexoSimples[];
  createdAt: string;
  updatedAt: string;
}

// --- Evolução Clínica ---
export interface NovaEvolucaoRequest {
  dataEvolucao: string; // ISOString
  textoEvolucao: string;
  // anexos?: File[]; // Para upload, ou string[] para URLs/IDs
}

export interface EvolucaoClinica { // Resposta do backend
  id: string; // ou number
  prontuarioId: string; // ou number
  dataEvolucao: string;
  textoEvolucao: string;
  responsavelNome?: string;
  responsavelDetalhes?: string;
  anexos?: AnexoSimples[];
  createdAt: string;
  updatedAt: string;
}

// --- Exame --- (Revisando o existente em prontuarioService e prontuario.ts)
// Request para Adicionar Exame (pode precisar de FormData para arquivo)
export interface AdicionarExameRequest {
  nome: string;
  data: string; // YYYY-MM-DD
  resultado: string;
  observacoes?: string;
  arquivo?: File; // Para upload
}
// A interface Exame em prontuario.ts já serve bem como resposta.

// --- Medicação --- (Revisando o existente)
export interface AdicionarMedicacaoRequest {
  nome: string;
  dosagem: string;
  frequencia: string;
  dataInicio: string; // YYYY-MM-DD
  dataFim?: string;    // YYYY-MM-DD
  observacoes?: string;
}
// A interface Medicacao em prontuario.ts já serve bem como resposta.

// --- Anotação Geral --- (Revisando o existente)
export interface AdicionarAnotacaoRequest {
  texto: string;
  // data é geralmente o createdAt no backend
}
// A interface Anotacao em prontuario.ts já serve bem como resposta.