import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import ProntuarioSearchForm from '../../components/prontuario/ProntuarioSearchForm';
import ProntuarioTable from '../../components/prontuario/ProntuarioTable';
import { buscarProntuarios } from '../../services/prontuarioService';
import { BuscaProntuarioParams, Prontuario, ResultadoBusca } from '../../types/prontuario';

const ProntuarioListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<BuscaProntuarioParams>({
    pagina: 0,
    tamanho: 10,
  });
  
  const [resultado, setResultado] = useState<ResultadoBusca | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Carregar prontuários quando a página carregar ou quando os parâmetros de busca mudarem
  useEffect(() => {
    const fetchProntuarios = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
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
    };
    
    fetchProntuarios();
  }, [searchParams]);
  
  // Manipula a busca de prontuários
  const handleSearch = (formData: any) => {
    setSearchParams({
      ...searchParams,
      pagina: 0, // Reset para a primeira página
      termo: formData.termo || undefined,
      numeroProntuario: formData.numeroProntuario || undefined,
      tipoTratamento: formData.tipoTratamento || undefined,
      status: formData.status || undefined,
    });
  };
  
  // Manipula a mudança de página
  const handlePageChange = (page: number) => {
    setSearchParams({
      ...searchParams,
      pagina: page - 1, // API espera paginação base 0
    });
  };
  
  return (
    <div className="container-wide">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4 md:mb-0">Prontuários</h1>
        <Link to="/prontuarios/novo">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Novo Prontuário
          </Button>
        </Link>
      </div>
      
      <ProntuarioSearchForm onSearch={handleSearch} isLoading={isLoading} />
      
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
        pageSize={searchParams.tamanho}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProntuarioListPage;