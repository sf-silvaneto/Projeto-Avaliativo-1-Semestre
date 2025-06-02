import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import ProntuarioSearchForm from '../../components/prontuario/ProntuarioSearchForm';
import ProntuarioTable from '../../components/prontuario/ProntuarioTable';
import { buscarProntuarios } from '../../services/prontuarioService';
// StatusProntuario não é mais necessário para o formulário de busca aqui
import { BuscaProntuarioParams, Prontuario, ResultadoBuscaProntuarios as ResultadoBusca } from '../../types/prontuario'; // Renomeei ResultadoBuscaProntuarios para ResultadoBusca como estava antes

const ProntuarioListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<BuscaProntuarioParams>({
    pagina: 0,
    tamanho: 10,
    sort: 'dataUltimaAtualizacao,desc',
    // status: '', // O campo status ainda existe em BuscaProntuarioParams, mas não será preenchido pelo form
  });

  const [resultado, setResultado] = useState<ResultadoBusca | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProntuarios = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Remover 'status' se estiver vazio para não enviar ao backend desnecessariamente
    const paramsToFetch: BuscaProntuarioParams = { ...searchParams };
    if (paramsToFetch.status === '') {
        delete paramsToFetch.status;
    }


    try {
      console.log("Fetching prontuarios com params:", paramsToFetch);
      const result = await buscarProntuarios(paramsToFetch);
      setResultado(result);
    } catch (error: any) {
      console.error('Erro ao buscar prontuários:', error);
      setError(
        error.response?.data?.message || 'Erro ao buscar prontuários. Tente novamente mais tarde.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProntuarios();
  }, [fetchProntuarios]);

  // A interface do formData não precisa mais de status aqui
  const handleSearch = (formData: { termo?: string; numeroProntuario?: string }) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      pagina: 0,
      termo: formData.termo || undefined,
      numeroProntuario: formData.numeroProntuario || undefined,
      // status: formData.status || undefined, // REMOVIDO: status não vem mais do form
      status: undefined, // Garante que o filtro de status seja limpo ou não enviado
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      pagina: page - 1,
    }));
  };

  return (
    <div className="container-wide">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4 md:mb-0">Gerenciar Prontuários</h1>
      </div>

      <ProntuarioSearchForm onSearch={handleSearch} isLoading={isLoading} />

      <div className="flex justify-end items-center space-x-2 mb-4">
        <Link to="/painel-de-controle">
          <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar
          </Button>
        </Link>
        <Link to="/prontuarios/novo">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Novo Prontuário
          </Button>
        </Link>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
          onClose={() => setError(null)}
        />
      )}

      <ProntuarioTable
        prontuarios={resultado?.content || []}
        totalItems={resultado?.pageable.totalElements || 0}
        currentPage={(searchParams.pagina || 0) + 1}
        pageSize={searchParams.tamanho || 10}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProntuarioListPage;