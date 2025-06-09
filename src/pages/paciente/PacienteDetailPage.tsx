import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Edit2 as EditIcon, 
    User, 
    Calendar as CalendarIcon,
    Mail, 
    Phone, 
    MapPin, 
    CreditCard, 
    Droplet, 
    Users as UsersIcon,
    Briefcase, 
    Info,
    AlertTriangle, 
    Activity,      
    Pill,
    Clock
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { buscarPacientePorId } from '../../services/pacienteService';
import { Paciente, Genero, RacaCor, TipoSanguineo, Endereco, Alergia, Comorbidade, MedicamentoContinuo } from '../../types/paciente';
import { Loader2 } from 'lucide-react';

const PacienteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaciente = async () => {
      if (!id) {
        setError("ID do paciente não fornecido.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await buscarPacientePorId(id);
        setPaciente(result);
      } catch (err: any) {
        console.error('Erro ao buscar paciente:', err);
        setError(
          err.response?.data?.mensagem || err.message || 'Erro ao buscar dados do paciente.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaciente();
  }, [id]);

  const formatDateOnly = (dataString?: string | Date) => {
    if (!dataString) return '-';
    try {
        let date;
        if (typeof dataString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
            date = new Date(dataString + "T00:00:00"); 
        } else {
            date = new Date(dataString);
        }

        if (isNaN(date.getTime())) {
            return 'Data inválida';
        }
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            timeZone: 'America/Sao_Paulo' 
        });
    } catch (e) {
        return 'Data inválida';
    }
  };
  
  const formatDateTime = (dataString?: string | Date) => {
    if (!dataString) return '-';
    try {
        const date = new Date(dataString);

        if (isNaN(date.getTime())) return 'Data/Hora inválida';
        
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            timeZone: 'America/Sao_Paulo' 
        }) + 
        ' às ' + date.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'America/Sao_Paulo' 
        });
    }catch (e) {
        return 'Data/Hora inválida';
    }
  };

  const formatEnum = (value?: string) => {
    if (!value) return 'Não informado';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replace(/_/g, " ");
  };

  const formatCPF = (cpf?: string): string => {
    if (!cpf) return '-';
    const digits = cpf.replace(/\D/g, '');
    if (digits.length === 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  };

  const formatTelefone = (telefone?: string): string => {
    if (!telefone) return '-';
    const digits = telefone.replace(/\D/g, '');
    const len = digits.length;
    if (len === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (len === 11) {
      return digits.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
    }
    return telefone;
  };
  
  const DetailItem: React.FC<{ icon?: React.ReactNode; label: string; value?: string | null | React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start py-2">
      {icon && <span className="mr-2 text-neutral-500 mt-0.5">{icon}</span>}
      <div className="flex-1">
        <p className="text-xs text-neutral-500">{label.toUpperCase()}</p>
        <p className="text-sm text-neutral-800 font-medium">{value || '-'}</p>
      </div>
    </div>
  );

  const renderList = (items?: { descricao: string }[]) => {
    if (!items || items.length === 0) {
      return <span className="italic text-neutral-400">Não informado</span>;
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-sm">
            {item.descricao}
          </li>
        ))}
      </ul>
    );
  };

  if (isLoading) {
    return (
      <div className="container-medium py-8 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
        <p className="ml-3 text-neutral-600">Carregando dados do paciente...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container-medium py-8">
        <Alert
          type="error"
          title="Erro ao carregar paciente"
          message={error}
        />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/pacientes')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }
  
  if (!paciente) {
    return (
      <div className="container-medium py-8">
        <Alert
          type="warning"
          title="Paciente não encontrado"
          message="O paciente solicitado não foi encontrado ou não existe."
        />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/pacientes')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-medium py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Detalhes do Paciente
        </h1>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button variant="secondary" onClick={() => navigate('/pacientes')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Voltar
            </Button>
            <Button variant="primary" onClick={() => navigate(`/pacientes/${id}/editar`)} leftIcon={<EditIcon className="h-4 w-4" />}>
                Editar Paciente
            </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-800 mb-4 border-b pb-2">Informações Pessoais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <DetailItem icon={<User size={16}/>} label="Nome Completo" value={paciente.nome} />
            <DetailItem icon={<CalendarIcon size={16}/>} label="Data de Nascimento" value={formatDateOnly(paciente.dataNascimento)} />
            <DetailItem icon={<Info size={16}/>} label="CPF" value={formatCPF(paciente.cpf)} />
            <DetailItem icon={<Info size={16}/>} label="RG" value={paciente.rg} />
            <DetailItem icon={<UsersIcon size={16}/>} label="Gênero" value={formatEnum(paciente.genero)} />
            <DetailItem icon={<MapPin size={16}/>} label="Nacionalidade" value={paciente.nacionalidade} />
            <DetailItem icon={<Briefcase size={16}/>} label="Ocupação" value={paciente.ocupacao} />
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-800 mb-4 border-b pb-2">Contato</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <DetailItem icon={<Phone size={16}/>} label="Telefone" value={formatTelefone(paciente.telefone)} />
            <DetailItem icon={<Mail size={16}/>} label="Email" value={paciente.email} />
        </div>
      </Card>
      
      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-800 mb-4 border-b pb-2">Filiação</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <DetailItem icon={<User size={16}/>} label="Nome da Mãe" value={paciente.nomeMae} />
            <DetailItem icon={<User size={16}/>} label="Nome do Pai" value={paciente.nomePai} />
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-800 mb-4 border-b pb-2">Dados Adicionais e de Saúde</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
            <DetailItem icon={<CalendarIcon size={16}/>} label="Data de Cadastro Inicial" value={formatDateOnly(paciente.createdAt)} /> {/* <-- ALTERADO ESTA LINHA */}
            <DetailItem icon={<CreditCard size={16}/>} label="Cartão SUS" value={paciente.cartaoSus} />
            <DetailItem icon={<UsersIcon size={16}/>} label="Raça/Cor" value={formatEnum(paciente.racaCor)} />
            <DetailItem icon={<Droplet size={16}/>} label="Tipo Sanguíneo" value={formatEnum(paciente.tipoSanguineo)} />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-x-6">
             <DetailItem 
                icon={<AlertTriangle size={16}/>} 
                label="Alergias Declaradas" 
                value={renderList(paciente.alergias)}
            />
             <DetailItem 
                icon={<Activity size={16}/>} 
                label="Comorbidades Declaradas" 
                value={renderList(paciente.comorbidades)}
            />
             <DetailItem 
                icon={<Pill size={16}/>} 
                label="Medicamentos em Uso Contínuo" 
                value={renderList(paciente.medicamentosContinuos)}
            />
        </div>
      </Card>

      {paciente.endereco && (
        <Card className="mb-6"> 
          <h2 className="text-xl font-semibold text-neutral-800 mb-4 border-b pb-2">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <DetailItem icon={<MapPin size={16}/>} label="CEP" value={paciente.endereco.cep} />
            <DetailItem label="Logradouro" value={paciente.endereco.logradouro} />
            <DetailItem label="Número" value={paciente.endereco.numero} />
            <DetailItem label="Complemento" value={paciente.endereco.complemento} />
            <DetailItem label="Bairro" value={paciente.endereco.bairro} />
            <DetailItem label="Cidade" value={paciente.endereco.cidade} />
            <DetailItem label="UF" value={paciente.endereco.estado} />
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-xl font-semibold text-neutral-800 mb-4 border-b pb-2">Datas de Registro</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <DetailItem icon={<Clock size={16}/>} label="Data de Criação" value={formatDateTime(paciente.createdAt)} />
            <DetailItem icon={<Clock size={16}/>} label="Última Atualização" value={formatDateTime(paciente.updatedAt)} />
        </div>
      </Card>
    </div>
  );
};

export default PacienteDetailPage;