import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import ProntuarioSearchForm from '../../components/prontuario/ProntuarioSearchForm';
import ProntuarioTable from '../../components/prontuario/ProntuarioTable';
import { buscarProntuarios } from '../../services/prontuarioService';
import { BuscaProntuarioParams, ResultadoBuscaProntuarios as ResultadoBusca } from '../../types/prontuario';

interface ProntuarioSearchFormData {
  termo?: string;
}

const ProntuarioListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [apiSearchParams, setApiSearchParams] = useState<BuscaProntuarioParams>({
    pagina: 0,
    tamanho: 10,
    sort: 'dataUltimaAtualizacao,desc',
    termo: undefined,
  });
  
  const [initialFormFilters] = useState<ProntuarioSearchFormData>({ termo: '' });

  const [resultado, setResultado] = useState<ResultadoBusca | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedIsLoading, setDebouncedIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Variável successMessage declarada aqui

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedIsLoading(isLoading);
    }, 200);

    return () => {
      clearTimeout(handler);
    };
  }, [isLoading]);


  const fetchProntuarios = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await buscarProntuarios(apiSearchParams);
      setResultado(result);
    } catch (err: any) {
      console.error('Erro ao buscar prontuários:', err);
      setError(
        err.response?.data?.message || 'Erro ao buscar prontuários. Tente novamente mais tarde.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [apiSearchParams]);

  useEffect(() => {
    fetchProntuarios();
  }, [fetchProntuarios]);

  useEffect(() => {
    const state = location.state as { prontuarioSuccess?: boolean, message?: string };
    if (state?.prontuarioSuccess && state?.message) {
      setSuccessMessage(state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSearch = (formData: ProntuarioSearchFormData) => {
    setApiSearchParams(prevParams => ({
      ...prevParams,
      pagina: 0,
      termo: formData.termo || undefined,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setApiSearchParams(prevParams => ({
      ...prevParams,
      pagina: newPage - 1, 
    }));
  };

  const totalPages = resultado?.pageable.totalPages || 0;

  return (
    <div className="container-wide py-8">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Gerenciar Prontuários</h1>
      </div>

      {successMessage && (
        <Alert type="success" message={successMessage} className="mb-4" onClose={() => setSuccessMessage(null)} />
      )}
      {error && <Alert type="error" message={error} className="mb-4" onClose={() => setError(null)} />}

      <ProntuarioSearchForm 
        onSearch={handleSearch} 
        initialFilters={initialFormFilters} 
        isLoading={debouncedIsLoading}
      />

      <div className="flex justify-end items-center space-x-2 mb-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/painel-de-controle')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Voltar
        </Button>
        <Link to="/prontuarios/novo">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Novo Registro
          </Button>
        </Link>
      </div>
      
      <Card>
        <ProntuarioTable 
          prontuarios={resultado?.content || []}
          totalItems={resultado?.pageable.totalElements || 0}
          currentPage={(apiSearchParams.pagina || 0) + 1}
          pageSize={apiSearchParams.tamanho || 10}
          onPageChange={handlePageChange}
          isLoading={debouncedIsLoading}
        />
      </Card>
      
      {totalPages > 1 && !debouncedIsLoading && (
        <div className="mt-6 flex justify-center">
        </div>
      )}
    </div>
  );
};

export default ProntuarioListPage;