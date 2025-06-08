// src/pages/paciente/PacienteEditPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PacienteForm from '../../components/paciente/PacienteForm';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import * as pacienteService from '../../services/pacienteService';
import { Paciente, PacienteFormData, PacienteUpdateDTO, Alergia, Comorbidade, MedicamentoContinuo } from '../../types/paciente'; // Importe os novos tipos
import { Loader2, ArrowLeft } from 'lucide-react';

const PacienteEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchPaciente = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await pacienteService.buscarPacientePorId(id);
          setPaciente(data);
        } catch (err: any) {
          setError(err.response?.data?.mensagem || err.message || 'Erro ao buscar dados do paciente.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchPaciente();
    }
  }, [id]);

  const mapPacienteToFormData = (p: Paciente): PacienteFormData => {
    // Agora os campos são arrays de objetos com 'descricao' e 'id'
    const alergias: Alergia[] = p.alergias || [];
    const comorbidades: Comorbidade[] = p.comorbidades || [];
    const medicamentosContinuos: MedicamentoContinuo[] = p.medicamentosContinuos || [];

    return {
        nome: p.nome,
        dataNascimento: p.dataNascimento,
        cpf: p.cpf,
        rg: p.rg || '',
        genero: p.genero,
        telefone: p.telefone,
        email: p.email,
        nomeMae: p.nomeMae,
        nomePai: p.nomePai || '',
        dataEntrada: p.dataEntrada,
        cartaoSus: p.cartaoSus || '',
        racaCor: p.racaCor || '',
        tipoSanguineo: p.tipoSanguineo || '',
        nacionalidade: p.nacionalidade || '',
        ocupacao: p.ocupacao || '',
        alergias: alergias.map(a => ({ id: a.id, descricao: a.descricao })),
        comorbidades: comorbidades.map(c => ({ id: c.id, descricao: c.descricao })),
        medicamentosContinuos: medicamentosContinuos.map(m => ({ id: m.id, descricao: m.descricao })),
        endereco: {
            logradouro: p.endereco.logradouro,
            numero: p.endereco.numero,
            complemento: p.endereco.complemento || '',
            bairro: p.endereco.bairro,
            cidade: p.endereco.cidade,
            estado: p.endereco.estado,
            cep: p.endereco.cep,
        }
    };
  };

  const handleUpdatePaciente = async (data: PacienteFormData) => {
    if (!id) return;
    setIsSaving(true);
    setError(null);
    try {
      const updateData: PacienteUpdateDTO = {
        ...data,
        // Garanta que as listas enviadas sejam do tipo correto (Alergia[], Comorbidade[], MedicamentoContinuo[])
        alergias: data.alergias.filter(a => a.descricao.trim() !== ''), // Filtra descrições vazias
        comorbidades: data.comorbidades.filter(c => c.descricao.trim() !== ''),
        medicamentosContinuos: data.medicamentosContinuos.filter(m => m.descricao.trim() !== ''),
      };

      const pacienteAtualizado = await pacienteService.atualizarPaciente(id, updateData);
      navigate('/pacientes', { 
        state: { 
          pacienteSuccess: true, 
          message: `Dados do paciente ${pacienteAtualizado.nome} atualizados com sucesso!` 
        }
      });
    } catch (err: any) {
      const apiErrorMessage = err.response?.data?.mensagem || err.message || 'Erro desconhecido ao atualizar paciente.';
      setError(apiErrorMessage);
      setIsSaving(false);
    }
  };

  const voltarButton = (
    <Button
      type="button"
      variant="secondary"
      onClick={() => navigate('/pacientes')}
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

  if (error && !paciente) {
    return (
      <div className="container-medium py-8">
        <Alert type="error" title="Erro ao carregar" message={error} />
        <div className="mt-4">
           <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/pacientes')}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Voltar
            </Button>
        </div>
      </div>
    );
  }

  if (!paciente) {
     return (
      <div className="container-medium py-8">
        <Alert type="warning" title="Não encontrado" message="Paciente não encontrado." />
         <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/pacientes')}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Voltar
            </Button>
        </div>
      </div>
    );
  }

  const initialFormData = mapPacienteToFormData(paciente);

  return (
    <div className="container-medium py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        Editar Paciente: {paciente.nome}
      </h1>

      {error && !isSaving && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
          onClose={() => setError(null)}
        />
      )}
      {isSaving && error && (
         <Alert
          type="error"
          title="Erro ao Salvar"
          message={error}
          className="mb-6"
          onClose={() => setError(null)}
        />
      )}

      <div className="card">
        <PacienteForm
          onSubmit={handleUpdatePaciente}
          initialData={initialFormData}
          isLoading={isSaving}
          isEditMode={true}
          customActions={voltarButton}
        />
      </div>
    </div>
  );
};
export default PacienteEditPage;