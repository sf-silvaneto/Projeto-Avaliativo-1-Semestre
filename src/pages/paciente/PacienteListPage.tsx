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

  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [pacienteInAction, setPacienteInAction] = useState<string | null>(null);
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
      fetchPacientes(searchFilters, currentPage);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, fetchPacientes, searchFilters, currentPage]);

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

  const handleDeletePaciente = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.')) {
      setIsLoadingAction(true);
      setPacienteInAction(id);
      setError(null);
      setSuccessMessage(null);
      try {
        await pacienteService.deletarPaciente(id);
        setSuccessMessage('Paciente excluído com sucesso.');
        fetchPacientes(searchFilters, currentPage);
      } catch (err: any) {
        setError(err.response?.data?.mensagem || err.message || 'Erro ao excluir paciente.');
      } finally {
        setIsLoadingAction(false);
        setPacienteInAction(null);
      }
    }
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

      <PacienteSearchForm onSearch={handleSearch} isLoading={isLoading} initialFilters={searchFilters} />

      <div className="flex justify-end items-center space-x-2 mb-4">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
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
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/4 mb-4 mx-auto"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => ( <div key={i} className="h-10 bg-neutral-100 rounded"></div> ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <Card>
            <PacienteTable
              pacientes={resultadoBusca?.content || []}
              onEdit={handleEditPaciente}
              onDelete={handleDeletePaciente}
              isLoadingAction={isLoadingAction}
              pacienteInAction={pacienteInAction}
            />
          </Card>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || isLoading}
                  className="rounded-r-none"
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </Button>
                <span className="px-4 py-2 border-t border-b border-neutral-300 bg-white text-sm">
                  Página {currentPage + 1} de {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || isLoading}
                  className="rounded-l-none"
                >
                  Próxima <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default PacienteListPage;