import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PacienteForm from '../../components/paciente/PacienteForm';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import * as pacienteService from '../../services/pacienteService';
import { PacienteFormData, PacienteCreateDTO } from '../../types/paciente';
import { ArrowLeft } from 'lucide-react';

const PacienteCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePaciente = async (data: PacienteFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { dataEntrada, ...restOfData } = data; 
      const createData: PacienteCreateDTO = {
        ...restOfData,
        alergias: restOfData.alergias.filter(a => a.descricao.trim() !== ''),
        comorbidades: restOfData.comorbidades.filter(c => c.descricao.trim() !== ''),
        medicamentosContinuos: restOfData.medicamentosContinuos.filter(m => m.descricao.trim() !== ''),
      };

      const novoPaciente = await pacienteService.criarPaciente(createData);
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
    } finally {
        setIsSubmitting(false);
    }
  };

  const voltarButton = (
    <Button
      type="button"
      variant="secondary"
      onClick={() => navigate('/pacientes')}
      leftIcon={<ArrowLeft className="h-4 w-4" />}
      disabled={isSubmitting}
    >
      Voltar
    </Button>
  );

  return (
    <div className="container-medium py-8">
      <div className="flex items-center mb-6">
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

      <div className="card bg-white p-6 rounded-lg shadow">
        <PacienteForm
          onSubmit={handleCreatePaciente}
          isLoading={isSubmitting}
          isEditMode={false}
          customActions={voltarButton} 
        />
      </div>
    </div>
  );
};
export default PacienteCreatePage;