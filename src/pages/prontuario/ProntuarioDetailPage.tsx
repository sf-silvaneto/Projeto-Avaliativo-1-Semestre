import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileEdit, 
  ArrowLeft, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FilePlus, 
  FileText, 
  Activity, 
  Pill, 
  FileImage, 
  MessageSquare,
  Loader2 // Importar Loader2
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { buscarProntuarioPorId } from '../../services/prontuarioService';
import { Prontuario, StatusProntuario, Genero } from '../../types/prontuario';


const ProntuarioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [prontuario, setProntuario] = useState<Prontuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'historico' | 'medicacoes' | 'exames' | 'anotacoes' | 'entradasMedicas'>('historico');
  
  useEffect(() => {
    const fetchProntuario = async () => {
      if (!id) {
        setError("ID do prontuário não fornecido.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await buscarProntuarioPorId(id);
        setProntuario(result);
      } catch (error: any) {
        console.error('Erro ao buscar prontuário:', error);
        setError(
          error.response?.data?.message || 'Erro ao buscar dados do prontuário. Tente novamente mais tarde.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProntuario();
  }, [id]);
  
  const formatData = (dataString?: string) => { // Adicionado '?' para dataString opcional
    if (!dataString) return 'Data inválida';
    try {
      const data = new Date(dataString);
      if (isNaN(data.getTime())) return 'Data inválida';
      return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // Adicionado timeZone UTC para consistência
    } catch (e) {
      return 'Data inválida';
    }
  };
  
  const renderGenero = (genero?: Genero) => {
    if (!genero) return 'Não informado';
    const generos = {
      [Genero.MASCULINO]: 'Masculino',
      [Genero.FEMININO]: 'Feminino',
      [Genero.OUTRO]: 'Outro',
      [Genero.NAO_INFORMADO]: 'Não informado',
    };
    return generos[genero] || genero;
  };
  
  const renderStatus = (status?: StatusProntuario) => {
    if(!status) return null;
    const statusClasses = {
      [StatusProntuario.ATIVO]: 'bg-success-100 text-success-800',
      [StatusProntuario.INATIVO]: 'bg-neutral-100 text-neutral-800',
      [StatusProntuario.ARQUIVADO]: 'bg-warning-100 text-warning-800',
      [StatusProntuario.ALTA]: 'bg-blue-100 text-blue-800',
    };

    const statusLabels = {
      [StatusProntuario.ATIVO]: 'Ativo',
      [StatusProntuario.INATIVO]: 'Inativo',
      [StatusProntuario.ARQUIVADO]: 'Arquivado',
      [StatusProntuario.ALTA]: 'Alta',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };
  
  if (isLoading) {
    return (
      <div className="container-medium py-8 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto" />
          <p className="mt-4 text-neutral-600">Carregando dados do prontuário...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container-medium py-8">
        <Alert
          type="error"
          title="Erro ao Carregar Prontuário"
          message={error}
        />
        <div className="mt-4">
          <Link to="/prontuarios">
            <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Voltar para a lista
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (!prontuario) {
    return (
      <div className="container-medium py-8">
        <Alert
          type="warning"
          title="Prontuário Não Encontrado"
          message="O prontuário solicitado não foi encontrado ou não existe."
        />
        <div className="mt-4">
          <Link to="/prontuarios">
            <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Voltar para a lista
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-medium">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center mb-2">
            <Link to="/prontuarios" className="text-neutral-500 hover:text-neutral-700 mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-neutral-900">
              Prontuário #{prontuario.numeroProntuario}
            </h1>
          </div>
          <div className="flex items-center">
            <div className="text-neutral-500 text-sm mr-4">
              <span className="mr-1">Iniciado em:</span>
              <span className="font-medium">{formatData(prontuario.dataInicio)}</span>
            </div>
            <div>
              {renderStatus(prontuario.status)}
            </div>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link to={`/prontuarios/${prontuario.id}/editar`}>
            <Button variant="primary" leftIcon={<FileEdit className="h-4 w-4" />}>
              Editar Detalhes do Prontuário
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Dados do Paciente</h2>
          {prontuario.paciente ? (
            <div className="space-y-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-neutral-400 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">{prontuario.paciente.nome}</h3>
                  <p className="text-sm text-neutral-500">
                    {renderGenero(prontuario.paciente.genero)} &middot; 
                    {' '}{formatData(prontuario.paciente.dataNascimento)}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-neutral-400 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">Contato</h3>
                  <p className="text-sm text-neutral-500">{prontuario.paciente.telefone}</p>
                  <p className="text-sm text-neutral-500">{prontuario.paciente.email}</p>
                </div>
              </div>
              {prontuario.paciente.endereco && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-neutral-400 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900">Endereço</h3>
                    <p className="text-sm text-neutral-500">
                      {prontuario.paciente.endereco.logradouro}, {prontuario.paciente.endereco.numero}
                      {prontuario.paciente.endereco.complemento && `, ${prontuario.paciente.endereco.complemento}`}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {prontuario.paciente.endereco.bairro}, {prontuario.paciente.endereco.cidade} - {prontuario.paciente.endereco.estado}
                    </p>
                    <p className="text-sm text-neutral-500">
                      CEP: {prontuario.paciente.endereco.cep}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-neutral-500">Dados do paciente não disponíveis.</p>
          )}
        </Card>
        
        <Card>
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Informações Gerais do Prontuário</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-neutral-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-neutral-900">Datas</h3>
                <p className="text-sm text-neutral-500">
                  <span className="font-medium">Início:</span> {formatData(prontuario.dataInicio)}
                </p>
                <p className="text-sm text-neutral-500">
                  <span className="font-medium">Última atualização:</span> {formatData(prontuario.dataUltimaAtualizacao)}
                </p>
                 {prontuario.dataAlta && (
                    <p className="text-sm text-neutral-500">
                        <span className="font-medium">Data da Alta:</span> {formatData(prontuario.dataAlta)}
                    </p>
                 )}
              </div>
            </div>
             {prontuario.medicoResponsavel && (
                 <div className="flex items-start">
                    <User className="h-5 w-5 text-neutral-400 mt-0.5 mr-2" /> {/* Pode usar Stethoscope aqui também */}
                    <div>
                        <h3 className="text-sm font-medium text-neutral-900">Médico Responsável</h3>
                        <p className="text-sm text-neutral-500">{prontuario.medicoResponsavel.nomeCompleto}</p>
                        <p className="text-xs text-neutral-500">CRM: {prontuario.medicoResponsavel.crm} ({prontuario.medicoResponsavel.especialidade})</p>
                    </div>
                </div>
             )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FilePlus className="h-4 w-4" />}
              fullWidth
              onClick={() => alert("Lógica para adicionar novo tipo de registro (Internação, Consulta, etc.) aqui.")}
            >
              Adicionar Novo Registro ao Prontuário
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-800 mb-3">Registros Detalhados do Prontuário</h2>
        <p className="text-neutral-600 mb-4">
          Esta seção será expandida para listar os diferentes tipos de registros (Consultas, Internações, Exames, Cirurgias) de forma organizada.
        </p>
        {/* Lógica futura para abas ou listagem cronológica dos novos tipos de registros */}
        {/* Exemplo:
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${ activeTab === 'entradasMedicas' ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}
              onClick={() => setActiveTab('entradasMedicas')}
            >
              <Activity className="h-4 w-4 inline mr-1" />
              Consultas/Entradas
            </button>
            { // Adicionar outras abas para Internações, Exames, Cirurgias
            }
          </nav>
        </div>
        */}
      </div>
      
      <div className="animate-fade-in">
        {/* Conteúdo das Abas/Listagem dos Registros */}
        {/* Se activeTab === 'historico' (ou um novo tipo de registro) */}
        {prontuario.historicoMedico && prontuario.historicoMedico.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-neutral-800 mb-3">Histórico Médico Inicial</h3>
            <div className="space-y-4">
                {prontuario.historicoMedico.map((item) => (
                  <Card key={item.id} className="border border-neutral-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-900">{formatData(item.data)}</span>
                      <span className="text-sm text-neutral-500">Responsável: {item.responsavel}</span>
                    </div>
                    <p className="text-neutral-700 whitespace-pre-line">{item.descricao}</p>
                  </Card>
                ))}
            </div>
          </div>
        )}
        {/* Outras seções para medicações, exames, anotações, etc., podem ser renderizadas aqui ou integradas na nova lógica de registros. */}

      </div>
    </div>
  );
};

export default ProntuarioDetailPage;