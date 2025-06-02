// sf-silvaneto/clientehm/ClienteHM-057824fed8786ee29c7b4f9a2010aca3a83abc37/cliente-hm-front-main/src/pages/prontuario/ProntuarioListPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import ProntuarioSearchForm from '../../components/prontuario/ProntuarioSearchForm';
import ProntuarioTable from '../../components/prontuario/ProntuarioTable';
import { buscarProntuarios } from '../../services/prontuarioService';
// BuscaProntuarioParams já foi atualizado em seu arquivo de tipos
import { BuscaProntuarioParams, ResultadoBuscaProntuarios as ResultadoBusca } from '../../types/prontuario';

const ProntuarioListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<BuscaProntuarioParams>({
    pagina: 0,
    tamanho: 10,
    sort: 'dataUltimaAtualizacao,desc',
    // O campo numeroProntuario não existe mais em BuscaProntuarioParams
  });

  const [resultado, setResultado] = useState<ResultadoBusca | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce para a busca automática
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProntuarios();
    }, 500); // 500ms de delay após o usuário parar de digitar

    return () => {
      clearTimeout(handler);
    };
  }, [searchParams.termo]); // Dispara quando o termo de busca muda


  const fetchProntuarios = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // searchParams já está no formato correto de BuscaProntuarioParams (sem numeroProntuario específico)
    try {
      console.log("Fetching prontuarios com params:", searchParams); 
      const result = await buscarProntuarios(searchParams);
      setResultado(result);
    } catch (error: any) {
      console.error('Erro ao buscar prontuários:', error);
      setError(
        error.response?.data?.message || 'Erro ao buscar prontuários. Tente novamente mais tarde.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]); // Dependência direta de searchParams para re-fetch quando pagina, tamanho, sort mudam

  // Este useEffect busca na montagem inicial e quando searchParams é alterado por paginação/ordenação.
  // A busca por 'termo' é gerenciada pelo useEffect com debounce acima.
  useEffect(() => {
    // Evita busca duplicada na montagem se o termo não mudou
    if (searchParams.termo === undefined) { // ou alguma outra condição para montagem inicial
       fetchProntuarios();
    }
  }, [searchParams.pagina, searchParams.tamanho, searchParams.sort, fetchProntuarios]); // eslint-disable-line react-hooks/exhaustive-deps


  // handleSearch agora só espera 'termo'
  const handleSearch = (formData: { termo?: string }) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      pagina: 0, 
      termo: formData.termo?.trim() || undefined,
      // numeroProntuario: undefined, // Não é mais necessário
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

      {/* onSearch ainda é útil para o reset e se o usuário pressionar Enter no input */}
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