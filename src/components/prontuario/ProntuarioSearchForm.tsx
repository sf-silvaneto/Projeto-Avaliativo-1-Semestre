// src/components/prontuario/ProntuarioSearchForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Search, Filter, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { StatusProntuario } from '../../types/prontuario'; // Importa o enum StatusProntuario atualizado

interface SearchFormData {
  termo?: string;
  numeroProntuario?: string;
  status?: StatusProntuario | ''; // Permite string vazia para "Todos os Status"
}

interface ProntuarioSearchFormProps {
  onSearch: (data: SearchFormData) => void;
  isLoading?: boolean;
}

const ProntuarioSearchForm: React.FC<ProntuarioSearchFormProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const { register, handleSubmit, reset, watch } = useForm<SearchFormData>({
    defaultValues: {
      termo: '',
      numeroProntuario: '',
      status: '', // Default para string vazia, que corresponde a "Todos os Status"
    },
  });

  const watchFields = watch();
  const hasFilters = Object.values(watchFields).some(value => value && value !== '');

  const handleReset = () => {
    reset({
        termo: '',
        numeroProntuario: '',
        status: '',
    });
    onSearch({}); // Submete a busca com filtros limpos
  };

  // ===== OPÇÕES DE STATUS CORRIGIDAS PARA O FILTRO =====
  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: StatusProntuario.INTERNADO, label: 'Internado' },
    { value: StatusProntuario.ARQUIVADO, label: 'Arquivado' },
  ];
  // =====================================================

  const [showAdvancedSearch, setShowAdvancedSearch] = React.useState(false);

  return (
    <div className="card mb-6">
      <form onSubmit={handleSubmit(onSearch)}>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome do paciente, nº prontuário ou CPF..."
              leftAddon={<Search className="h-5 w-5 text-gray-400" />}
              {...register('termo')}
              aria-label="Buscar prontuários"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              leftIcon={<Filter className="h-4 w-4" />}
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              aria-expanded={showAdvancedSearch}
              aria-controls="advanced-search-filters"
            >
              Filtros Avançados
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Buscar
            </Button>
          </div>
        </div>

        {showAdvancedSearch && (
          <div id="advanced-search-filters" className="border-t border-gray-200 pt-4 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número do Prontuário Específico"
                placeholder="Digite o número exato..."
                {...register('numeroProntuario')}
              />
              <Select
                label="Status do Prontuário"
                options={statusOptions} // Utiliza as opções corrigidas
                {...register('status')}
              />
            </div>
          </div>
        )}

        {hasFilters && (
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              variant="link"
              size="sm"
              leftIcon={<X className="h-4 w-4" />}
              onClick={handleReset}
              className="text-gray-600 hover:text-red-600"
            >
              Limpar filtrosss
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProntuarioSearchForm;