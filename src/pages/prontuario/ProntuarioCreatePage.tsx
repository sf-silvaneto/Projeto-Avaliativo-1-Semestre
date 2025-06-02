// sf-silvaneto/clientehm/ClienteHM-057824fed8786ee29c7b4f9a2010aca3a83abc37/cliente-hm-front-main/src/pages/prontuario/ProntuarioCreatePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProntuarioForm, { ProntuarioWizardFormData } from '../../components/prontuario/ProntuarioForm';
import Alert from '../../components/ui/Alert';
import {
    adicionarConsultaComNovoProntuario,
    // adicionarInternacaoComNovoProntuario, // REMOVIDO
    adicionarExameComNovoProntuario,
    adicionarProcedimentoComNovoProntuario,
    adicionarEncaminhamentoComNovoProntuario
} from '../../services/prontuarioService';
import {
    NovaConsultaRequest,
    // NovaInternacaoRequest, // REMOVIDO
    AdicionarExameRequest,
    NovaProcedimentoRequest,
    NovaEncaminhamentoRequest,
    ConsultaDetalhada,
    // InternacaoDetalhada, // REMOVIDO
    ExameDetalhado,
    ProcedimentoDetalhado,
    EncaminhamentoDetalhado
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
      // Ajustado o tipo para aceitar qualquer um dos DTOs de detalhe
      let prontuarioOuEventoCriado: ConsultaDetalhada | ExameDetalhado | ProcedimentoDetalhado | EncaminhamentoDetalhado | any;

      switch (tipoPrimeiroRegistro) {
        case 'CONSULTA':
          prontuarioOuEventoCriado = await adicionarConsultaComNovoProntuario(
            pacienteId,
            medicoId,
            dadosEvento as NovaConsultaRequest
          );
          break;
        // case 'INTERNACAO': // Bloco INTEIRO REMOVIDO
        //   break;
        case 'EXAME':
          prontuarioOuEventoCriado = await adicionarExameComNovoProntuario(
            pacienteId,
            medicoId,
            dadosEvento as AdicionarExameRequest // Não tem mais 'arquivo'
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
        case 'ENCAMINHAMENTO':
          const dadosEncaminhamentoComSolicitante: NovaEncaminhamentoRequest = {
            ...(dadosEvento as Omit<NovaEncaminhamentoRequest, 'medicoSolicitanteId'>),
            medicoSolicitanteId: medicoId,
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

      // Verifica se a resposta tem a propriedade prontuarioId (comum a todos os DTOs de detalhe de registro)
      if (prontuarioOuEventoCriado && typeof prontuarioOuEventoCriado.prontuarioId === 'string') {
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