import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MedicoForm, { MedicoFormData } from '../../components/medico/MedicoForm';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { buscarMedicoPorId, atualizarMedico } from '../../services/medicoService';
import { Medico, MedicoUpdateDTO } from '../../types/medico';
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
        nomeCompleto: data.nomeCompleto,
        crm: data.crm,
        especialidade: data.especialidade,
        resumoEspecialidade: data.resumoEpecialidade,
        rqe: data.rqe,
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
      setIsSaving(false);
    }
  };

  const voltarButton = (
    <Button
      type="button"
      variant="secondary"
      onClick={() => navigate('/medicos')}
      leftIcon={<ArrowLeft className="h-4 w-4" />}
      disabled={isSaving || isLoading}
    >
      Voltar
    </Button>
  );

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
           <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/medicos')}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Voltar
            </Button>
        </div>
      </div>
    );
  }
  
  if (!medico) {
     return (
      <div className="container-medium py-8">
        <Alert type="warning" title="Não encontrado" message="Médico não encontrado." />
         <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/medicos')}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Voltar
            </Button>
        </div>
      </div>
    );
  }

  const initialFormDataForForm: Medico = { ...medico };

  return (
    <div className="container-medium py-8">
       <h1 className="text-2xl font-bold text-neutral-900 mb-6">
         Editar Médico: {medico.nomeCompleto}
       </h1>

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
          initialData={initialFormDataForForm}
          isLoading={isSaving}
          isEditMode={true}
          customActions={voltarButton} 
        />
      </div>
    </div>
  );
};

export default MedicoEditPage;