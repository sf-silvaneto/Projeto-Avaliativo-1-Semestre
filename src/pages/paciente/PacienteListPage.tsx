import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import PacienteTable from '../../components/paciente/PacienteTable';
import PacienteSearchForm from '../../components/paciente/PacienteSearchForm';
import * as pacienteService from '../../services/pacienteService';
import { Paciente, BuscaPacienteParams, ResultadoBuscaPacientes } from '../../types/paciente';

interface PacienteSearchFormData {
  nome?: string;
  cpf?: string;
}

const PacienteListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchFilters, setSearchFilters] = useState<PacienteSearchFormData>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const [resultadoBusca, setResultadoBusca] = useState<ResultadoBuscaPacientes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPacientes = useCallback(async (filters: PacienteSearchFormData, page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: BuscaPacienteParams = {
        pagina: page,
        tamanho: pageSize,
        nome: filters.nome || undefined,
        cpf: filters.cpf || undefined,
        sort: 'nome,asc',
      };
      const result = await pacienteService.buscarPacientes(params);
      setResultadoBusca(result);
    } catch (err: any) {
      setError(err.response?.data?.mensagem || err.message || 'Erro ao buscar pacientes.');
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchPacientes(searchFilters, currentPage);
  }, [fetchPacientes, searchFilters, currentPage]);

  useEffect(() => {
    const state = location.state as { pacienteSuccess?: boolean, message?: string };
    if (state?.pacienteSuccess && state?.message) {
      setSuccessMessage(state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSearch = (formData: PacienteSearchFormData) => {
    setSearchFilters(formData);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleEditPaciente = (id: string) => {
    navigate(`/pacientes/${id}/editar`);
  };

  const handleViewPacienteDetails = (id: string) => {
    navigate(`/pacientes/${id}`);
  };

  const totalPages = resultadoBusca?.pageable.totalPages || 0;

  return (
    <div className="container-wide py-8">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Gerenciar Pacientes</h1>
      </div>

      {successMessage && (
        <Alert type="success" message={successMessage} className="mb-4" onClose={() => setSuccessMessage(null)} />
      )}
      {error && <Alert type="error" message={error} className="mb-4" onClose={() => setError(null)} />}

      <PacienteSearchForm onSearch={handleSearch} initialFilters={searchFilters} />

      <div className="flex justify-end items-center space-x-2 mb-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/painel-de-controle')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Voltar
        </Button>
        <Link to="/pacientes/novo">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Adicionar Paciente
          </Button>
        </Link>
      </div>

      {isLoading && !resultadoBusca ? (
        <div className="text-center py-10">
        </div>
      ) : (
        <>
          <Card>
            <PacienteTable
              pacientes={resultadoBusca?.content || []}
              onEdit={handleEditPaciente}
              onViewDetails={handleViewPacienteDetails}
            />
          </Card>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default PacienteListPage;