import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicoForm, { MedicoFormData } from '../../components/medico/MedicoForm';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { criarMedico } from '../../services/medicoService';
import { ArrowLeft } from 'lucide-react';


const MedicoCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateMedico = async (data: MedicoFormData) => {
    setIsCreating(true);
    setError(null);
    try {
      const createData = {
        nomeCompleto: data.nomeCompleto,
        crm: data.crm,
        especialidade: data.especialidade,
        resumoEspecialidade: data.resumoEspecialidade,
        rqe: data.rqe,
      };

      const novoMedico = await criarMedico(createData);
      navigate('/medicos', {
        state: {
          medicoSuccess: true,
          message: `Médico ${novoMedico.nomeCompleto} cadastrado com sucesso!`
        }
      });
    } catch (err: any) {
      console.error('Erro ao criar médico:', err.response?.data || err.message);
      const apiErrorMessage = err.response?.data?.mensagem || err.response?.data?.message || 'Erro desconhecido ao criar médico.';
      setError(apiErrorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const voltarButton = (
    <Button
      type="button"
      variant="secondary"
      onClick={() => navigate('/medicos')}
      leftIcon={<ArrowLeft className="h-4 w-4" />}
      disabled={isCreating}
    >
      Voltar
    </Button>
  );

  return (
    <div className="container-medium py-8">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Adicionar Novo Médico</h1>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
          onClose={() => setError(null)}
        />
      )}

      <div className="card bg-white p-6 rounded-lg shadow">
        <MedicoForm
          onSubmit={handleCreateMedico}
          isLoading={isCreating}
          isEditMode={false}
          customActions={voltarButton}
        />
      </div>
    </div>
  );
};

export default MedicoCreatePage;