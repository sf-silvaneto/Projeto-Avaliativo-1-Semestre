import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Link removido se não for mais usado
import PacienteForm from '../../components/paciente/PacienteForm';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button'; // Importação do Button
import * as pacienteService from '../../services/pacienteService';
import { PacienteFormData } from '../../types/paciente';
import { ArrowLeft } from 'lucide-react'; // Ícone para o botão Voltar

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
    } finally {
        setIsSubmitting(false); // Garante que isSubmitting seja definido como false no final
    }
  };

  // Define o botão "Voltar" para ser passado ao PacienteForm
  const voltarButton = (
    <Button
      type="button" // Importante para não submeter o formulário
      variant="secondary"
      onClick={() => navigate('/pacientes')} // Navega para a lista de pacientes
      leftIcon={<ArrowLeft className="h-4 w-4" />}
      disabled={isSubmitting}
    >
      Voltar
    </Button>
  );

  return (
    <div className="container-medium py-8">
      <div className="flex items-center mb-6">
        {/* Link to="/pacientes" foi removido daqui */}
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

      <div className="card bg-white p-6 rounded-lg shadow"> {/* Exemplo de card styling */}
        <PacienteForm
          onSubmit={handleCreatePaciente}
          isLoading={isSubmitting}
          isEditMode={false}
          customActions={voltarButton} // Passa o botão Voltar como prop
        />
      </div>
    </div>
  );
};
export default PacienteCreatePage;