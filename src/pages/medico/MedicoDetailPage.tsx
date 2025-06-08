import React, { useState, useEffect, useCallback } from 'react'; // Adicione useCallback aqui
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Edit2 as EditIcon, 
    User, 
    Stethoscope, 
    Award, 
    FileText as FileTextIcon,
    ToggleLeft, 
    ToggleRight,
    Info,
    Clock
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { buscarMedicoPorId, ativarMedico, inativarMedico } from '../../services/medicoService';
import { Medico } from '../../types/medico';
import { Loader2 } from 'lucide-react';

const MedicoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medico, setMedico] = useState<Medico | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateStatusError, setUpdateStatusError] = useState<string | null>(null);
  const [updateStatusSuccess, setUpdateStatusSuccess] = useState<string | null>(null);


  const fetchMedico = useCallback(async () => {
    if (!id || isNaN(Number(id))) {
      setError("ID do médico inválido.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setUpdateStatusError(null);
    setUpdateStatusSuccess(null);
    try {
      const result = await buscarMedicoPorId(Number(id));
      setMedico(result);
    } catch (err: any) {
      console.error('Erro ao buscar médico:', err);
      setError(
        err.response?.data?.mensagem || err.message || 'Erro ao buscar dados do médico.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMedico();
  }, [fetchMedico]);

  const formatDateTime = (dataString?: string | Date) => {
    if (!dataString) return '-';
    try {
        const date = new Date(dataString); 
        if (isNaN(date.getTime())) return 'Data/Hora inválida';
        
        const optionsDate: Intl.DateTimeFormatOptions = {
            day: '2-digit', month: '2-digit', year: 'numeric',
            timeZone: 'America/Sao_Paulo'
        };
        const optionsTime: Intl.DateTimeFormatOptions = {
            hour: '2-digit', minute: '2-digit',
            timeZone: 'America/Sao_Paulo'
        };
        return date.toLocaleDateString('pt-BR', optionsDate) + 
               ' às ' + date.toLocaleTimeString('pt-BR', optionsTime);
    } catch (e) {
        return 'Data/Hora inválida';
    }
  };
  
  const isMedicoAtivo = (medicoData: Medico): boolean => {
    return medicoData.excludedAt === null || medicoData.excludedAt === undefined;
  };

  const renderStatus = (medicoData?: Medico) => {
    if (!medicoData) return <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-100 text-neutral-800">Não informado</span>;
    const isActive = isMedicoAtivo(medicoData);
    return (
      <span
        className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
          isActive ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-700'
        }`}
      >
        {isActive ? <ToggleRight className="mr-1 h-4 w-4 text-success-500"/> : <ToggleLeft className="mr-1 h-4 w-4 text-neutral-500"/>}
        {isActive ? 'Ativo' : 'Inativo'}
      </span>
    );
  };

  const handleToggleStatus = async () => {
    if (!medico) return;
    setIsUpdatingStatus(true);
    setUpdateStatusError(null);
    setUpdateStatusSuccess(null);
    try {
      let updatedMedico: Medico;
      if (isMedicoAtivo(medico)) {
        // Inativar
        const confirmInactivate = window.confirm(`Tem certeza que deseja inativar o médico ${medico.nomeCompleto}? Ele não aparecerá mais nas listas de seleção.`);
        if (!confirmInactivate) {
            setIsUpdatingStatus(false);
            return;
        }
        updatedMedico = await inativarMedico(medico.id);
        setUpdateStatusSuccess(`Médico ${medico.nomeCompleto} inativado com sucesso.`);
      } else {
        // Ativar
        const confirmActivate = window.confirm(`Tem certeza que deseja ativar o médico ${medico.nomeCompleto}? Ele voltará a aparecer nas listas de seleção.`);
        if (!confirmActivate) {
            setIsUpdatingStatus(false);
            return;
        }
        updatedMedico = await ativarMedico(medico.id);
        setUpdateStatusSuccess(`Médico ${medico.nomeCompleto} ativado com sucesso.`);
      }
      setMedico(updatedMedico); // Atualiza o estado local do médico
    } catch (err: any) {
      setUpdateStatusError(err.response?.data?.mensagem || err.message || 'Erro ao alterar status do médico.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  const DetailItem: React.FC<{ icon?: React.ReactNode; label: string; value?: string | null | React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start py-2">
      {icon && <span className="mr-3 text-neutral-500 mt-1">{icon}</span>}
      <div className="flex-1">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{label}</p>
        <div className="text-sm text-neutral-800 font-medium">
            {value !== null && value !== undefined && value !== '' ? value : '-'}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container-medium py-8 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
        <p className="ml-3 text-neutral-600">Carregando dados do médico...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container-medium py-8">
        <Alert
          type="error"
          title="Erro ao Carregar Médico"
          message={error}
        />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/medicos')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }
  
  if (!medico) {
    return (
      <div className="container-medium py-8">
        <Alert
          type="warning"
          title="Médico Não Encontrado"
          message="O médico solicitado não foi encontrado ou não existe."
        />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/medicos')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-medium py-8">
      {updateStatusError && <Alert type="error" message={updateStatusError} className="mb-4" onClose={() => setUpdateStatusError(null)} />}
      {updateStatusSuccess && <Alert type="success" message={updateStatusSuccess} className="mb-4" onClose={() => setUpdateStatusSuccess(null)} />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Detalhes do Médico
        </h1>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button variant="secondary" onClick={() => navigate('/medicos')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Voltar
            </Button>
            <Button variant="primary" onClick={() => navigate(`/medicos/${id}/editar`)} leftIcon={<EditIcon className="h-4 w-4" />}>
                Editar Médico
            </Button>
            {/* Botão de Ativar/Inativar */}
            <Button
                variant={isMedicoAtivo(medico) ? "warning" : "success"}
                onClick={handleToggleStatus}
                isLoading={isUpdatingStatus}
                leftIcon={isMedicoAtivo(medico) ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                className="w-full sm:w-auto justify-center"
            >
                {isMedicoAtivo(medico) ? "Inativar" : "Ativar"}
            </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-800 mb-4 border-b pb-3">Informações Profissionais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <DetailItem icon={<User size={18}/>} label="Nome Completo" value={medico.nomeCompleto} />
            <DetailItem icon={<Info size={18}/>} label="CRM" value={medico.crm} />
            <DetailItem icon={<Stethoscope size={18}/>} label="Especialidade Principal" value={medico.especialidade} />
            <DetailItem icon={<Award size={18}/>} label="RQE" value={medico.rqe} />
            <div className="md:col-span-2">
                <DetailItem 
                    icon={<FileTextIcon size={18}/>} 
                    label="Resumo da Especialidade" 
                    value={medico.resumoEspecialidade ? <pre className="whitespace-pre-wrap text-sm font-medium">{medico.resumoEspecialidade}</pre> : "-"} 
                />
            </div>
             <DetailItem icon={<Info size={18}/>} label="Status" value={renderStatus(medico)} />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-neutral-800 mb-4 border-b pb-3">Datas de Registro</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <DetailItem icon={<Clock size={18}/>} label="Data de Criação" value={formatDateTime(medico.createdAt)} />
            <DetailItem icon={<Clock size={18}/>} label="Última Atualização" value={formatDateTime(medico.updatedAt)} />
            {medico.excludedAt && (
                <DetailItem icon={<Clock size={18}/>} label="Data de Inativação" value={formatDateTime(medico.excludedAt)} />
            )}
        </div>
      </Card>
    </div>
  );
};

export default MedicoDetailPage;