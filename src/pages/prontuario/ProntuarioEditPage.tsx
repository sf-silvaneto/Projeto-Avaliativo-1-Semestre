import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Save, Loader2, User, Stethoscope, ListFilter, Activity, Microscope, Scissors, Send, Edit2 as EditIcon
} from 'lucide-react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Select from '../../components/ui/Select';
import { buscarProntuarioPorId, atualizarDadosBasicosProntuario, atualizarConsultaNoProntuario, atualizarExameNoProntuario, atualizarProcedimentoNoProntuario, atualizarEncaminhamentoNoProntuario } from '../../services/prontuarioService';
import { buscarMedicos } from '../../services/medicoService';
import { Prontuario } from '../../types/prontuario';
import { Medico, StatusMedico } from '../../types/medico';

import ConsultaForm from '../../components/prontuario/ConsultaForm';
import ExameForm from '../../components/prontuario/ExameForm';
import ProcedimentoForm from '../../components/prontuario/ProcedimentoForm';
import EncaminhamentoForm from '../../components/prontuario/EncaminhamentoForm';

import { 
    ConsultaDetalhada, AtualizarConsultaRequest,
    ExameDetalhado, AktualizarExameRequest,
    ProcedimentoDetalhado, AktualizarProcedimentoRequest,
    EncaminhamentoDetalhado, AktualizarEncaminhamentoRequest
} from '../../types/prontuarioRegistros';

const prontuarioBasicoSchema = z.object({
  medicoResponsavelId: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number({ required_error: "Médico responsável é obrigatório." }).positive("Médico responsável é obrigatório.")
  )
});
type ProntuarioBasicoFormData = z.infer<typeof prontuarioBasicoSchema>;

const logger = {
  log: (...args: any[]) => console.log('[ProntuarioEditPage]', ...args),
  error: (...args: any[]) => console.error('[ProntuarioEditPage]', ...args),
};

