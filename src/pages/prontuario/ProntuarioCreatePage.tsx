// src/pages/prontuario/ProntuarioCreatePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProntuarioForm, { ProntuarioWizardFormData } from '../../components/prontuario/ProntuarioForm';
import Alert from '../../components/ui/Alert';
import {
    adicionarConsultaComNovoProntuario,
    // adicionarInternacaoComNovoProntuario, // Removido
    adicionarExameComNovoProntuario,
    adicionarProcedimentoComNovoProntuario,
    adicionarEncaminhamentoComNovoProntuario // Adicionado
} from '../../services/prontuarioService';
import {
    NovaConsultaRequest,
    // NovaInternacaoRequest, // Removido
    AdicionarExameRequest,
    NovaProcedimentoRequest,
    NovaEncaminhamentoRequest, // Adicionado
    ConsultaDetalhada,
    // InternacaoDetalhada, // Removido
    ExameDetalhado,
    ProcedimentoDetalhado,
    EncaminhamentoDetalhado // Adicionado
} from '../../types/prontuarioRegistros';

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
      let prontuarioOuEventoCriado: ConsultaDetalhada | ExameDetalhado | ProcedimentoDetalhado | EncaminhamentoDetalhado | any;

      switch (tipoPrimeiroRegistro) {
        case 'CONSULTA':
          prontuarioOuEventoCriado = await adicionarConsultaComNovoProntuario(
            pacienteId,
            medicoId,
            dadosEvento as NovaConsultaRequest
          );
          break;
        // case 'INTERNACAO': // Removido
        //   const dadosInternacaoComIds: NovaInternacaoRequest = {
        //     ...(dadosEvento as Omit<NovaInternacaoRequest, 'pacienteId' | 'medicoResponsavelAdmissaoId'>),
        //     pacienteId: pacienteId,
        //     medicoResponsavelAdmissaoId: medicoId,
        //   };
        //   prontuarioOuEventoCriado = await adicionarInternacaoComNovoProntuario(dadosInternacaoComIds);
        //   break;
        case 'EXAME':
          prontuarioOuEventoCriado = await adicionarExameComNovoProntuario(
            pacienteId,
            medicoId,
            dadosEvento as AdicionarExameRequest
          );
          break;
        case 'PROCEDIMENTO':
          const dadosProcedimentoComExecutor: NovaProcedimentoRequest = {
            ...(dadosEvento as Omit<NovaProcedimentoRequest, 'medicoExecutorId'>),
            medicoExecutorId: medicoId,
          };
          prontuarioOuEventoCriado = await adicionarProcedimentoComNovoProntuario(
            pacienteId,
            dadosProcedimentoComExecutor
          );
          break;
        case 'ENCAMINHAMENTO': // Adicionado
          const dadosEncaminhamentoComSolicitante: NovaEncaminhamentoRequest = {
            ...(dadosEvento as Omit<NovaEncaminhamentoRequest, 'medicoSolicitanteId'>),
            medicoSolicitanteId: medicoId, // Médico do wizard é o solicitante
          };
          prontuarioOuEventoCriado = await adicionarEncaminhamentoComNovoProntuario(
            pacienteId,
            dadosEncaminhamentoComSolicitante
          );
          break;
        default:
          throw new Error(`Tipo de registro '${tipoPrimeiroRegistro}' não suportado para criação inicial.`);
      }

      let prontuarioIdParaNavegacao: string | undefined;

      if (prontuarioOuEventoCriado && prontuarioOuEventoCriado.prontuarioId) {
        prontuarioIdParaNavegacao = prontuarioOuEventoCriado.prontuarioId;
      } else {
         console.warn("Não foi possível determinar o ID do prontuário para navegação a partir da resposta da API.", prontuarioOuEventoCriado);
         setError("Registro criado, mas não foi possível redirecionar. Verifique a lista de prontuários.");
         setIsLoading(false);
         return;
      }

      if (prontuarioIdParaNavegacao) {
        navigate(`/prontuarios/${prontuarioIdParaNavegacao}`);
      } else {
        console.warn("ID do prontuário para navegação não encontrado após criação.", prontuarioOuEventoCriado);
        setError("Registro criado, mas falha ao obter ID do prontuário para redirecionamento.");
        setIsLoading(false);
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
    <div className="container-medium py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Iniciar Novo Prontuário</h1>
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
          onClose={() => setError(null)}
        />
      )}
      <div className="card">
        <ProntuarioForm
          onSubmitFinal={handleCreatePrimeiroRegistro}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ProntuarioCreatePage;