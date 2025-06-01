import React from 'react';
import { useForm } from 'react-hook-form';
import { Search, Filter, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { StatusProntuario } from '../../types/prontuario';

interface SearchFormData {
  termo?: string;
  numeroProntuario?: string;
  // tipoTratamento?: TipoTratamento; // Confirmado como REMOVIDO
  status?: StatusProntuario;
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
      // tipoTratamento: undefined, // Confirmado como REMOVIDO
      status: undefined, 
    },
  });

  const watchFields = watch();
  const hasFilters = Object.values(watchFields).some(value => value && value !== '');

  const handleReset = () => {
    reset({
        termo: '',
        numeroProntuario: '',
        status: undefined, 
    });
    onSearch({}); 
  };

  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: StatusProntuario.ATIVO, label: 'Ativo' },
    { value: StatusProntuario.INATIVO, label: 'Inativo' },
    { value: StatusProntuario.ARQUIVADO, label: 'Arquivado' },
    { value: StatusProntuario.ALTA, label: 'Alta' },
  ];

  const [showAdvancedSearch, setShowAdvancedSearch] = React.useState(false);

  return (
    <div className="card mb-6">
      <form onSubmit={handleSubmit(onSearch)}>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome do paciente, nº prontuário ou CPF..."
              leftAddon={<Search className="h-5 w-5" />}
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
              aria-controls="advanced-search"
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
          <div id="advanced-search" className="border-t border-neutral-200 pt-4 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número do Prontuário Específico" 
                placeholder="Digite o número exato..."
                {...register('numeroProntuario')}
              />
              <Select
                label="Status do Prontuário"
                options={statusOptions}
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
              className="text-neutral-600 hover:text-error-600"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProntuarioSearchForm;