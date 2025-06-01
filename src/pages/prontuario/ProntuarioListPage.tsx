import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import ProntuarioSearchForm from '../../components/prontuario/ProntuarioSearchForm';
import ProntuarioTable from '../../components/prontuario/ProntuarioTable';
import { buscarProntuarios } from '../../services/prontuarioService';
import { BuscaProntuarioParams, Prontuario, ResultadoBusca } from '../../types/prontuario';

const ProntuarioListPage: React.FC = () => {
  // tipoTratamento removido da interface interna se não for mais usado em BuscaProntuarioParams
  const [searchParams, setSearchParams] = useState<Omit<BuscaProntuarioParams, 'tipoTratamento'>>({
    pagina: 0,
    tamanho: 10,
  });
  
  const [resultado, setResultado] = useState<ResultadoBusca | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProntuarios = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // A chamada para buscarProntuarios agora não inclui tipoTratamento nos params
        const paramsToFetch: BuscaProntuarioParams = {
            ...searchParams,
            // tipoTratamento: undefined, // Garante que não seja enviado se ainda existir na interface
        };
        // Se BuscaProntuarioParams foi atualizada para remover tipoTratamento, pode passar searchParams diretamente
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
    };
    
    fetchProntuarios();
  }, [searchParams]);
  
  const handleSearch = (formData: { termo?: string; numeroProntuario?: string; status?: Prontuario['status']}) => {
    setSearchParams(prevParams => ({
      ...prevParams, // Mantém pagina e tamanho atuais ou outros filtros não relacionados
      pagina: 0, 
      termo: formData.termo || undefined,
      numeroProntuario: formData.numeroProntuario || undefined,
      // tipoTratamento: formData.tipoTratamento || undefined, // REMOVIDO
      status: formData.status || undefined,
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
            Voltar ao Painel
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
        pageSize={searchParams.tamanho || 10} // Garante um valor padrão
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProntuarioListPage;