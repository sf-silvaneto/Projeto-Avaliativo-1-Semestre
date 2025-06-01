// src/pages/prontuario/ProntuarioDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileEdit, ArrowLeft, Calendar, User, Phone, Mail, MapPin, FilePlus,
  FileText as FileTextIcon, Activity, Pill, FileImage, MessageSquare, Loader2,
  BedDouble, Microscope, Scissors, Users as UsersIcon, Stethoscope as StethoscopeIcon, ShieldCheck, Briefcase
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { buscarProntuarioPorId, registrarAltaInternacao } from '../../services/prontuarioService';
import { Prontuario, StatusProntuario, Genero, HistoricoMedico, Anotacao, Exame as ExameProntuario } from '../../types/prontuario'; // Adicionado HistoricoMedico, Anotacao, ExameProntuario
import { InternacaoDetalhada, ConsultaDetalhada, AnexoDetalhado, RegistrarAltaInternacaoRequest } from '../../types/prontuarioRegistros';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';


const ProntuarioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prontuario, setProntuario] = useState<Prontuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'consultas' | 'internacoes' | 'exames' | 'historicoGeral' | 'anotacoes'>('consultas');

  const [showAltaModal, setShowAltaModal] = useState(false);
  const [internacaoParaAlta, setInternacaoParaAlta] = useState<InternacaoDetalhada | null>(null);
  const [isSubmittingAlta, setIsSubmittingAlta] = useState(false);

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
    } catch (err: any) {
      console.error('Erro ao buscar prontuário:', err);
      setError(err.response?.data?.mensagem || 'Erro ao buscar dados do prontuário.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProntuario();
  }, [id]);

  const formatDateTime = (dataString?: string): string => {
    if (!dataString) return 'Data inválida';
    try {
      const date = new Date(dataString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      });
    } catch (e) { return 'Data inválida'; }
  };

  const formatDate = (dataString?: string): string => {
    if (!dataString) return 'Data inválida';
    try {
      const dateToParse = /^\d{4}-\d{2}-\d{2}$/.test(dataString) ? `${dataString}T00:00:00Z` : dataString; // Adicionado Z para UTC
      const date = new Date(dateToParse);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        timeZone: 'UTC' 
      });
    } catch (e) { return 'Data inválida'; }
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

  const renderStatusProntuario = (status?: StatusProntuario) => {
    if (!status) return null;
    const statusClasses = {
      [StatusProntuario.EM_ELABORACAO]: 'bg-blue-100 text-blue-800',
      [StatusProntuario.INTERNADO]: 'bg-red-100 text-red-800 animate-pulse',
      [StatusProntuario.ARQUIVADO]: 'bg-neutral-100 text-neutral-800',
    };
    const statusLabels = {
      [StatusProntuario.EM_ELABORACAO]: 'Em Elaboração',
      [StatusProntuario.INTERNADO]: 'Internado',
      [StatusProntuario.ARQUIVADO]: 'Arquivado',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const handleRegistrarAlta = async (dadosAlta: RegistrarAltaInternacaoRequest) => {
    if (!internacaoParaAlta || !internacaoParaAlta.id) return;
    setIsSubmittingAlta(true);
    setError(null);
    try {
        await registrarAltaInternacao(internacaoParaAlta.id.toString(), dadosAlta);
        setShowAltaModal(false);
        setInternacaoParaAlta(null);
        fetchProntuario();
    } catch (err: any) {
        setError(err.response?.data?.mensagem || "Erro ao registrar alta.");
    } finally {
        setIsSubmittingAlta(false);
    }
  };

  const renderAnexos = (anexos?: AnexoDetalhado[]) => {
    if (!anexos || anexos.length === 0) return <p className="text-xs text-neutral-500 italic">Nenhum anexo.</p>;
    return (
      <ul className="list-disc list-inside space-y-1 mt-1">
        {anexos.map(anexo => (
          <li key={anexo.id} className="text-xs">
            <a
              href={anexo.urlVisualizacao || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
              onClick={(e) => { if (!anexo.urlVisualizacao) {e.preventDefault(); alert("Lógica de download/visualização para: " + anexo.nomeOriginalArquivo);}}}
            >
              {anexo.nomeOriginalArquivo} ({anexo.tipoConteudo}, {anexo.tamanhoBytes ? (anexo.tamanhoBytes / 1024).toFixed(1) + ' KB' : 'Tamanho desconhecido'})
            </a>
          </li>
        ))}
      </ul>
    );
  };

  if (isLoading) {
    return (
      <div className="container-wide py-8 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto" />
          <p className="mt-4 text-neutral-600">Carregando dados do prontuário...</p>
        </div>
      </div>
    );
  }

  if (error && !prontuario) {
    return (
      <div className="container-wide py-8">
        <Alert type="error" title="Erro ao Carregar Prontuário" message={error} />
        <div className="mt-4">
          <Link to="/prontuarios">
            <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>Voltar</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!prontuario) {
    return (
      <div className="container-wide py-8">
        <Alert type="warning" title="Prontuário Não Encontrado" message="O prontuário solicitado não foi encontrado ou não existe." />
        <div className="mt-4">
          <Link to="/prontuarios">
            <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>Voltar</Button>
          </Link>
        </div>
      </div>
    );
  }

  const internacaoAtiva = prontuario.internacoes?.find(inter => !inter.dataAltaEfetiva);

  return (
    <div className="container-wide py-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center mb-1">
            <Link to="/prontuarios" className="text-neutral-500 hover:text-neutral-700 mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-neutral-900 leading-tight">
              Prontuário: {prontuario.paciente.nome}{' '}
              <span className="text-neutral-500 font-normal">(#{prontuario.numeroProntuario})</span>
            </h1>
          </div>
          <div className="flex items-center space-x-3 text-sm text-neutral-600 ml-7">
            <span>Início: {formatDate(prontuario.dataInicio)}</span>
            <span>Últ. Atualização: {formatDateTime(prontuario.dataUltimaAtualizacao)}</span>
            {renderStatusProntuario(prontuario.status)}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 items-start md:items-center">
          <Link to={`/prontuarios/${prontuario.id}/editar`}>
            <Button variant="secondary" size="sm" leftIcon={<FileEdit className="h-4 w-4" />}>
              Editar Dados do Prontuário
            </Button>
          </Link>
          <Button 
            variant="primary" 
            size="sm" 
            leftIcon={<FilePlus className="h-4 w-4" />}
            onClick={() => alert("Navegar para /prontuarios/"+prontuario.id+"/novo-registro (TODO)")}
          >
            Adicionar Novo Registro
          </Button>
        </div>
      </div>
      
      {error && <Alert type="error" title="Erro de Operação" message={error} className="mb-4" onClose={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-neutral-800 mb-3">Dados do Paciente</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                <DetailItem icon={<User size={16}/>} label="Nome" value={prontuario.paciente.nome} />
                <DetailItem icon={<Calendar size={16}/>} label="Nascimento" value={formatDate(prontuario.paciente.dataNascimento)} />
                <DetailItem icon={<UsersIcon size={16}/>} label="Gênero" value={renderGenero(prontuario.paciente.genero)} />
                <DetailItem icon={<Briefcase size={16}/>} label="CPF" value={prontuario.paciente.cpf} />
                <DetailItem icon={<Phone size={16}/>} label="Telefone" value={prontuario.paciente.telefone} />
                <DetailItem icon={<Mail size={16}/>} label="Email" value={prontuario.paciente.email} />
                <div className="md:col-span-2">
                  <DetailItem icon={<MapPin size={16}/>} label="Endereço" value={
                      `${prontuario.paciente.endereco.logradouro}, ${prontuario.paciente.endereco.numero}${prontuario.paciente.endereco.complemento ? ', '+prontuario.paciente.endereco.complemento : ''} - ${prontuario.paciente.endereco.bairro}, ${prontuario.paciente.endereco.cidade}/${prontuario.paciente.endereco.estado} (CEP: ${prontuario.paciente.endereco.cep})`
                  } />
                </div>
            </div>
             <div className="mt-4">
                <Link to={`/pacientes/${prontuario.paciente.id}`}>
                    <Button variant="link" size="sm" rightIcon={<ArrowLeft className="h-3 w-3 rotate-180"/>}>
                        Ver Cadastro Completo do Paciente
                    </Button>
                </Link>
            </div>
        </Card>
        
        <Card>
          <h2 className="text-lg font-semibold text-neutral-800 mb-3">Informações do Prontuário</h2>
            <DetailItem icon={<StethoscopeIcon size={16}/>} label="Médico Responsável Principal" value={`${prontuario.medicoResponsavel?.nomeCompleto || 'N/A'} (CRM: ${prontuario.medicoResponsavel?.crm || 'N/A'})`} />
            <DetailItem icon={<ShieldCheck size={16}/>} label="Criado por (Admin)" value={prontuario.administradorCriador?.nome || 'N/A'} />
            {prontuario.dataAltaAdministrativa && (
                 <DetailItem icon={<Calendar size={16}/>} label="Data de Arquivamento Adm." value={formatDate(prontuario.dataAltaAdministrativa)} />
            )}
            {internacaoAtiva && (
                <Button 
                    variant="success" 
                    size="sm" 
                    fullWidth 
                    className="mt-4"
                    onClick={() => { setInternacaoParaAlta(internacaoAtiva); setShowAltaModal(true); }}
                >
                    Registrar Alta da Internação Atual
                </Button>
            )}
        </Card>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tipos de Registro">
            <TabButton isActive={activeTab === 'consultas'} onClick={() => setActiveTab('consultas')} icon={<Activity />} label="Consultas" count={prontuario.consultas?.length} />
            <TabButton isActive={activeTab === 'internacoes'} onClick={() => setActiveTab('internacoes')} icon={<BedDouble />} label="Internações" count={prontuario.internacoes?.length} />
            <TabButton isActive={activeTab === 'exames'} onClick={() => setActiveTab('exames')} icon={<Microscope />} label="Exames" count={prontuario.examesRegistrados?.length} />
            <TabButton isActive={activeTab === 'historicoGeral'} onClick={() => setActiveTab('historicoGeral')} icon={<FileTextIcon />} label="Histórico Geral" count={prontuario.historicoGeral?.length} />
            <TabButton isActive={activeTab === 'anotacoes'} onClick={() => setActiveTab('anotacoes')} icon={<MessageSquare />} label="Anotações Gerais" count={prontuario.anotacoesGerais?.length} />
          </nav>
        </div>
      </div>
      
      <div className="animate-fade-in">
        {activeTab === 'consultas' && (
            <ListaDeConsultas consultas={prontuario.consultas || []} renderAnexos={renderAnexos} formatDateTime={formatDateTime} />
        )}
        {activeTab === 'internacoes' && (
            <ListaDeInternacoes internacoes={prontuario.internacoes || []} onAbrirModalAlta={(internacao) => {setInternacaoParaAlta(internacao); setShowAltaModal(true);}} renderAnexos={renderAnexos} formatDateTime={formatDateTime}/>
        )}
        {activeTab === 'exames' && (
            <ListaDeExames exames={prontuario.examesRegistrados || []} formatDate={formatDate} renderAnexos={renderAnexos} />
        )}
        {activeTab === 'historicoGeral' && (
            <ListaDeHistoricoGeral historicos={prontuario.historicoGeral || []} formatDateTime={formatDateTime} />
        )}
        {activeTab === 'anotacoes' && (
            <ListaDeAnotacoesGerais anotacoes={prontuario.anotacoesGerais || []} formatDateTime={formatDateTime} />
        )}
      </div>

      {showAltaModal && internacaoParaAlta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70 p-4 overflow-y-auto">
          <Card className="w-full max-w-lg bg-white my-8">
            <h3 className="text-lg font-medium mb-4 text-neutral-800">Registrar Alta para Internação de {formatDateTime(internacaoParaAlta.dataAdmissao)}</h3>
            <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const medicoIdInput = formData.get('medicoResponsavelAltaId');

                if (!medicoIdInput || medicoIdInput.toString().trim() === '') {
                    setError("ID do Médico responsável pela alta é obrigatório.");
                    return;
                }
                const dados: RegistrarAltaInternacaoRequest = {
                    dataAltaEfetiva: formData.get('dataAltaEfetiva') as string,
                    resumoAlta: formData.get('resumoAlta') as string,
                    medicoResponsavelAltaId: Number(medicoIdInput),
                };
                if (!dados.dataAltaEfetiva || !dados.resumoAlta) {
                     setError("Data da alta e resumo são obrigatórios.");
                     return;
                }
                await handleRegistrarAlta(dados);
            }}>
                <Input label="Data e Hora da Alta Efetiva*" name="dataAltaEfetiva" type="datetime-local" required defaultValue={new Date().toISOString().slice(0,16)} />
                <Textarea label="Resumo da Alta*" name="resumoAlta" rows={4} required />
                <Input label="ID do Médico Responsável pela Alta*" name="medicoResponsavelAltaId" type="number" required placeholder="Digite o ID do médico"/>
                <div className="mt-6 flex justify-end space-x-2">
                    <Button type="button" variant="secondary" onClick={() => setShowAltaModal(false)} disabled={isSubmittingAlta}>Voltar</Button>
                    <Button type="submit" variant="primary" isLoading={isSubmittingAlta}>Salvar Alta</Button>
                </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

const DetailItem: React.FC<{ icon?: React.ReactNode; label: string; value?: string | React.ReactNode }> = ({ icon, label, value }) => (
    <div className="py-1">
        <dt className="text-xs font-medium text-neutral-500 uppercase flex items-center">
            {icon && <span className="mr-2 shrink-0">{icon}</span>}
            {label}
        </dt>
        <dd className="text-sm text-neutral-800 mt-0.5 ml-6 break-words">{value || '-'}</dd>
    </div>
);

const TabButton: React.FC<{isActive: boolean, onClick: () => void, icon: React.ReactNode, label: string, count?: number}> = ({isActive, onClick, icon, label, count}) => (
    <button
        className={`flex items-center py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${ isActive ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}
        onClick={onClick}
        role="tab"
        aria-selected={isActive}
    >
        {icon} <span className="ml-1.5">{label}</span> {typeof count === 'number' && count > 0 && <span className="ml-1.5 bg-neutral-200 text-neutral-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{count}</span>}
    </button>
);

const ListaDeConsultas: React.FC<{consultas: ConsultaDetalhada[], renderAnexos: (anexos?: AnexoDetalhado[]) => JSX.Element | null, formatDateTime: (dateStr?: string) => string}> = ({consultas, renderAnexos, formatDateTime}) => {
    if (!consultas || consultas.length === 0) return <Card><p className="text-neutral-500 italic">Nenhuma consulta registrada.</p></Card>;
    return (
        <div className="space-y-4">
            {consultas.sort((a,b) => new Date(b.dataHoraConsulta).getTime() - new Date(a.dataHoraConsulta).getTime()).map(c => (
                <Card key={c.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-primary-700">Consulta em {formatDateTime(c.dataHoraConsulta)}</h4>
                    <p className="text-xs text-neutral-500 mb-2">Responsável: {c.responsavelNomeCompleto} {c.responsavelCRM && `(CRM: ${c.responsavelCRM})`}</p>
                    
                    {c.motivoConsulta && <DetailItem label="Motivo" value={c.motivoConsulta} />}
                    {c.queixasPrincipais && <DetailItem label="Queixas Principais" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-50 p-2 rounded">{c.queixasPrincipais}</pre>} />}
                    
                    {c.detalhesConsulta && (
                        <div className="mt-3">
                            <h5 className="text-sm font-semibold text-neutral-700 mb-1">Detalhes da Consulta:</h5>
                            <pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-50 p-3 rounded-md border border-neutral-200">{c.detalhesConsulta}</pre>
                        </div>
                    )}
                    {c.observacoesConsulta && (
                        <div className="mt-3">
                            <h5 className="text-sm font-semibold text-neutral-700 mb-1">Observações:</h5>
                            <pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-50 p-3 rounded-md border border-neutral-200">{c.observacoesConsulta}</pre>
                        </div>
                    )}

                    {c.exameFisico && <DetailItem label="Exame Físico" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-50 p-2 rounded">{c.exameFisico}</pre>} />}
                    {c.hipoteseDiagnostica && <DetailItem label="Hipótese Diagnóstica" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-50 p-2 rounded">{c.hipoteseDiagnostica}</pre>} />}
                    {c.condutaPlanoTerapeutico && <DetailItem label="Conduta / Plano" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-50 p-2 rounded">{c.condutaPlanoTerapeutico}</pre>} />}
                    
                    {(c.pressaoArterial || c.temperatura || c.frequenciaCardiaca || c.saturacao) && <h5 className="text-xs font-medium text-neutral-600 mt-3 mb-1">Sinais Vitais Registrados:</h5>}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1">
                        {c.pressaoArterial && <DetailItem label="P.A." value={c.pressaoArterial}/>}
                        {c.temperatura && <DetailItem label="Temp." value={`${c.temperatura}°C`}/>}
                        {c.frequenciaCardiaca && <DetailItem label="F.C." value={`${c.frequenciaCardiaca} bpm`}/>}
                        {c.saturacao && <DetailItem label="Sat O₂" value={`${c.saturacao}%`}/>}
                    </div>
                    
                    {c.anexos && c.anexos.length > 0 && <div className="mt-3 pt-2 border-t border-neutral-100"><h5 className="text-xs font-medium text-neutral-600">Anexos da Consulta:</h5>{renderAnexos(c.anexos)}</div>}
                </Card>
            ))}
        </div>
    );
};

const ListaDeInternacoes: React.FC<{internacoes: InternacaoDetalhada[], onAbrirModalAlta: (i: InternacaoDetalhada) => void, renderAnexos: (anexos?: AnexoDetalhado[]) => JSX.Element | null, formatDateTime: (dateStr?: string) => string}> = ({internacoes, onAbrirModalAlta, renderAnexos, formatDateTime}) => {
    if (!internacoes || internacoes.length === 0) return <Card><p className="text-neutral-500 italic">Nenhuma internação registrada.</p></Card>;
    return (
        <div className="space-y-4">
            {internacoes.sort((a,b) => new Date(b.dataAdmissao).getTime() - new Date(a.dataAdmissao).getTime()).map(i => (
                <Card key={i.id} className={`shadow-sm hover:shadow-md transition-shadow ${!i.dataAltaEfetiva ? "border-l-4 border-red-500" : "border-l-4 border-green-500"}`}>
                    <h4 className="font-semibold text-primary-700">
                        Internação: {formatDateTime(i.dataAdmissao)}
                        {i.dataAltaEfetiva ? ` - Alta em: ${formatDateTime(i.dataAltaEfetiva)}` : <span className="text-red-600 font-bold"> (ATIVA)</span>}
                    </h4>
                    <p className="text-xs text-neutral-500 mb-2">Admissão por: {i.responsavelAdmissaoNomeCompleto} {i.responsavelAdmissaoCRM && `(CRM: ${i.responsavelAdmissaoCRM})`}</p>
                    {i.motivoInternacao && <DetailItem label="Motivo da Internação" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-50 p-2 rounded">{i.motivoInternacao}</pre>} />}
                    {i.historiaDoencaAtual && <DetailItem label="História da Doença Atual" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-50 p-2 rounded">{i.historiaDoencaAtual}</pre>} />}
                    {i.dataAltaPrevista && <DetailItem label="Alta Prevista" value={formatDateTime(i.dataAltaPrevista)} />}
                    {i.resumoAlta && <DetailItem label="Resumo da Alta" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-50 p-2 rounded">{i.resumoAlta}</pre>} />}
                    {i.medicoResponsavelAltaNome && <DetailItem label="Médico da Alta" value={i.medicoResponsavelAltaNome} />}
                    {!i.dataAltaEfetiva && (
                        <Button variant='link' size='sm' onClick={() => onAbrirModalAlta(i)} className="mt-3 text-red-600 hover:text-red-700 p-0 font-medium">Registrar Alta desta Internação</Button>
                    )}
                     {i.anexos && i.anexos.length > 0 && <div className="mt-2"><h5 className="text-xs font-medium text-neutral-600">Anexos da Internação:</h5>{renderAnexos(i.anexos)}</div>}
                </Card>
            ))}
        </div>
    );
};

const ListaDeExames: React.FC<{exames: ExameProntuario[], formatDate: (dateStr?: string) => string, renderAnexos: (anexos?: AnexoDetalhado[]) => JSX.Element | null}> = ({exames, formatDate, renderAnexos}) => {
    if (!exames || exames.length === 0) return <Card><p className="text-neutral-500 italic">Nenhum exame registrado.</p></Card>;
    return (
        <div className="space-y-4">
            {exames.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map(ex => (
                <Card key={ex.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-primary-700">{ex.nome} - {formatDate(ex.data)}</h4>
                    <DetailItem label="Resultado" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-50 p-2 rounded">{ex.resultado}</pre>} />
                    {ex.observacoes && <DetailItem label="Observações" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-50 p-2 rounded">{ex.observacoes}</pre>} />}
                    {ex.anexos && ex.anexos.length > 0 && <div className="mt-2"><h5 className="text-xs font-medium text-neutral-600">Anexos do Exame:</h5>{renderAnexos(ex.anexos as AnexoDetalhado[])}</div>}
                     {ex.arquivoUrl && (!ex.anexos || ex.anexos.length === 0) && 
                        <div className="mt-2">
                            <h5 className="text-xs font-medium text-neutral-600">Anexo (Legado):</h5>
                            <a href={ex.arquivoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-xs">{ex.arquivoUrl.split('/').pop()}</a>
                        </div>
                     }
                </Card>
            ))}
        </div>
    );
};

const ListaDeHistoricoGeral: React.FC<{historicos: HistoricoMedico[], formatDateTime: (dateStr?: string) => string}> = ({historicos, formatDateTime}) => {
    if (!historicos || historicos.length === 0) return <Card><p className="text-neutral-500 italic">Nenhum histórico geral registrado.</p></Card>;
    return (
        <div className="space-y-4">
            {historicos.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map(hist => (
                <Card key={hist.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold text-primary-700">Registro Geral</h4>
                        <span className="text-xs text-neutral-500">{formatDateTime(hist.data)}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mb-2">Responsável: {hist.responsavel}</p>
                    <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-sans p-2 bg-neutral-50 rounded">{hist.descricao}</pre>
                </Card>
            ))}
        </div>
    );
};

const ListaDeAnotacoesGerais: React.FC<{anotacoes: Anotacao[], formatDateTime: (dateStr?: string) => string}> = ({anotacoes, formatDateTime}) => {
     if (!anotacoes || anotacoes.length === 0) return <Card><p className="text-neutral-500 italic">Nenhuma anotação geral registrada.</p></Card>;
    return (
        <div className="space-y-4">
            {anotacoes.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map(anot => (
                <Card key={anot.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold text-primary-700">Anotação</h4>
                        <span className="text-xs text-neutral-500">{formatDateTime(anot.data)}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mb-2">Responsável: {anot.responsavel}</p>
                    <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-sans p-2 bg-neutral-50 rounded">{anot.texto}</pre>
                </Card>
            ))}
        </div>
    );
};

export default ProntuarioDetailPage;