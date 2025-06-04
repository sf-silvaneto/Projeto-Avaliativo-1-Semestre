import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Calendar, User, Phone, Mail, MapPin, FilePlus, Plus,
  FileText as FileTextIcon, Activity, Pill, Loader2,
  Microscope, Scissors, Users as UsersIcon, Stethoscope as StethoscopeIcon,
  ShieldCheck, Briefcase, Send, HeartPulse, Palette, ShieldQuestion, Building, StickyNote, CreditCard, ListFilter
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { buscarProntuarioPorId } from '../../services/prontuarioService';
import { Prontuario, HistoricoMedico } from '../../types/prontuario';
import { Paciente as PacienteCompleto, Genero as PacienteGeneroEnum, RacaCor, TipoSanguineo, Endereco as PacienteEndereco } from '../../types/paciente';
import {
    ConsultaDetalhada,
    ExameDetalhado,
    ProcedimentoDetalhado,
    EncaminhamentoDetalhado
} from '../../types/prontuarioRegistros';

const especialidadeResumos: Record<string, string> = {
  CARDIOLOGIA: "Especialidade médica que se ocupa do diagnóstico e tratamento das doenças que acometem o coração e os grandes vasos.",
  CLINICA_GERAL: "Atendimento primário e geral de pacientes adultos, focando no diagnóstico e tratamento de diversas doenças.",
  DERMATOLOGIA: "Cuidados com a pele, cabelos e unhas, tratando doenças e realizando procedimentos estéticos.",
  ENDOCRINOLOGIA: "Tratamento de distúrbios hormonais e metabólicos, como diabetes e problemas de tireoide.",
  GASTROENTEROLOGIA: "Diagnóstico e tratamento de doenças do sistema digestório.",
  GERIATRIA: "Cuidados com a saúde de idosos, prevenindo e tratando doenças comuns nessa faixa etária.",
  GINECOLOGIA_OBSTETRICIA: "Saúde da mulher, incluindo sistema reprodutor, gravidez e parto.",
  HEMATOLOGIA: "Estudo e tratamento de doenças do sangue e órgãos hematopoiéticos.",
  INFECTOLOGIA: "Diagnóstico, tratamento e prevenção de doenças infecciosas e parasitárias.",
  NEFROLOGIA: "Tratamento de doenças dos rins, como insuficiência renal e hipertensão arterial.",
  NEUROLOGIA: "Diagnóstico e tratamento de doenças do sistema nervoso central e periférico.",
  OFTALMOLOGIA: "Cuidados com a saúde dos olhos e da visão, tratando doenças e realizando cirurgias.",
  ONCOLOGIA: "Diagnóstico e tratamento de câncer, utilizando quimioterapia, radioterapia e outras terapias.",
  ORTOPEDIA_E_TRAUMATOLOGIA: "Tratamento de lesões e doenças do sistema locomotor (ossos, músculos, articulações).",
  OTORRINOLARINGOLOGIA: "Diagnóstico e tratamento de doenças do ouvido, nariz e garganta.",
  PEDIATRIA: "Cuidados com a saúde de crianças e adolescentes, desde o nascimento até a fase adulta inicial.",
  PNEUMOLOGIA: "Diagnóstico e tratamento de doenças do sistema respiratório, como asma e pneumonia.",
  PSIQUIATRIA: "Diagnóstico, tratamento e prevenção de transtornos mentais, emocionais e comportamentais.",
  REUMATOLOGIA: "Tratamento de doenças reumáticas que afetam articulações, ossos, músculos e tecido conjuntivo.",
  UROLOGIA: "Diagnóstico e tratamento de doenças do sistema urinário de homens e mulheres, e do sistema reprodutor masculino."
};

