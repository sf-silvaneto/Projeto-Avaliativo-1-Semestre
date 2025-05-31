import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PacienteForm from '../../components/paciente/PacienteForm';
import Alert from '../../components/ui/Alert';
import * as pacienteService from '../../services/pacienteService';
import { PacienteFormData } from '../../types/paciente';
import { ArrowLeft } from 'lucide-react';

const PacienteCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePaciente = async (data: PacienteFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const novoPaciente = await pacienteService.criarPaciente(data);
      navigate('/pacientes', { 
        state: { 
          pacienteSuccess: true, 
          message: `Paciente ${novoPaciente.nome} cadastrado com sucesso!` 
        } 
      });
    } catch (err: any) {
      console.error('Erro ao criar paciente:', err.response?.data || err.message);
      const apiErrorMessage = err.response?.data?.mensagem || err.response?.data?.message || 'Erro desconhecido ao criar paciente.';
      setError(apiErrorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-medium py-8">
      <div className="flex items-center mb-6">
        <Link to="/pacientes" className="text-neutral-500 hover:text-neutral-700 mr-2">
            <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Adicionar Novo Paciente</h1>
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
        <PacienteForm
          onSubmit={handleCreatePaciente}
          isLoading={isSubmitting}
          isEditMode={false}
        />
      </div>
    </div>
  );
};
export default PacienteCreatePage;