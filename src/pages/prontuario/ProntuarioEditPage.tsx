import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProntuarioForm from '../../components/prontuario/ProntuarioForm';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { buscarProntuarioPorId, atualizarProntuario } from '../../services/prontuarioService';
import { Prontuario, NovoProntuarioRequest } from '../../types/prontuario';

const ProntuarioEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [prontuario, setProntuario] = useState<Prontuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Mapeia o prontuário para o formato utilizado pelo formulário
  const mapProntuarioToFormData = (prontuario: Prontuario): NovoProntuarioRequest => {
    return {
      paciente: {
        nome: prontuario.paciente.nome,
        dataNascimento: prontuario.paciente.dataNascimento,
        cpf: prontuario.paciente.cpf,
        genero: prontuario.paciente.genero,
        telefone: prontuario.paciente.telefone,
        email: prontuario.paciente.email,
        endereco: {
          logradouro: prontuario.paciente.endereco.logradouro,
          numero: prontuario.paciente.endereco.numero,
          complemento: prontuario.paciente.endereco.complemento,
          bairro: prontuario.paciente.endereco.bairro,
          cidade: prontuario.paciente.endereco.cidade,
          estado: prontuario.paciente.endereco.estado,
          cep: prontuario.paciente.endereco.cep,
        }
      },
      tipoTratamento: prontuario.tipoTratamento,
      historicoMedico: {
        descricao: prontuario.historicoMedico.length > 0 
          ? prontuario.historicoMedico[0].descricao 
          : "Sem histórico médico registrado"
      }
    };
  };
  
  const handleUpdateProntuario = async (data: NovoProntuarioRequest) => {
    if (!id) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await atualizarProntuario(id, data);
      navigate(`/prontuarios/${id}`);
    } catch (error: any) {
      console.error('Erro ao atualizar prontuário:', error);
      setError(
        error.response?.data?.message || 'Erro ao atualizar prontuário. Tente novamente mais tarde.'
      );
      setIsSaving(false);
    }
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
  
  if (error && !prontuario) {
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
      <div className="flex items-center mb-6">
        <Link to={`/prontuarios/${id}`} className="text-neutral-500 hover:text-neutral-700 mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">
          Editar Prontuário #{prontuario.numeroProntuario}
        </h1>
      </div>
      
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
          onSubmit={handleUpdateProntuario}
          initialData={mapProntuarioToFormData(prontuario)}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
};

export default ProntuarioEditPage;