const formatEspecialidadeDisplay = (especialidade?: string): string => {
  if (!especialidade) return '';
  return especialidade
    .toLowerCase()
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getEspecialidadeKeyForResumo = (especialidade?: string): string => {
    if (!especialidade) return '';
    return especialidade.toUpperCase().replace(/ /g, '_');
};

const renderMedicoInfo = (nome?: string, especialidade?: string, crm?: string): React.ReactNode => {
    if (!nome) return "Não informado";

    const parts: React.ReactNode[] = [];
    parts.push(<span key={`${nome}-nome`}>{nome}</span>);

    if (especialidade) {
        parts.push(
            <span key={`${nome}-especialidade`} className="cursor-help" title={especialidadeResumos[getEspecialidadeKeyForResumo(especialidade)] || "Resumo da especialidade não disponível."}>
                {formatEspecialidadeDisplay(especialidade)}
            </span>
        );
    }

    if (crm) {
        parts.push(<span key={`${nome}-crm`}>{`CRM: ${crm}`}</span>);
    }

    return parts.reduce((acc, part, index) => {
        if (index === 0) return [part];
        return [...acc, <span key={`sep-${nome}-${index}`} className="mx-1">|</span>, part];
    }, [] as React.ReactNode[]);
};


interface HistoricoUnificadoItem {
  id: string;
  tipo: 'CONSULTA' | 'EXAME' | 'PROCEDIMENTO' | 'ENCAMINHAMENTO' | 'HISTORICO_GERAL';
  data: string;
  dataOriginal: any;
  titulo?: string;
  icone?: React.ReactNode;
}

type TabKeys = 'historicoUnificado' | 'consultas' | 'exames' | 'procedimentos' | 'encaminhamentos';


const ProntuarioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [prontuario, setProntuario] = useState<Prontuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKeys>('historicoUnificado');

  useEffect(() => {
    const state = location.state as { prontuarioSuccess?: boolean, message?: string };
    if (state?.prontuarioSuccess && state?.message) {
      setSuccessMessage(state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

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
    if (!dataString || typeof dataString !== 'string') {
      return 'Data inválida';
    }
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
        const date = new Date(dataString + 'T00:00:00Z'); // Assegura que é UTC se for apenas data
        if (isNaN(date.getTime())) {
          return 'Data inválida';
        }
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          timeZone: 'UTC', // Mostra a data como ela é, sem conversão de fuso para este formato
        });
      } else {
        // Se for uma string de data e hora completa (ISO 8601), converte para o fuso local
        const date = new Date(dataString);
        if (isNaN(date.getTime())) {
          return 'Data inválida';
        }
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          timeZone: 'America/Sao_Paulo', // Converte para o fuso horário de São Paulo
        });
      }
    } catch (e) {
      console.error("Erro ao formatar data:", dataString, e);
      return 'Data inválida';
    }
  };

  const fetchProntuario = useCallback(async () => {
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
      setActiveTab('historicoUnificado');
    } catch (err: any) {
      console.error('Erro ao buscar prontuário:', err);
      setError(err.response?.data?.mensagem || 'Erro ao buscar dados do prontuário.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProntuario();
  }, [fetchProntuario]);

  const historicoUnificado = useMemo(() => {
    if (!prontuario) return [];
    const itens: HistoricoUnificadoItem[] = [];

    prontuario.consultas?.forEach(c => itens.push({
        id: `consulta-${c.id}`, tipo: 'CONSULTA', data: c.dataHoraConsulta, dataOriginal: c, titulo: `Consulta`, icone: <Activity className="h-5 w-5" />
    }));
    prontuario.examesRegistrados?.forEach(e => itens.push({
        id: `exame-${e.id}`, tipo: 'EXAME', data: e.data, dataOriginal: e, titulo: `Exame: ${e.nome || 'N/D'}`, icone: <Microscope className="h-5 w-5" />
    }));
    prontuario.procedimentosRegistrados?.forEach(p => itens.push({
        id: `procedimento-${p.id}`, tipo: 'PROCEDIMENTO', data: p.dataProcedimento, dataOriginal: p, titulo: `Procedimento: ${(p.descricaoProcedimento || '').substring(0,35)}${(p.descricaoProcedimento && p.descricaoProcedimento.length > 35) ? '...' : ''}`, icone: <Scissors className="h-5 w-5" />
    }));
    prontuario.encaminhamentosRegistrados?.forEach(enc => itens.push({
        id: `encaminhamento-${enc.id}`, tipo: 'ENCAMINHAMENTO', data: enc.dataEncaminhamento, dataOriginal: enc, titulo: `Encaminhamento para ${enc.especialidadeDestino || 'N/D'}`, icone: <Send className="h-5 w-5" />
    }));
    prontuario.historicoGeral?.forEach(hg => itens.push({
        id: `histgeral-${hg.id}`, tipo: 'HISTORICO_GERAL', data: hg.data, dataOriginal: hg, titulo: `Registro Geral: ${(hg.descricao || '').substring(0,30)}${(hg.descricao && hg.descricao.length > 30) ? '...' : ''}`, icone: <StickyNote className="h-5 w-5" />
    }));

    return itens.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [prontuario]);

  const formatEnum = (value?: string, enumType?: any) => {
    if (!value) return 'Não informado';
    if (enumType === PacienteGeneroEnum) {
        const generos = { MASCULINO: 'Masculino', FEMININO: 'Feminino', OUTRO: 'Outro', NAO_INFORMADO: 'Não Informado' };
        return generos[value as keyof typeof generos] || value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replace(/_/g, " ");
    }
    if (enumType === RacaCor) {
        const racas = { BRANCA: 'Branca', PRETA: 'Preta', PARDA: 'Parda', AMARELA: 'Amarela', INDIGENA: 'Indígena', NAO_DECLARADO: 'Não Declarado'};
        return racas[value as keyof typeof racas] || value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replace(/_/g, " ");
    }
     if (enumType === TipoSanguineo) {
        const tipos = { A_POSITIVO: 'A+', A_NEGATIVO: 'A-', B_POSITIVO: 'B+', B_NEGATIVO: 'B-', AB_POSITIVO: 'AB+', AB_NEGATIVO: 'AB-', O_POSITIVO: 'O+', O_NEGATIVO: 'O-', NAO_SABE: 'Não Sabe', NAO_INFORMADO: 'Não Informado'};
        return tipos[value as keyof typeof tipos] || value.replace(/_/g, " ");
    }
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replace(/_/g, " ");
  };

  const formatCPF = (cpf?: string): string => {
    if (!cpf) return '-';
    const digits = cpf.replace(/\D/g, '');
    if (digits.length === 11) return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    return cpf;
  };

  const formatTelefone = (telefone?: string): string => {
    if (!telefone) return '-';
    const digits = telefone.replace(/\D/g, '');
    const len = digits.length;
    if (len === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    if (len === 11) return digits.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
    return telefone;
  };

  const renderPacienteCompleto = (pacienteData?: PacienteCompleto) => {
    if (!pacienteData) return null;
    const p = pacienteData;
    const e = p.endereco || {} as PacienteEndereco;

    // ***** INÍCIO DA CORREÇÃO *****
    // Construir a string de endereço em uma variável separada
    const enderecoFormatado = `${e.logradouro || ''}, ${e.numero || ''}${e.complemento ? `, ${e.complemento}` : ''} - ${e.bairro || ''}, ${e.cidade || ''}/${e.estado || ''} (CEP: ${e.cep || ''})`;
    // ***** FIM DA CORREÇÃO *****

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <DetailItem icon={<User size={16}/>} label="Nome Completo" value={p.nome} />
            <DetailItem icon={<Calendar size={16}/>} label="Data de Nascimento" value={formatDate(p.dataNascimento)} />
            <DetailItem icon={<FileTextIcon size={16}/>} label="CPF" value={formatCPF(p.cpf)} />
            <DetailItem icon={<FileTextIcon size={16}/>} label="RG" value={p.rg} />
            <DetailItem icon={<UsersIcon size={16}/>} label="Gênero" value={formatEnum(p.genero, PacienteGeneroEnum)} />
            <DetailItem icon={<Phone size={16}/>} label="Telefone" value={formatTelefone(p.telefone)} />
            <DetailItem icon={<Mail size={16}/>} label="Email" value={p.email} />
            <DetailItem icon={<User size={16}/>} label="Nome da Mãe" value={p.nomeMae} />
            <DetailItem icon={<User size={16}/>} label="Nome do Pai" value={p.nomePai} />
            <DetailItem icon={<Calendar size={16}/>} label="Data de Cadastro" value={formatDate(p.dataEntrada)} />
            <DetailItem icon={<CreditCard size={16}/>} label="Cartão SUS" value={p.cartaoSus} />
            <DetailItem icon={<Palette size={16}/>} label="Raça/Cor" value={formatEnum(p.racaCor, RacaCor)} />
            <DetailItem icon={<HeartPulse size={16}/>} label="Tipo Sanguíneo" value={formatEnum(p.tipoSanguineo, TipoSanguineo)} />
            <DetailItem icon={<Building size={16}/>} label="Nacionalidade" value={p.nacionalidade} />
            <DetailItem icon={<Briefcase size={16}/>} label="Ocupação" value={p.ocupacao} />
            <div className="sm:col-span-2 lg:col-span-3">
                 {/* ***** INÍCIO DA CORREÇÃO ***** */}
                 {/* Usar a variável aqui */}
                 <DetailItem icon={<MapPin size={16}/>} label="Endereço" value={enderecoFormatado} />
                 {/* ***** FIM DA CORREÇÃO ***** */}
            </div>
             <div className="lg:col-span-3 mt-2 space-y-3">
                <DetailItem icon={<ShieldQuestion size={16}/>} label="Alergias Declaradas" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-50 p-2.5 rounded-md border border-neutral-200">{p.alergiasDeclaradas || 'Não informado'}</pre>} />
                <DetailItem icon={<Activity size={16}/>} label="Comorbidades Declaradas" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-50 p-2.5 rounded-md border border-neutral-200">{p.comorbidadesDeclaradas || 'Não informado'}</pre>} />
                <DetailItem icon={<Pill size={16}/>} label="Medicamentos em Uso Contínuo" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-50 p-2.5 rounded-md border border-neutral-200">{p.medicamentosContinuos || 'Não informado'}</pre>} />
            </div>
        </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-wide py-8 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto" />
          <p className="mt-4 text-neutral-600">Carregando dados do prontuário...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-wide py-8">
        <Alert type="error" title="Erro ao Carregar Prontuário" message={error} />
        <div className="mt-4">
          <Link to="/prontuarios">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>Voltar para Prontuários</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!prontuario || !prontuario.paciente) {
    return (
      <div className="container-wide py-8">
        <Alert type="warning" title="Dados Incompletos" message="Não foi possível carregar os dados completos do prontuário ou paciente." />
        <div className="mt-4">
          <Link to="/prontuarios">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>Voltar para Prontuários</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const medicoResp = prontuario.medicoResponsavel;
  const medicoRespDisplay = renderMedicoInfo(medicoResp?.nomeCompleto, medicoResp?.especialidade, medicoResp?.crm);


  return (
    <div className="container-wide py-8">
      {successMessage && (
        <Alert type="success" title="Operação Realizada!" message={successMessage} className="mb-6" onClose={() => setSuccessMessage(null)} />
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="flex-grow">
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 leading-tight mb-1">
            Prontuário: {prontuario.paciente.nome}
            </h1>
            <span className="text-neutral-500 font-normal text-sm">(#{prontuario.numeroProntuario})</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-stretch md:items-center flex-shrink-0">
          <Link to="/prontuarios" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              className="w-full justify-center"
            >
              Voltar
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/prontuarios/novo')}
            fullWidth className="w-full sm:w-auto justify-center"
          >
            Cadastrar Registro
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <Card className="lg:col-span-8 bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold text-primary-700 mb-4 border-b border-primary-200 pb-3 flex items-center">
            <User className="inline-block mr-2 text-primary-600" size={22}/> Dados do Paciente
          </h2>
           {renderPacienteCompleto(prontuario.paciente as PacienteCompleto)}
        </Card>

        <Card className="lg:col-span-4 bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold text-primary-700 mb-4 border-b border-primary-200 pb-3 flex items-center">
            <FileTextIcon className="inline-block mr-2 text-primary-600" size={22}/> Informações do Prontuário
          </h2>
          <div className="space-y-5">
            <DetailItem
                icon={<StethoscopeIcon size={18}/>}
                label="Médico Responsável Principal"
                value={medicoRespDisplay} 
            />
            <DetailItem icon={<User size={18}/>} label="Criado por (Admin)" value={prontuario.administradorCriador?.nome || 'N/A'} />
            <DetailItem icon={<Calendar size={18}/>} label="Data de Criação do Prontuário" value={formatDate(prontuario.createdAt)} /> {/* Alterado de prontuario.dataInicio */}
            <DetailItem icon={<Calendar size={18}/>} label="Última Atualização" value={formatDateTime(prontuario.dataUltimaAtualizacao)} />
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <div className="border-b border-neutral-300">
          <nav className="-mb-px flex space-x-1 sm:space-x-3 overflow-x-auto" aria-label="Tipos de Registro">
            <TabButton isActive={activeTab === 'historicoUnificado'} onClick={() => setActiveTab('historicoUnificado')} icon={<ListFilter />} label="Histórico Completo" count={historicoUnificado.length} />
            <TabButton isActive={activeTab === 'consultas'} onClick={() => setActiveTab('consultas')} icon={<Activity />} label="Consultas" count={prontuario.consultas?.length} />
            <TabButton isActive={activeTab === 'exames'} onClick={() => setActiveTab('exames')} icon={<Microscope />} label="Exames" count={prontuario.examesRegistrados?.length} />
            <TabButton isActive={activeTab === 'procedimentos'} onClick={() => setActiveTab('procedimentos')} icon={<Scissors />} label="Procedimentos" count={prontuario.procedimentosRegistrados?.length} />
            <TabButton isActive={activeTab === 'encaminhamentos'} onClick={() => setActiveTab('encaminhamentos')} icon={<Send />} label="Encaminhamentos" count={prontuario.encaminhamentosRegistrados?.length} />
          </nav>
        </div>
      </div>

      <div className="animate-fade-in mt-6">
        {activeTab === 'historicoUnificado' && (
            <ListaHistoricoUnificado itens={historicoUnificado} formatDateTime={formatDateTime} formatDate={formatDate} />
        )}
        {activeTab === 'consultas' && (
            <ListaDeConsultas consultas={prontuario.consultas || []} formatDateTime={formatDateTime} formatDate={formatDate} />
        )}
        {activeTab === 'exames' && (
            <ListaDeExames exames={prontuario.examesRegistrados || []} formatDate={formatDate} formatDateTime={formatDateTime} />
        )}
        {activeTab === 'procedimentos' && (
            <ListaDeProcedimentos procedimentos={prontuario.procedimentosRegistrados || []} formatDateTime={formatDateTime} formatDate={formatDate}/>
        )}
        {activeTab === 'encaminhamentos' && (
            <ListaDeEncaminhamentos encaminhamentos={prontuario.encaminhamentosRegistrados || []} formatDateTime={formatDateTime} formatDate={formatDate}/>
        )}
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ icon?: React.ReactNode; label: string; value?: string | React.ReactNode }> = ({ icon, label, value }) => (
    <div>
        <dt className="text-xs font-semibold text-neutral-500 uppercase flex items-center mb-0.5 tracking-wide">
            {icon && <span className="mr-2 shrink-0 text-neutral-400">{icon}</span>}
            {label}
        </dt>
        <dd className="text-sm text-neutral-700 break-words ml-7">{value || <span className="italic text-neutral-400">Não informado</span>}</dd>
    </div>
);

const TabButton: React.FC<{isActive: boolean, onClick: () => void, icon: React.ReactNode, label: string, count?: number}> = ({isActive, onClick, icon, label, count}) => (
    <button
        className={`group flex items-center py-3 px-3 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-150 ease-in-out
                      ${ isActive
                          ? 'border-primary-600 text-primary-700'
                          : 'border-transparent text-neutral-600 hover:text-primary-700 hover:border-primary-300'
                      }`}
        onClick={onClick}
        role="tab"
        aria-selected={isActive}
    >
        {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 ${isActive ? 'text-primary-600': 'text-neutral-500 group-hover:text-primary-600'}`})}
        <span className="ml-2">{label}</span>
        {typeof count === 'number' && count > 0 &&
            <span className={`ml-2.5 text-xs font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-700 group-hover:bg-primary-100 group-hover:text-primary-700'}`}>
                {count}
            </span>
        }
    </button>
);

const RenderHistoricoItem: React.FC<{item: HistoricoUnificadoItem, formatDateTime: Function, formatDate: Function}> = ({ item, formatDateTime, formatDate }) => {
    
    switch (item.tipo) {
        case 'CONSULTA':
            const c = item.dataOriginal as ConsultaDetalhada;
            const medicoConsulta = renderMedicoInfo(c.responsavelNomeCompleto, (c as any).responsavelEspecialidade, c.responsavelCRM);
            return (
                <div className="space-y-3">
                    <DetailItem label="Responsável" value={medicoConsulta} />
                    {c.motivoConsulta && <DetailItem label="Motivo" value={c.motivoConsulta} />}
                    {c.queixasPrincipais && <DetailItem label="Queixas Principais" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-100 p-3 rounded-md border border-neutral-200">{c.queixasPrincipais}</pre>} />}
                    {(c.pressaoArterial || c.temperatura || c.frequenciaCardiaca || c.saturacao) && <h5 className="text-sm font-semibold text-neutral-700 mt-3 mb-1">Sinais Vitais:</h5>}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                        {c.pressaoArterial && <DetailItem label="P.A." value={c.pressaoArterial}/>}
                        {c.temperatura && <DetailItem label="Temp." value={`${c.temperatura}°C`}/>}
                        {c.frequenciaCardiaca && <DetailItem label="F.C." value={`${c.frequenciaCardiaca} bpm`}/>}
                        {c.saturacao && <DetailItem label="Sat O₂" value={`${c.saturacao}%`}/>}
                    </div>
                    {c.exameFisico && <DetailItem label="Exame Físico" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-100 p-3 rounded-md border border-neutral-200">{c.exameFisico}</pre>} />}
                    {c.hipoteseDiagnostica && <DetailItem label="Hipótese Diagnóstica" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-100 p-3 rounded-md border border-neutral-200">{c.hipoteseDiagnostica}</pre>} />}
                    {c.condutaPlanoTerapeutico && <DetailItem label="Conduta / Plano" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-100 p-3 rounded-md border border-neutral-200">{c.condutaPlanoTerapeutico}</pre>} />}
                    {c.detalhesConsulta && <DetailItem label="Detalhes Adicionais" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-100 p-3 rounded-md border border-neutral-200">{c.detalhesConsulta}</pre>} />}
                    {c.observacoesConsulta && <DetailItem label="Observações" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-100 p-3 rounded-md border border-neutral-200">{c.observacoesConsulta}</pre>} />}
                </div>
            );
        case 'EXAME':
            const ex = item.dataOriginal as ExameDetalhado;
            const medicoExameNome = (ex as any).medicoResponsavelExameNome;
            const medicoExameEspecialidade = (ex as any).medicoResponsavelExameEspecialidade;
            const medicoExameCRM = (ex as any).medicoResponsavelExameCRM;
            const medicoExameInfo = medicoExameNome ? renderMedicoInfo(medicoExameNome, medicoExameEspecialidade, medicoExameCRM) : null;
            
            return (
                <div className="space-y-3">
                    {medicoExameInfo && <DetailItem label="Médico do Exame" value={medicoExameInfo} />}
                    {!medicoExameInfo && (ex as any).nomeResponsavelDisplay && <DetailItem label="Registrado por" value={(ex as any).nomeResponsavelDisplay} />}
                    <DetailItem label="Resultado" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-100 p-3 rounded-md border border-neutral-200">{ex.resultado}</pre>} />
                    {ex.observacoes && <DetailItem label="Observações" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-100 p-3 rounded-md border border-neutral-200">{ex.observacoes}</pre>} />}
                </div>
            );
        case 'PROCEDIMENTO':
            const proc = item.dataOriginal as ProcedimentoDetalhado;
            const medicoProcedimentoNome = proc.medicoExecutorNome;
            const medicoProcedimentoEspecialidade = (proc as any).medicoExecutorEspecialidade;
            const medicoProcedimentoCRM = (proc as any).medicoExecutorCRM;
            const medicoProcedimentoInfo = medicoProcedimentoNome ? renderMedicoInfo(medicoProcedimentoNome, medicoProcedimentoEspecialidade, medicoProcedimentoCRM) : null;

            return (
                <div className="space-y-3">
                    {medicoProcedimentoInfo ? <DetailItem label="Médico Executor" value={medicoProcedimentoInfo} /> : <DetailItem label="Médico Executor" value="Não informado" />}
                    {!medicoProcedimentoInfo && (proc as any).nomeResponsavelDisplay && <DetailItem label="Registrado por" value={(proc as any).nomeResponsavelDisplay} />}
                    <DetailItem label="Descrição" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-100 p-3 rounded-md border border-neutral-200">{proc.descricaoProcedimento}</pre>} />
                    {proc.relatorioProcedimento && <DetailItem label="Relatório" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-100 p-3 rounded-md border border-neutral-200">{proc.relatorioProcedimento}</pre>} />}
                </div>
            );
        case 'ENCAMINHAMENTO':
            const enc = item.dataOriginal as EncaminhamentoDetalhado;
            let labelMedicoEnc = "Médico Solicitante";
            let valorMedicoEnc;

            if (enc.medicoSolicitanteNome) {
                valorMedicoEnc = renderMedicoInfo(enc.medicoSolicitanteNome, enc.medicoSolicitanteEspecialidade, enc.medicoSolicitanteCRM);
            } else if ((enc as any).nomeResponsavelDisplay) {
                labelMedicoEnc = "Registrado por";
                valorMedicoEnc = (enc as any).nomeResponsavelDisplay;
            } else {
                valorMedicoEnc = "Não informado";
            }
            return (
                <div className="space-y-3">
                    <DetailItem label={labelMedicoEnc} value={valorMedicoEnc} />
                    <DetailItem label="Especialidade de Destino" value={enc.especialidadeDestino} />
                    <DetailItem label="Motivo" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-100 p-3 rounded-md border border-neutral-200">{enc.motivoEncaminhamento}</pre>} />
                    {enc.observacoes && <DetailItem label="Observações" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-100 p-3 rounded-md border border-neutral-200">{enc.observacoes}</pre>} />}
                </div>
            );
         case 'HISTORICO_GERAL':
            const hg = item.dataOriginal as HistoricoMedico;
            return (
                 <div className="space-y-3">
                    <DetailItem label="Responsável" value={hg.responsavel} />
                    <DetailItem label="Descrição" value={<pre className="text-sm whitespace-pre-wrap font-sans bg-neutral-100 p-3 rounded-md border border-neutral-200">{hg.descricao}</pre>} />
                </div>
            );
        default:
            console.warn("RenderHistoricoItem: Tipo de item desconhecido ou não tratado:", item.tipo, item);
            return <p className="text-neutral-500 italic">Tipo de registro não renderizado: {item.tipo}.</p>;
    }
};

const ListaHistoricoUnificado: React.FC<{itens: HistoricoUnificadoItem[], formatDateTime: Function, formatDate: Function}> = ({ itens, formatDateTime, formatDate }) => {
    if (!itens || itens.length === 0) {
        return <Card className="text-center"><p className="text-neutral-500 italic py-10">Nenhum registro encontrado neste prontuário.</p></Card>;
    }

    return (
        <div className="space-y-6">
            {itens.map(item => (
                <Card key={item.id} className="shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out border border-neutral-200/80 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between bg-neutral-50/70 px-4 sm:px-6 py-4 border-b border-neutral-200">
                        <div className="flex items-center min-w-0">
                            <span className={`p-2.5 rounded-full mr-3 sm:mr-4 flex-shrink-0 ${
                                item.tipo === 'CONSULTA' ? 'bg-blue-100 text-blue-600' :
                                item.tipo === 'EXAME' ? 'bg-green-100 text-green-600' :
                                item.tipo === 'PROCEDIMENTO' ? 'bg-purple-100 text-purple-600' :
                                item.tipo === 'ENCAMINHAMENTO' ? 'bg-orange-100 text-orange-600' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {item.icone || <FileTextIcon className="h-5 w-5" />}
                            </span>
                            <h4 className={`text-md sm:text-lg font-semibold truncate ${
                                 item.tipo === 'CONSULTA' ? 'text-blue-700' :
                                 item.tipo === 'EXAME' ? 'text-green-700' :
                                 item.tipo === 'PROCEDIMENTO' ? 'text-purple-700' :
                                 item.tipo === 'ENCAMINHAMENTO' ? 'text-orange-700' :
                                 'text-gray-700'
                            }`} title={item.titulo}>{item.titulo}</h4>
                        </div>
                        <span className="text-xs sm:text-sm text-neutral-600 whitespace-nowrap font-medium pl-2">{formatDateTime(item.data)}</span>
                    </div>
                    <div className="p-4 sm:p-6 space-y-3">
                       <RenderHistoricoItem item={item} formatDateTime={formatDateTime} formatDate={formatDate} />
                    </div>
                </Card>
            ))}
        </div>
    );
};

const ListaDeConsultas: React.FC<{consultas: ConsultaDetalhada[], formatDateTime: Function, formatDate: Function}> = ({consultas, formatDateTime, formatDate}) => {
    if (!consultas || consultas.length === 0) return <Card className="text-center"><p className="text-neutral-500 italic py-10">Nenhuma consulta registrada.</p></Card>;
    const itens: HistoricoUnificadoItem[] = consultas.map(c => ({id: `consulta-list-${c.id}`, tipo: 'CONSULTA', data: c.dataHoraConsulta, dataOriginal:c, titulo: 'Consulta', icone: <Activity className="h-5 w-5" />}));
    return <ListaHistoricoUnificado itens={itens} formatDateTime={formatDateTime} formatDate={formatDate} />;
};

const ListaDeExames: React.FC<{exames: ExameDetalhado[], formatDate: Function, formatDateTime: Function}> = ({exames, formatDate, formatDateTime}) => {
    if (!exames || exames.length === 0) return <Card className="text-center"><p className="text-neutral-500 italic py-10">Nenhum exame registrado.</p></Card>;
    const itens: HistoricoUnificadoItem[] = exames.map(e => ({id: `exame-list-${e.id}`, tipo: 'EXAME', data: e.data, dataOriginal:e, titulo: `Exame: ${e.nome || 'N/D'}`, icone: <Microscope className="h-5 w-5" />}));
    return <ListaHistoricoUnificado itens={itens} formatDateTime={formatDateTime} formatDate={formatDate} />;
};

const ListaDeProcedimentos: React.FC<{procedimentos: ProcedimentoDetalhado[], formatDateTime: Function, formatDate: Function}> = ({procedimentos, formatDateTime, formatDate}) => {
    if (!procedimentos || procedimentos.length === 0) return <Card className="text-center"><p className="text-neutral-500 italic py-10">Nenhum procedimento registrado.</p></Card>;
    const itens: HistoricoUnificadoItem[] = procedimentos.map(p => ({id: `procedimento-list-${p.id}`, tipo: 'PROCEDIMENTO', data: p.dataProcedimento, dataOriginal:p, titulo: `Procedimento: ${(p.descricaoProcedimento || '').substring(0,35)}${(p.descricaoProcedimento && p.descricaoProcedimento.length > 35) ? '...' : ''}`, icone: <Scissors className="h-5 w-5" />}));
    return <ListaHistoricoUnificado itens={itens} formatDateTime={formatDateTime} formatDate={formatDate} />;
};

const ListaDeEncaminhamentos: React.FC<{encaminhamentos: EncaminhamentoDetalhado[], formatDateTime: Function, formatDate: Function}> = ({encaminhamentos, formatDateTime, formatDate}) => {
    if (!encaminhamentos || encaminhamentos.length === 0) return <Card className="text-center"><p className="text-neutral-500 italic py-10">Nenhum encaminhamento registrado.</p></Card>;
    const itens: HistoricoUnificadoItem[] = encaminhamentos.map(enc => ({id: `encaminhamento-list-${enc.id}`, tipo: 'ENCAMINHAMENTO', data: enc.dataEncaminhamento, dataOriginal:enc, titulo: `Encaminhamento para ${enc.especialidadeDestino || 'N/D'}`, icone: <Send className="h-5 w-5" />}));
    return <ListaHistoricoUnificado itens={itens} formatDateTime={formatDateTime} formatDate={formatDate} />;
};

export default ProntuarioDetailPage;