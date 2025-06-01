// Arquivo: src/types/prontuarioRegistros.ts

// Supondo que AnexoSimples pode não existir ou não ser o ideal, vamos definir AnexoDetalhado
// Se AnexoSimples já existir em prontuario.ts com os campos corretos, pode usá-la.
// import { AnexoSimples } from './prontuario'; // Se for usar AnexoSimples de lá

// NOVA INTERFACE PARA ANEXOS DETALHADOS
export interface AnexoDetalhado {
  id: string; // ou number, dependendo do backend
  nomeOriginalArquivo: string;
  nomeArquivoArmazenado: string; // No frontend, isso pode se transformar em uma URL para download
  tipoConteudo: string;
  tamanhoBytes?: number; // Opcional, caso nem sempre venha
  dataUpload?: string; // ISOString
}

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
  // Anexos serão tratados separadamente no upload, mas a request pode não precisar deles diretamente aqui.
}

export interface EntradaMedicaDetalhada { // Resposta do backend para uma entrada/evolução
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

  // CAMPOS ATUALIZADOS/ADICIONADOS PARA O RESPONSÁVEL
  tipoResponsavel?: "MEDICO" | "ADMINISTRADOR" | string; // string para flexibilidade inicial
  responsavelId?: string | number;
  responsavelNomeCompleto?: string;
  responsavelEspecialidade?: string; // Se for médico
  responsavelCRM?: string;           // Se for médico
  // nomeResponsavelDisplay?: string; // Pode ser removido se os acima forem usados

  anexos?: AnexoDetalhado[]; // <<<< ADICIONADO PARA ANEXOS
  createdAt: string;
  updatedAt: string;
}

// --- Evolução Clínica --- (Pode ser que EntradaMedicaDetalhada sirva para evoluções também)
export interface NovaEvolucaoRequest { // Se for uma entidade/DTO diferente no backend
  dataEvolucao: string; // ISOString
  textoEvolucao: string;
  // anexos?: File[]; // Para upload, ou string[] para URLs/IDs
}

export interface EvolucaoClinica { // Resposta do backend para uma evolução
  id: string; // ou number
  prontuarioId: string; // ou number
  dataEvolucao: string;
  textoEvolucao: string;

  // CAMPOS ATUALIZADOS/ADICIONADOS PARA O RESPONSÁVEL (similar a EntradaMedicaDetalhada)
  tipoResponsavel?: "MEDICO" | "ADMINISTRADOR" | string;
  responsavelId?: string | number;
  responsavelNomeCompleto?: string;
  responsavelEspecialidade?: string;
  responsavelCRM?: string;
  // responsavelDetalhes?: string; // Pode ser removido

  anexos?: AnexoDetalhado[]; // <<<< ADICIONADO PARA ANEXOS
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