const ProntuarioEditPage: React.FC = () => {
  const { id: prontuarioId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [prontuario, setProntuario] = useState<Prontuario | null>(null);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingRegistro, setIsSavingRegistro] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dadosGerais');
  const [consultaEmEdicao, setConsultaEmEdicao] = useState<ConsultaDetalhada | null>(null);
  const [showModalConsulta, setShowModalConsulta] = useState(false);
  const [exameEmEdicao, setExameEmEdicao] = useState<ExameDetalhado | null>(null);
  const [showModalExame, setShowModalExame] = useState(false);
  const [procedimentoEmEdicao, setProcedimentoEmEdicao] = useState<ProcedimentoDetalhado | null>(null);
  const [showModalProcedimento, setShowModalProcedimento] = useState(false);
  const [encaminhamentoEmEdicao, setEncaminhamentoEmEdicao] = useState<EncaminhamentoDetalhado | null>(null);
  const [showModalEncaminhamento, setShowModalEncaminhamento] = useState(false);

  const { control, handleSubmit, reset, formState: { errors: formErrorsBasicos } } = useForm<ProntuarioBasicoFormData>({
    resolver: zodResolver(prontuarioBasicoSchema),
  });

  const fetchProntuarioEListas = useCallback(async () => {
    if (!prontuarioId) {
      setError("ID do prontuário não fornecido.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      logger.log(`Buscando prontuário com ID: ${prontuarioId}`);
      const prontuarioData = await buscarProntuarioPorId(prontuarioId);
      logger.log("Dados do prontuário recebidos:", prontuarioData);
      setProntuario(prontuarioData);
      
      const medicosData = await buscarMedicos({ status: StatusMedico.ATIVO, tamanho: 200, pagina: 0, sort: 'nomeCompleto,asc' });
      setMedicos(medicosData.content);

      reset({ medicoResponsavelId: prontuarioData.medicoResponsavel?.id });
    } catch (err: any) {
      logger.error('Erro ao buscar dados para edição do prontuário:', err.response?.data || err.message || err);
      setError(err.response?.data?.mensagem || err.message || 'Erro ao carregar dados para edição.');
    } finally {
      setIsLoading(false);
    }
  }, [prontuarioId, reset]);

  useEffect(() => {
    fetchProntuarioEListas();
  }, [fetchProntuarioEListas]);

  const medicoOptions = medicos
    .filter(m => m.status === StatusMedico.ATIVO)
    .map(medico => ({
        value: medico.id.toString(),
        label: `${medico.nomeCompleto} | ${medico.especialidade} | CRM: ${medico.crm}`
  }));

  const onSubmitDadosBasicos = async (data: ProntuarioBasicoFormData) => {
    if (!prontuarioId || !data.medicoResponsavelId) return;
    setIsSaving(true); setError(null); setSuccessMessage(null);
    try {
      await atualizarDadosBasicosProntuario(prontuarioId, { medicoResponsavelId: data.medicoResponsavelId });
      setSuccessMessage('Médico responsável principal atualizado com sucesso!');
      const prontuarioAtualizado = await buscarProntuarioPorId(prontuarioId);
      setProntuario(prontuarioAtualizado);
      reset({ medicoResponsavelId: prontuarioAtualizado.medicoResponsavel?.id });
    } catch (err: any) {
      logger.error('Erro ao atualizar médico responsável principal:', err);
      setError(err.response?.data?.mensagem || err.message || 'Falha ao atualizar médico responsável.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAbrirModalEdicaoConsulta = (consulta: ConsultaDetalhada) => {
    setConsultaEmEdicao(consulta); setShowModalConsulta(true); setError(null); setSuccessMessage(null);
  };
  const handleFecharModalEdicaoConsulta = () => {
    setShowModalConsulta(false); setConsultaEmEdicao(null);
  };
  const handleSalvarEdicaoConsulta = async (dados: Omit<AtualizarConsultaRequest, 'id'>) => {
    if (!consultaEmEdicao?.id) return;
    setIsSavingRegistro(true); setError(null); setSuccessMessage(null);
    try {
      const medicoIdFinal = dados.medicoExecutorId === null || dados.medicoExecutorId === undefined ? null : Number(dados.medicoExecutorId);
      await atualizarConsultaNoProntuario(consultaEmEdicao.id, { ...dados, medicoExecutorId: medicoIdFinal });
      setSuccessMessage('Consulta atualizada com sucesso!');
      handleFecharModalEdicaoConsulta();
      fetchProntuarioEListas(); 
    } catch (err: any) {
      logger.error(`Erro ao atualizar consulta ${consultaEmEdicao.id}:`, err);
      setError(err.response?.data?.mensagem || err.message || 'Falha ao atualizar consulta.');
    } finally {
      setIsSavingRegistro(false);
    }
  };

  const handleAbrirModalEdicaoExame = (exame: ExameDetalhado) => {
    setExameEmEdicao(exame); setShowModalExame(true); setError(null); setSuccessMessage(null);
  };
  const handleFecharModalEdicaoExame = () => {
    setShowModalExame(false); setExameEmEdicao(null);
  };
  const handleSalvarEdicaoExame = async (dados: Omit<AktualizarExameRequest, 'id'>) => {
    if (!exameEmEdicao?.id) return;
    setIsSavingRegistro(true); setError(null); setSuccessMessage(null);
    try {
      const medicoIdFinal = dados.medicoResponsavelExameId === null || dados.medicoResponsavelExameId === undefined ? null : Number(dados.medicoResponsavelExameId);
      await atualizarExameNoProntuario(exameEmEdicao.id.toString(), { ...dados, medicoResponsavelExameId: medicoIdFinal });
      setSuccessMessage('Exame atualizado com sucesso!');
      handleFecharModalEdicaoExame();
      fetchProntuarioEListas();
    } catch (err: any) {
      logger.error(`Erro ao atualizar exame ${exameEmEdicao.id}:`, err);
      setError(err.response?.data?.mensagem || err.message || 'Falha ao atualizar exame.');
    } finally {
      setIsSavingRegistro(false);
    }
  };
  
  const handleAbrirModalEdicaoProcedimento = (procedimento: ProcedimentoDetalhado) => {
    setProcedimentoEmEdicao(procedimento); setShowModalProcedimento(true); setError(null); setSuccessMessage(null);
  };
  const handleFecharModalEdicaoProcedimento = () => {
    setShowModalProcedimento(false); setProcedimentoEmEdicao(null);
  };
  const handleSalvarEdicaoProcedimento = async (dados: Omit<AktualizarProcedimentoRequest, 'id'>) => {
    if (!procedimentoEmEdicao?.id) return;
    setIsSavingRegistro(true); setError(null); setSuccessMessage(null);
    try {
      const medicoIdFinal = dados.medicoExecutorId === null || dados.medicoExecutorId === undefined ? null : Number(dados.medicoExecutorId);
      await atualizarProcedimentoNoProntuario(procedimentoEmEdicao.id.toString(), { ...dados, medicoExecutorId: medicoIdFinal });
      setSuccessMessage('Procedimento atualizado com sucesso!');
      handleFecharModalEdicaoProcedimento();
      fetchProntuarioEListas();
    } catch (err: any) {
      logger.error(`Erro ao atualizar procedimento ${procedimentoEmEdicao.id}:`, err);
      setError(err.response?.data?.mensagem || err.message || 'Falha ao atualizar procedimento.');
    } finally {
      setIsSavingRegistro(false);
    }
  };

  const handleAbrirModalEdicaoEncaminhamento = (encaminhamento: EncaminhamentoDetalhado) => {
    setEncaminhamentoEmEdicao(encaminhamento); setShowModalEncaminhamento(true); setError(null); setSuccessMessage(null);
  };
  const handleFecharModalEdicaoEncaminhamento = () => {
    setShowModalEncaminhamento(false); setEncaminhamentoEmEdicao(null);
  };
  const handleSalvarEdicaoEncaminhamento = async (dados: Omit<AktualizarEncaminhamentoRequest, 'id'>) => {
    if (!encaminhamentoEmEdicao?.id) return;
    setIsSavingRegistro(true); setError(null); setSuccessMessage(null);
    try {
      const medicoIdFinal = dados.medicoSolicitanteId === null || dados.medicoSolicitanteId === undefined ? null : Number(dados.medicoSolicitanteId);
      await atualizarEncaminhamentoNoProntuario(encaminhamentoEmEdicao.id.toString(), { ...dados, medicoSolicitanteId: medicoIdFinal });
      setSuccessMessage('Encaminhamento atualizado com sucesso!');
      handleFecharModalEdicaoEncaminhamento();
      fetchProntuarioEListas();
    } catch (err: any) {
      logger.error(`Erro ao atualizar encaminhamento ${encaminhamentoEmEdicao.id}:`, err);
      setError(err.response?.data?.mensagem || err.message || 'Falha ao atualizar encaminhamento.');
    } finally {
      setIsSavingRegistro(false);
    }
  };

  if (isLoading) { /* ... (loader) ... */ }
  if (error && !prontuario) { /* ... (error display) ... */ }
  if (!prontuario) { /* ... (not found display) ... */ }

  const TabButton: React.FC<{tabKey: string, label: string, icon: React.ReactNode, count?: number}> = ({tabKey, label, icon, count}) => (
    <button
        className={`group flex items-center py-3 px-3 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-150 ease-in-out
                      ${ activeTab === tabKey
                          ? 'border-primary-600 text-primary-700'
                          : 'border-transparent text-neutral-600 hover:text-primary-700 hover:border-primary-300'
                      }`}
        onClick={() => setActiveTab(tabKey)}
        role="tab"
        aria-selected={activeTab === tabKey}
    >
        {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 ${activeTab === tabKey ? 'text-primary-600': 'text-neutral-500 group-hover:text-primary-600'}`})}
        <span className="ml-2">{label}</span>
        {typeof count === 'number' && count > 0 &&
            <span className={`ml-2.5 text-xs font-semibold px-2 py-0.5 rounded-full ${activeTab === tabKey ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-700 group-hover:bg-primary-100 group-hover:text-primary-700'}`}>
                {count}
            </span>
        }
    </button>
  );

  return (
    <div className="container-wide py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
            <h1 className="text-2xl font-bold text-neutral-900">
                Editar Prontuário: {prontuario?.paciente.nome}
            </h1>
            <span className="text-neutral-500 text-sm">(#{prontuario?.numeroProntuario})</span>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to={`/prontuarios/${prontuarioId}`}>
            <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>Visualizar Prontuário</Button>
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} className="mb-6" onClose={() => setError(null)} />}
      {successMessage && <Alert type="success" message={successMessage} className="mb-6" onClose={() => setSuccessMessage(null)} />}

      <div className="mb-6">
        <div className="border-b border-neutral-300">
          <nav className="-mb-px flex space-x-1 sm:space-x-3 overflow-x-auto" aria-label="Abas de Edição">
            <TabButton tabKey="dadosGerais" label="Dados Gerais" icon={<User />} />
            <TabButton tabKey="consultas" label="Consultas" icon={<Activity />} count={prontuario?.consultas?.length} />
            <TabButton tabKey="exames" label="Exames" icon={<Microscope />} count={prontuario?.examesRegistrados?.length} />
            <TabButton tabKey="procedimentos" label="Procedimentos" icon={<Scissors />} count={prontuario?.procedimentosRegistrados?.length} />
            <TabButton tabKey="encaminhamentos" label="Encaminhamentos" icon={<Send />} count={prontuario?.encaminhamentosRegistrados?.length} />
          </nav>
        </div>
      </div>

      {activeTab === 'dadosGerais' && prontuario && (
        <Card>
            <h2 className="text-xl font-semibold text-neutral-800 mb-1">Médico Principal Responsável</h2>
            <p className="text-sm text-neutral-600 mb-4">Este é o médico primariamente associado a todo o prontuário do paciente.</p>
            <form onSubmit={handleSubmit(onSubmitDadosBasicos)}>
            <Controller
                name="medicoResponsavelId"
                control={control}
                defaultValue={prontuario.medicoResponsavel?.id}
                render={({ field }) => (
                <Select
                    label="Médico Responsável*"
                    options={[{ value: "", label: "Selecione um médico" }, ...medicoOptions]}
                    {...field}
                    value={String(field.value || "")} 
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    error={(formErrorsBasicos.medicoResponsavelId as FieldErrors<ProntuarioBasicoFormData>['medicoResponsavelId'])?.message}
                    leftAddon={<Stethoscope className="h-5 w-5 text-gray-400" />}
                    disabled={medicos.length === 0 || isSaving}
                />
                )}
            />
            <div className="mt-6 flex justify-end">
                <Button type="submit" variant="primary" isLoading={isSaving} leftIcon={<Save className="h-4 w-4" />}>
                  Salvar Médico Responsável
                </Button>
            </div>
            </form>
        </Card>
      )}

      {activeTab === 'consultas' && prontuario && (
        <Card>
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">Editar Registros de Consultas</h2>
          {prontuario.consultas && prontuario.consultas.length > 0 ? (
            <ul className="space-y-4">
              {prontuario.consultas.map(consulta => (
                <li key={consulta.id} className="p-4 border rounded-md bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className='flex-grow mb-2 sm:mb-0'>
                      <p className="font-medium text-neutral-800">Data: {new Date(consulta.dataHoraConsulta).toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
                      <p className="text-sm text-neutral-600">Motivo: {consulta.motivoConsulta || 'N/A'}</p>
                      <p className="text-sm text-neutral-600">Médico: {consulta.responsavelNomeCompleto || 'N/A'} {consulta.responsavelCRM ? `(CRM: ${consulta.responsavelCRM})` : ''}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => handleAbrirModalEdicaoConsulta(consulta)} leftIcon={<EditIcon className="h-4 w-4"/>} className="w-full sm:w-auto">Editar Consulta</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-neutral-600 py-6 text-center italic">Nenhuma consulta registrada.</p>}
        </Card>
      )}
      
      {activeTab === 'exames' && prontuario && (
         <Card>
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Editar Registros de Exames</h2>
             {prontuario.examesRegistrados && prontuario.examesRegistrados.length > 0 ? (
                <ul className="space-y-4">
                {prontuario.examesRegistrados.map(exame => (
                    <li key={exame.id} className="p-4 border rounded-md bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className='flex-grow mb-2 sm:mb-0'>
                        <p className="font-medium text-neutral-800">Exame: {exame.nome}</p>
                        <p className="text-sm text-neutral-600">Data: {new Date(exame.data).toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
                        <p className="text-sm text-neutral-600">Médico Resp.: {exame.medicoResponsavelExameNome || exame.nomeResponsavelDisplay || 'N/A'}</p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => handleAbrirModalEdicaoExame(exame)} leftIcon={<EditIcon className="h-4 w-4"/>} className="w-full sm:w-auto">Editar Exame</Button>
                    </div>
                    </li>
                ))}
                </ul>
            ) : <p className="text-neutral-600 py-6 text-center italic">Nenhum exame registrado.</p>}
         </Card>
      )}

      {activeTab === 'procedimentos' && prontuario && (
         <Card>
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Editar Registros de Procedimentos</h2>
             {prontuario.procedimentosRegistrados && prontuario.procedimentosRegistrados.length > 0 ? (
                <ul className="space-y-4">
                {prontuario.procedimentosRegistrados.map(proc => (
                    <li key={proc.id} className="p-4 border rounded-md bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className='flex-grow mb-2 sm:mb-0'>
                        <p className="font-medium text-neutral-800">Procedimento: {(proc.descricaoProcedimento || '').substring(0,50)}{proc.descricaoProcedimento && proc.descricaoProcedimento.length > 50 ? '...' : ''}</p>
                        <p className="text-sm text-neutral-600">Data: {new Date(proc.dataProcedimento).toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
                         <p className="text-sm text-neutral-600">Médico Exec.: {proc.medicoExecutorNome || (proc as any).nomeResponsavelDisplay || 'N/A'}</p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => handleAbrirModalEdicaoProcedimento(proc)} leftIcon={<EditIcon className="h-4 w-4"/>} className="w-full sm:w-auto">Editar Procedimento</Button>
                    </div>
                    </li>
                ))}
                </ul>
            ) : <p className="text-neutral-600 py-6 text-center italic">Nenhum procedimento registrado.</p>}
         </Card>
      )}

       {activeTab === 'encaminhamentos' && prontuario && (
         <Card>
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Editar Registros de Encaminhamentos</h2>
             {prontuario.encaminhamentosRegistrados && prontuario.encaminhamentosRegistrados.length > 0 ? (
                <ul className="space-y-4">
                {prontuario.encaminhamentosRegistrados.map(enc => (
                    <li key={enc.id} className="p-4 border rounded-md bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className='flex-grow mb-2 sm:mb-0'>
                        <p className="font-medium text-neutral-800">Encaminhamento para: {enc.especialidadeDestino}</p>
                        <p className="text-sm text-neutral-600">Data: {new Date(enc.dataEncaminhamento).toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
                         <p className="text-sm text-neutral-600">Médico Sol.: {enc.medicoSolicitanteNome || (enc as any).nomeResponsavelDisplay || 'N/A'} {enc.medicoSolicitanteCRM ? `(CRM: ${enc.medicoSolicitanteCRM})` : ''}</p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => handleAbrirModalEdicaoEncaminhamento(enc)} leftIcon={<EditIcon className="h-4 w-4"/>} className="w-full sm:w-auto">Editar Encaminhamento</Button>
                    </div>
                    </li>
                ))}
                </ul>
            ) : <p className="text-neutral-600 py-6 text-center italic">Nenhum encaminhamento registrado.</p>}
         </Card>
      )}

      {/* --- MODAIS --- */}
      {showModalConsulta && consultaEmEdicao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-70 flex items-center justify-center p-4" onClick={handleFecharModalEdicaoConsulta}>
          <Card className="relative w-full max-w-2xl lg:max-w-3xl shadow-xl rounded-lg bg-white max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-neutral-300 hover:scrollbar-thumb-neutral-400">
                <ConsultaForm onSubmitEvento={handleSalvarEdicaoConsulta} onCancel={handleFecharModalEdicaoConsulta}
                    initialData={{ ...consultaEmEdicao, medicoExecutorId: consultaEmEdicao.responsavelMedico?.id || (typeof consultaEmEdicao.responsavelId === 'number' ? consultaEmEdicao.responsavelId : undefined) }}
                    isEditMode={true} isLoading={isSavingRegistro} medicosDisponiveis={medicos} />
            </div>
          </Card>
        </div>
      )}
      {showModalExame && exameEmEdicao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-70 flex items-center justify-center p-4" onClick={handleFecharModalEdicaoExame}>
          <Card className="relative w-full max-w-2xl lg:max-w-3xl shadow-xl rounded-lg bg-white max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-neutral-300 hover:scrollbar-thumb-neutral-400">
                <ExameForm onSubmitEvento={handleSalvarEdicaoExame} onCancel={handleFecharModalEdicaoExame}
                    initialData={{ ...exameEmEdicao, medicoResponsavelExameId: exameEmEdicao.medicoResponsavelExameId || undefined}}
                    isEditMode={true} isLoading={isSavingRegistro} medicosDisponiveis={medicos} />
            </div>
          </Card>
        </div>
      )}
      {showModalProcedimento && procedimentoEmEdicao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-70 flex items-center justify-center p-4" onClick={handleFecharModalEdicaoProcedimento}>
          <Card className="relative w-full max-w-2xl lg:max-w-3xl shadow-xl rounded-lg bg-white max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-neutral-300 hover:scrollbar-thumb-neutral-400">
                <ProcedimentoForm onSubmitEvento={handleSalvarEdicaoProcedimento} onCancel={handleFecharModalEdicaoProcedimento}
                    initialData={{ ...procedimentoEmEdicao, medicoExecutorId: procedimentoEmEdicao.medicoExecutorId || undefined }}
                    isEditMode={true} isLoading={isSavingRegistro} medicosDisponiveis={medicos} />
            </div>
          </Card>
        </div>
      )}
      {showModalEncaminhamento && encaminhamentoEmEdicao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-70 flex items-center justify-center p-4" onClick={handleFecharModalEdicaoEncaminhamento}>
          <Card className="relative w-full max-w-2xl lg:max-w-3xl shadow-xl rounded-lg bg-white max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-neutral-300 hover:scrollbar-thumb-neutral-400">
                <EncaminhamentoForm onSubmitEvento={handleSalvarEdicaoEncaminhamento} onCancel={handleFecharModalEdicaoEncaminhamento}
                    initialData={{ ...encaminhamentoEmEdicao, medicoSolicitanteId: encaminhamentoEmEdicao.medicoSolicitanteId || undefined }}
                    isEditMode={true} isLoading={isSavingRegistro} medicosDisponiveis={medicos} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProntuarioEditPage;