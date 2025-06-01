import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PacienteForm from '../../components/paciente/PacienteForm';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import * as pacienteService from '../../services/pacienteService';
import { Paciente, PacienteFormData } from '../../types/paciente';
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
    const temAlergias = p.alergiasDeclaradas !== null && p.alergiasDeclaradas !== undefined && p.alergiasDeclaradas !== "Não" ? 'sim' : 'nao';
    const alergiasDeclaradas = temAlergias === 'sim' ? p.alergiasDeclaradas || '' : '';

    const temComorbidades = p.comorbidadesDeclaradas !== null && p.comorbidadesDeclaradas !== undefined && p.comorbidadesDeclaradas !== "Não" ? 'sim' : 'nao';
    const comorbidadesDeclaradas = temComorbidades === 'sim' ? p.comorbidadesDeclaradas || '' : '';
    
    const usaMedicamentos = p.medicamentosContinuos !== null && p.medicamentosContinuos !== undefined && p.medicamentosContinuos !== "Não" ? 'sim' : 'nao';
    const medicamentosContinuos = usaMedicamentos === 'sim' ? p.medicamentosContinuos || '' : '';

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
        temAlergias: temAlergias as 'sim' | 'nao',
        alergiasDeclaradas: alergiasDeclaradas,
        temComorbidades: temComorbidades as 'sim' | 'nao',
        comorbidadesDeclaradas: comorbidadesDeclaradas,
        usaMedicamentos: usaMedicamentos as 'sim' | 'nao',
        medicamentosContinuos: medicamentosContinuos,
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
      const pacienteAtualizado = await pacienteService.atualizarPaciente(id, data);
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