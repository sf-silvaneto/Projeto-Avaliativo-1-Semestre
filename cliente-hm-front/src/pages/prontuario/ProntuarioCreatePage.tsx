import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProntuarioForm from '../../components/prontuario/ProntuarioForm';
import Alert from '../../components/ui/Alert';
import { criarProntuario } from '../../services/prontuarioService';
import { NovoProntuarioRequest } from '../../types/prontuario';

const ProntuarioCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCreateProntuario = async (data: NovoProntuarioRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const novoProntuario = await criarProntuario(data);
      navigate(`/prontuarios/${novoProntuario.id}`);
    } catch (error: any) {
      console.error('Erro ao criar prontuário:', error);
      setError(
        error.response?.data?.message || 'Erro ao criar prontuário. Tente novamente mais tarde.'
      );
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container-medium">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Novo Prontuário</h1>
      
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
          onSubmit={handleCreateProntuario}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ProntuarioCreatePage;