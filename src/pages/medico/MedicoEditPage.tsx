import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MedicoForm, { MedicoFormData } from '../../components/medico/MedicoForm';
import Alert from '../../components/ui/Alert';
import { buscarMedicoPorId, atualizarMedico } from '../../services/medicoService';
import { Medico, MedicoUpdateDTO, StatusMedico } from '../../types/medico';
import { Loader2, ArrowLeft } from 'lucide-react';

const MedicoEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [medico, setMedico] = useState<Medico | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchMedico = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await buscarMedicoPorId(Number(id));
          setMedico(data);
        } catch (err: any) {
          setError(err.response?.data?.mensagem || 'Erro ao buscar dados do médico.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchMedico();
    }
  }, [id]);

  const handleUpdateMedico = async (data: MedicoFormData) => {
    if (!id) return;
    setIsSaving(true);
    setError(null);
    try {
      const updateData: MedicoUpdateDTO = {
        ...data,
        status: data.status || medico?.status || StatusMedico.ATIVO, 
      };
      
      const medicoAtualizado = await atualizarMedico(Number(id), updateData);
      navigate('/medicos', { 
        state: { 
          medicoUpdateSuccess: true, 
          message: `Dados do médico ${medicoAtualizado.nomeCompleto} atualizados com sucesso!` 
        }
      });
    } catch (err: any) {
      const apiErrorMessage = err.response?.data?.mensagem || err.response?.data?.message || 'Erro desconhecido ao atualizar médico.';
      setError(apiErrorMessage);
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-medium py-8 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error && !medico) {
    return (
      <div className="container-medium py-8">
        <Alert type="error" title="Erro ao carregar" message={error} />
        <div className="mt-4">
          <Link to="/medicos">
            <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Voltar para Lista
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (!medico) {
     return (
      <div className="container-medium py-8">
        <Alert type="warning" title="Não encontrado" message="Médico não encontrado." />
         <div className="mt-4">
          <Link to="/medicos">
            <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Voltar para Lista
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-medium py-8">
       <div className="flex items-center mb-6">
        <Link to="/medicos" className="text-neutral-500 hover:text-neutral-700 mr-2">
            <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Editar Médico: {medico.nomeCompleto}</h1>
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
        <MedicoForm
          onSubmit={handleUpdateMedico}
          initialData={medico}
          isLoading={isSaving}
          isEditMode={true}
        />
      </div>
    </div>
  );
};

export default MedicoEditPage;