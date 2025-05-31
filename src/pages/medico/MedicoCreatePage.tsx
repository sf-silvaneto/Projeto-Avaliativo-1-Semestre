// src/pages/medico/MedicoCreatePage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MedicoForm, { MedicoFormData } from '../../components/medico/MedicoForm';
import Alert from '../../components/ui/Alert';
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
      // O backend espera MedicoCreateDTO, que não tem 'status'
      // O status é definido como ATIVO por padrão no backend.
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
      setIsCreating(false);
    }
  };

  return (
    <div className="container-medium py-8">
       <div className="flex items-center mb-6">
        <Link to="/medicos" className="text-neutral-500 hover:text-neutral-700 mr-2">
            <ArrowLeft className="h-5 w-5" />
        </Link>
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

      <div className="card">
        <MedicoForm
          onSubmit={handleCreateMedico}
          isLoading={isCreating}
          isEditMode={false}
        />
      </div>
    </div>
  );
};

export default MedicoCreatePage;