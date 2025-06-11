import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProntuarioForm, { ProntuarioWizardFormData } from '../../components/prontuario/ProntuarioForm';
import Alert from '../../components/ui/Alert';
import {
    adicionarConsultaComNovoProntuario,
    adicionarExameComNovoProntuario,
    adicionarProcedimentoComNovoProntuario,
    adicionarEncaminhamentoComNovoProntuario
} from '../../services/prontuarioService';
import {
    NovaConsultaRequest,
    AdicionarExameRequest,
    NovaProcedimentoRequest,
    NovaEncaminhamentoRequest,
    ConsultaDetalhada,
    ExameDetalhada,
    ProcedimentoDetalhado,
    EncaminhamentoDetalhada
} from '../../types/prontuarioRegistros';

interface WizardSubmitData extends ProntuarioWizardFormData {
    dadosEvento: any;
}


const ProntuarioCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreatePrimeiroRegistro = async (data: WizardSubmitData) => {
        console.log('ProntuarioCreatePage: handleCreatePrimeiroRegistro DADOS RECEBIDOS DO WIZARD:', JSON.stringify(data, null, 2));
        setIsLoading(true);
        setError(null);

        const { pacienteId, medicoId, tipoPrimeiroRegistro, dadosEvento } = data;

        if (!pacienteId || medicoId === undefined || !tipoPrimeiroRegistro || !dadosEvento) {
            console.error("ProntuarioCreatePage: Dados incompletos recebidos do wizard.", data);
            setError("Dados incompletos. Por favor, preencha todas as etapas do formulário.");
            setIsLoading(false);
            return;
        }

        try {
            let prontuarioOuEventoCriado: ConsultaDetalhada | ExameDetalhada | ProcedimentoDetalhado | EncaminhamentoDetalhada | any;

            switch (tipoPrimeiroRegistro) {
                case 'CONSULTA':
                    console.log('ProntuarioCreatePage: CHAMANDO adicionarConsultaComNovoProntuario com:', pacienteId, medicoId, dadosEvento);
                    prontuarioOuEventoCriado = await adicionarConsultaComNovoProntuario(
                        pacienteId,
                        medicoId,
                        { ...dadosEvento as NovaConsultaRequest, dataConsulta: dadosEvento.dataConsulta, medicoExecutorId: medicoId }
                    );
                    break;
                case 'EXAME':
                    console.log('ProntuarioCreatePage: CHAMANDO adicionarExameComNovoProntuario com:', pacienteId, medicoId, dadosEvento);
                    prontuarioOuEventoCriado = await adicionarExameComNovoProntuario(
                        pacienteId,
                        medicoId,
                        { ...dadosEvento as AdicionarExameRequest, dataExame: dadosEvento.dataExame }
                    );
                    break;
                case 'PROCEDIMENTO':
                    console.log('ProntuarioCreatePage: CHAMANDO adicionarProcedimentoComNovoProntuario com:', pacienteId, dadosEvento);
                    prontuarioOuEventoCriado = await adicionarProcedimentoComNovoProntuario(
                        pacienteId,
                        { ...dadosEvento as NovaProcedimentoRequest, medicoExecutorId: medicoId, dataProcedimento: dadosEvento.dataProcedimento }
                    );
                    break;
                case 'ENCAMINHAMENTO':
                    console.log('ProntuarioCreatePage: CHAMANDO adicionarEncaminhamentoComNovoProntuario com:', pacienteId, dadosEvento);
                    prontuarioOuEventoCriado = await adicionarEncaminhamentoComNovoProntuario(
                        pacienteId,
                        { ...dadosEvento as NovaEncaminhamentoRequest, medicoSolicitanteId: medicoId, dataEncaminhamento: dadosEvento.dataEncaminhamento }
                    );
                    break;
                default:
                    const errorMessage = `Tipo de registro '${tipoPrimeiroRegistro}' não suportado para criação inicial.`;
                    console.error(errorMessage);
                    throw new Error(errorMessage);
            }

            console.log('ProntuarioCreatePage: Resposta da API após criação:', prontuarioOuEventoCriado);

            let prontuarioIdParaNavegacao: string | undefined;
            if (prontuarioOuEventoCriado && prontuarioOuEventoCriado.prontuarioId) {
                prontuarioIdParaNavegacao = String(prontuarioOuEventoCriado.prontuarioId);
            }

            if (prontuarioIdParaNavegacao) {
                console.log('ProntuarioCreatePage: Navegando para /prontuarios/' + prontuarioIdParaNavegacao);
                navigate(`/prontuarios/${prontuarioIdParaNavegacao}`, {
                    state: {
                        prontuarioSuccess: true,
                        message: `Prontuário e ${tipoPrimeiroRegistro.toLowerCase().replace('_', ' ')} inicial registrados com sucesso!`
                    }
                });
            } else {
                console.warn("ProntuarioCreatePage: Não foi possível determinar o ID do prontuário para navegação. Resposta da API:", prontuarioOuEventoCriado);
                navigate('/prontuarios', {
                    state: {
                        prontuarioSuccess: true,
                        message: `Registro de ${tipoPrimeiroRegistro.toLowerCase().replace('_', ' ')} criado, mas falha ao obter ID do prontuário para redirecionamento direto. Verifique a lista.`
                    }
                });
            }

        } catch (err: any) {
            console.error('ProntuarioCreatePage: Erro ao criar primeiro registro do prontuário:', err.response?.data || err.message || err);
            setError(
                err.response?.data?.mensagem || err.message || 'Erro ao criar registro. Tente novamente.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-medium py-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-6">Novo Registro</h1>
            {error && (
                <Alert
                    type="error"
                    title="Erro na Criação"
                    message={error}
                    className="mb-6"
                    onClose={() => setError(null)}
                />
            )}
            <ProntuarioForm
                onSubmitFinal={handleCreatePrimeiroRegistro}
                isLoading={isLoading}
            />
        </div>
    );
};

export default ProntuarioCreatePage;