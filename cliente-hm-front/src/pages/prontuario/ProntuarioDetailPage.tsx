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
  MessageSquare 
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { buscarProntuarioPorId } from '../../services/prontuarioService';
import { Prontuario, TipoTratamento, StatusProntuario, Genero } from '../../types/prontuario';

const ProntuarioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [prontuario, setProntuario] = useState<Prontuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'historico' | 'medicacoes' | 'exames' | 'anotacoes'>('historico');
  
  useEffect(() => {
    const fetchProntuario = async () => {
      if (!id) return;
      
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
  
  const formatData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  const renderTipoTratamento = (tipo: TipoTratamento) => {
    const tipos = {
      [TipoTratamento.TERAPIA_INDIVIDUAL]: 'Terapia Individual',
      [TipoTratamento.TERAPIA_CASAL]: 'Terapia de Casal',
      [TipoTratamento.TERAPIA_GRUPO]: 'Terapia de Grupo',
      [TipoTratamento.TERAPIA_FAMILIAR]: 'Terapia Familiar',
      [TipoTratamento.OUTRO]: 'Outro',
    };
    return tipos[tipo] || tipo;
  };
  
  const renderGenero = (genero: Genero) => {
    const generos = {
      [Genero.MASCULINO]: 'Masculino',
      [Genero.FEMININO]: 'Feminino',
      [Genero.OUTRO]: 'Outro',
      [Genero.NAO_INFORMADO]: 'Não informado',
    };
    return generos[genero] || genero;
  };
  
  const renderStatus = (status: StatusProntuario) => {
    const statusClasses = {
      [StatusProntuario.ATIVO]: 'bg-success-100 text-success-800',
      [StatusProntuario.INATIVO]: 'bg-neutral-100 text-neutral-800',
      [StatusProntuario.ARQUIVADO]: 'bg-warning-100 text-warning-800',
    };

    const statusLabels = {
      [StatusProntuario.ATIVO]: 'Ativo',
      [StatusProntuario.INATIVO]: 'Inativo',
      [StatusProntuario.ARQUIVADO]: 'Arquivado',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };
  
  if (isLoading) {
    return (
      <div className="container-medium">
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/3 mb-6 mx-auto"></div>
            <div className="h-64 bg-neutral-100 rounded mb-6"></div>
            <div className="h-32 bg-neutral-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container-medium">
        <Alert
          type="error"
          title="Erro ao carregar prontuário"
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
      <div className="container-medium">
        <Alert
          type="warning"
          title="Prontuário não encontrado"
          message="O prontuário solicitado não foi encontrado."
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
              Editar Prontuário
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Dados do Paciente</h2>
          
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
          </div>
        </Card>
        
        <Card>
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Informações do Tratamento</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-neutral-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-neutral-900">Tipo de Tratamento</h3>
                <p className="text-sm text-neutral-500">
                  {renderTipoTratamento(prontuario.tipoTratamento)}
                </p>
              </div>
            </div>
            
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
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FilePlus className="h-4 w-4" />}
              fullWidth
            >
              Adicionar Registro
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'historico'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
              onClick={() => setActiveTab('historico')}
            >
              <Activity className="h-4 w-4 inline mr-1" />
              Histórico Médico
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'medicacoes'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
              onClick={() => setActiveTab('medicacoes')}
            >
              <Pill className="h-4 w-4 inline mr-1" />
              Medicações
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'exames'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
              onClick={() => setActiveTab('exames')}
            >
              <FileImage className="h-4 w-4 inline mr-1" />
              Exames
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'anotacoes'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
              onClick={() => setActiveTab('anotacoes')}
            >
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Anotações
            </button>
          </nav>
        </div>
      </div>
      
      <div className="animate-fade-in">
        {activeTab === 'historico' && (
          <div>
            {prontuario.historicoMedico.length === 0 ? (
              <div className="bg-neutral-50 rounded-lg p-6 text-center">
                <Activity className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-700 mb-2">Sem registros de histórico médico</h3>
                <p className="text-neutral-500 mb-4">
                  Ainda não foram adicionados registros no histórico médico deste paciente.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<FilePlus className="h-4 w-4" />}
                >
                  Adicionar ao Histórico
                </Button>
              </div>
            ) : (
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
                
                <div className="text-center mt-6">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<FilePlus className="h-4 w-4" />}
                  >
                    Adicionar ao Histórico
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'medicacoes' && (
          <div>
            {prontuario.medicacoes.length === 0 ? (
              <div className="bg-neutral-50 rounded-lg p-6 text-center">
                <Pill className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-700 mb-2">Sem registros de medicações</h3>
                <p className="text-neutral-500 mb-4">
                  Ainda não foram adicionadas medicações para este paciente.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<FilePlus className="h-4 w-4" />}
                >
                  Adicionar Medicação
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {prontuario.medicacoes.map((item) => (
                  <Card key={item.id} className="border border-neutral-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-lg font-medium text-neutral-900">{item.nome}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                      <div>
                        <h4 className="text-xs text-neutral-500">Dosagem</h4>
                        <p className="text-sm text-neutral-700">{item.dosagem}</p>
                      </div>
                      <div>
                        <h4 className="text-xs text-neutral-500">Frequência</h4>
                        <p className="text-sm text-neutral-700">{item.frequencia}</p>
                      </div>
                      <div>
                        <h4 className="text-xs text-neutral-500">Período</h4>
                        <p className="text-sm text-neutral-700">
                          {formatData(item.dataInicio)} - {item.dataFim ? formatData(item.dataFim) : 'Atual'}
                        </p>
                      </div>
                    </div>
                    {item.observacoes && (
                      <div className="mt-2 pt-2 border-t border-neutral-100">
                        <h4 className="text-xs text-neutral-500">Observações</h4>
                        <p className="text-sm text-neutral-700">{item.observacoes}</p>
                      </div>
                    )}
                  </Card>
                ))}
                
                <div className="text-center mt-6">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<FilePlus className="h-4 w-4" />}
                  >
                    Adicionar Medicação
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'exames' && (
          <div>
            {prontuario.exames.length === 0 ? (
              <div className="bg-neutral-50 rounded-lg p-6 text-center">
                <FileImage className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-700 mb-2">Sem registros de exames</h3>
                <p className="text-neutral-500 mb-4">
                  Ainda não foram adicionados exames para este paciente.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<FilePlus className="h-4 w-4" />}
                >
                  Adicionar Exame
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {prontuario.exames.map((item) => (
                  <Card key={item.id} className="border border-neutral-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-lg font-medium text-neutral-900">{item.nome}</span>
                      <span className="text-sm text-neutral-500">{formatData(item.data)}</span>
                    </div>
                    <div className="mb-2">
                      <h4 className="text-xs text-neutral-500">Resultado</h4>
                      <p className="text-sm text-neutral-700">{item.resultado}</p>
                    </div>
                    {item.observacoes && (
                      <div className="mb-2">
                        <h4 className="text-xs text-neutral-500">Observações</h4>
                        <p className="text-sm text-neutral-700">{item.observacoes}</p>
                      </div>
                    )}
                    {item.arquivo && (
                      <div className="mt-2 pt-2 border-t border-neutral-100">
                        <a
                          href={item.arquivo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary-600 hover:text-primary-700"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          <span>Ver arquivo do exame</span>
                        </a>
                      </div>
                    )}
                  </Card>
                ))}
                
                <div className="text-center mt-6">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<FilePlus className="h-4 w-4" />}
                  >
                    Adicionar Exame
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'anotacoes' && (
          <div>
            {prontuario.anotacoes.length === 0 ? (
              <div className="bg-neutral-50 rounded-lg p-6 text-center">
                <MessageSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-700 mb-2">Sem anotações</h3>
                <p className="text-neutral-500 mb-4">
                  Ainda não foram adicionadas anotações para este paciente.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<FilePlus className="h-4 w-4" />}
                >
                  Adicionar Anotação
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {prontuario.anotacoes.map((item) => (
                  <Card key={item.id} className="border border-neutral-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-900">{formatData(item.data)}</span>
                      <span className="text-sm text-neutral-500">Responsável: {item.responsavel}</span>
                    </div>
                    <p className="text-neutral-700 whitespace-pre-line">{item.texto}</p>
                  </Card>
                ))}
                
                <div className="text-center mt-6">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<FilePlus className="h-4 w-4" />}
                  >
                    Adicionar Anotação
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProntuarioDetailPage;