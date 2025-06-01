// src/pages/prontuario/ProntuarioCreatePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProntuarioForm, { ProntuarioWizardFormData } from '../../components/prontuario/ProntuarioForm';
import Alert from '../../components/ui/Alert';
// Importar os NOVOS serviços para adicionar eventos com criação de prontuário
import {
    adicionarConsultaComNovoProntuario,
    adicionarInternacaoComNovoProntuario
    // Importe aqui outros serviços para "adicionarExameComNovoProntuario", etc.
} from '../../services/prontuarioService';
import {
    NovaConsultaRequest,
    NovaInternacaoRequest,
    // AdicionarExameRequest // Se aplicável
} from '../../types/prontuarioRegistros';
import { Prontuario } from '../../types/prontuario'; // Para o tipo de retorno esperado

const ProntuarioCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePrimeiroRegistro = async (data: ProntuarioWizardFormData & { dadosEvento: any }) => {
    setIsLoading(true);
    setError(null);

    const { pacienteId, medicoId, tipoPrimeiroRegistro, dadosEvento } = data;

    if (!pacienteId || !medicoId || !tipoPrimeiroRegistro || !dadosEvento) {
        setError("Dados incompletos. Por favor, preencha todas as etapas do formulário.");
        setIsLoading(false);
        return;
    }

    try {
      let prontuarioOuEventoCriado: any; // O tipo exato dependerá da resposta da sua API

      switch (tipoPrimeiroRegistro) {
        case 'CONSULTA':
          // No backend, adicionarConsulta recebe pacienteId e medicoExecutorId como @RequestParam
          // O 'dadosEvento' aqui é o NovaConsultaRequest
          prontuarioOuEventoCriado = await adicionarConsultaComNovoProntuario(
            pacienteId,
            medicoId, // medicoId do wizard é o medicoExecutorId para a primeira consulta
            dadosEvento as NovaConsultaRequest
          );
          break;
        case 'INTERNACAO':
          // O backend, para adicionarInternacao, espera pacienteId e medicoResponsavelAdmissaoId DENTRO do DTO
          const dadosInternacaoComIds: NovaInternacaoRequest = {
            ...(dadosEvento as Omit<NovaInternacaoRequest, 'pacienteId' | 'medicoResponsavelAdmissaoId'>),
            pacienteId: pacienteId, // Vindo do wizard
            medicoResponsavelAdmissaoId: medicoId, // medicoId do wizard é o medico da admissão
          };
          prontuarioOuEventoCriado = await adicionarInternacaoComNovoProntuario(dadosInternacaoComIds);
          break;
        // TODO: Adicionar casos para 'EXAME', 'CIRURGIA', 'ANOTACAO_GERAL'
        // Exemplo para EXAME (supondo que exista um adicionarExameComNovoProntuario)
        // case 'EXAME':
        //   prontuarioOuEventoCriado = await adicionarExameComNovoProntuario(pacienteId, medicoId, dadosEvento as AdicionarExameRequest);
        //   break;
        default:
          throw new Error(`Tipo de registro '${tipoPrimeiroRegistro}' não suportado para criação inicial.`);
      }

      // Navegar para a página de detalhes do prontuário recém-criado/atualizado
      // A resposta da API (prontuarioOuEventoCriado) deve conter o ID do prontuário.
      // Ajuste a lógica abaixo conforme a estrutura da sua resposta da API.
      let prontuarioIdParaNavegacao: string | undefined;

      if (prontuarioOuEventoCriado && prontuarioOuEventoCriado.prontuarioId) {
        prontuarioIdParaNavegacao = prontuarioOuEventoCriado.prontuarioId;
      } else if (prontuarioOuEventoCriado && prontuarioOuEventoCriado.id && (prontuarioOuEventoCriado as Prontuario).numeroProntuario) {
        // Se a API retornar o ProntuarioDTO completo
        prontuarioIdParaNavegacao = (prontuarioOuEventoCriado as Prontuario).id;
      } else {
         // Tentar obter o ID do prontuário do evento, se o DTO do evento tiver um campo prontuarioId
         // ou se o próprio DTO do evento tiver um campo 'id' que na verdade é o ID do prontuário
         // (menos provável, mas para cobrir cenários).
         // Este é um ponto crucial que depende da estrutura da sua API de resposta.
         // Exemplo: Se o ConsultaDetalhada ou InternacaoDetalhada tiver um campo `prontuarioId`
         const eventoComProntuarioId = prontuarioOuEventoCriado as { prontuarioId?: string; id?: string };
         if(eventoComProntuarioId.prontuarioId) {
             prontuarioIdParaNavegacao = eventoComProntuarioId.prontuarioId;
         } else {
             // Se for um prontuário criado e o ID do prontuário for retornado diretamente
             const prontuarioDireto = prontuarioOuEventoCriado as {id?: string};
             if(prontuarioDireto.id) prontuarioIdParaNavegacao = prontuarioDireto.id;
         }
      }

      if (prontuarioIdParaNavegacao) {
        navigate(`/prontuarios/${prontuarioIdParaNavegacao}`);
      } else {
        console.warn("Não foi possível determinar o ID do prontuário para navegação a partir da resposta da API.", prontuarioOuEventoCriado);
        setError("Registro criado, mas não foi possível redirecionar. Verifique a lista de prontuários.");
        setIsLoading(false);
        // navigate('/prontuarios'); // Fallback
      }

    } catch (err: any) {
      console.error('Erro ao criar primeiro registro do prontuário:', err);
      setError(
        err.response?.data?.mensagem || err.message || 'Erro ao criar registro. Tente novamente.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="container-medium py-8"> {/* Adicionado py-8 para espaçamento vertical */}
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Iniciar Novo Prontuário</h1>
      
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
          onClose={() => setError(null)}
        />
      )}
      
      <div className="card"> {/* Usando a classe card global */}
        <ProntuarioForm
          onSubmitFinal={handleCreatePrimeiroRegistro}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ProntuarioCreatePage;