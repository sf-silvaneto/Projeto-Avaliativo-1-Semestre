import React from 'react';
import { useForm } from 'react-hook-form';
import { Search, Filter, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
// TipoTratamento não é mais necessário aqui
import { StatusProntuario } from '../../types/prontuario';

interface SearchFormData {
  termo?: string;
  numeroProntuario?: string;
  // tipoTratamento?: TipoTratamento; // REMOVIDO
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
      // tipoTratamento: undefined, // REMOVIDO
      status: undefined,
    },
  });

  const watchFields = watch();
  // Ajustar a lógica de hasFilters se necessário, embora deva continuar funcionando
  const hasFilters = Object.values(watchFields).some(value => value && value !== '');

  const handleReset = () => {
    reset({ // Certificar que o reset também não inclua tipoTratamento
        termo: '',
        numeroProntuario: '',
        status: undefined,
    });
    onSearch({});
  };

  // tipoTratamentoOptions não é mais necessário
  // const tipoTratamentoOptions = [ ... ];

  const statusOptions = [
    { value: '', label: 'Todos os Status' }, // Adicionado para permitir limpar o filtro de status
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
            {/* Ajustar o grid se o campo de tipo de tratamento foi removido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Ex: md:grid-cols-2 se sobraram 2 filtros */}
              <Input
                label="Número do Prontuário"
                placeholder="Digite o número..."
                {...register('numeroProntuario')}
              />
              
              {/* O Select de Tipo de Tratamento foi removido daqui */}
              
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
              variant="link" // Alterado para link para melhor UX de limpar
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