import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicoForm, { MedicoFormData } from '../../components/medico/MedicoForm';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { criarMedico } from '../../services/medicoService';
import { ArrowLeft } from 'lucide-react';
// Se StatusMedico for usado aqui (ex: em um estado inicial), importe-o.
// import { StatusMedico } from '../../types/medico';


const MedicoCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateMedico = async (data: MedicoFormData) => {
    setIsCreating(true);
    setError(null);
    try {
      // A propriedade 'crm' já vem concatenada do MedicoForm (ex: '12345SP')
      // Se o backend espera 'crm' e 'crmUf' separados, ajuste aqui ou no MedicoForm.
      // No MedicoForm atual, 'crm' já é 'numeroCRM + UF'.
      const createData = {
        nomeCompleto: data.nomeCompleto,
        crm: data.crm, // Já está no formato 'numeroUF'
        especialidade: data.especialidade,
        resumoEspecialidade: data.resumoEspecialidade,
        rqe: data.rqe,
        // status é opcional no schema e MedicoForm define um default,
        // então não precisa ser enviado explicitamente aqui a menos que queira sobrescrever.
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

  // Crie o botão "Voltar" como um elemento JSX
  const voltarButton = (
    <Button
      type="button" // Importante para não submeter o formulário
      variant="secondary"
      onClick={() => navigate('/medicos')} // Navega para a lista de médicos
      leftIcon={<ArrowLeft className="h-4 w-4" />}
      disabled={isCreating} // Opcional: desabilitar enquanto cria
    >
      Voltar
    </Button>
  );

  return (
    <div className="container-medium py-8">
      <div className="flex items-center mb-6">
        {/* A Seta e o Link foram removidos daqui */}
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

      {/* Envolver MedicoForm com um Card ou div com padding, se necessário */}
      <div className="card bg-white p-6 rounded-lg shadow"> {/* Exemplo de card styling */}
        <MedicoForm
          onSubmit={handleCreateMedico}
          isLoading={isCreating}
          isEditMode={false} // Modo de criação
          customActions={voltarButton} // Passe o botão Voltar como prop
        />
      </div>
    </div>
  );
};

export default MedicoCreatePage;