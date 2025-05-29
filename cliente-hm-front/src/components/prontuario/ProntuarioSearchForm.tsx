import React from 'react';
import { useForm } from 'react-hook-form';
import { Search, Filter, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { TipoTratamento, StatusProntuario } from '../../types/prontuario';

interface SearchFormData {
  termo?: string;
  numeroProntuario?: string;
  tipoTratamento?: TipoTratamento;
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
  const { register, handleSubmit, reset, setValue, watch } = useForm<SearchFormData>({
    defaultValues: {
      termo: '',
      numeroProntuario: '',
      tipoTratamento: undefined,
      status: undefined,
    },
  });

  const watchFields = watch();
  const hasFilters = Object.values(watchFields).some(value => value && value !== '');

  const handleReset = () => {
    reset();
    onSearch({});
  };

  const tipoTratamentoOptions = [
    { value: TipoTratamento.TERAPIA_INDIVIDUAL, label: 'Terapia Individual' },
    { value: TipoTratamento.TERAPIA_CASAL, label: 'Terapia de Casal' },
    { value: TipoTratamento.TERAPIA_GRUPO, label: 'Terapia de Grupo' },
    { value: TipoTratamento.TERAPIA_FAMILIAR, label: 'Terapia Familiar' },
    { value: TipoTratamento.OUTRO, label: 'Outro' },
  ];

  const statusOptions = [
    { value: StatusProntuario.ATIVO, label: 'Ativo' },
    { value: StatusProntuario.INATIVO, label: 'Inativo' },
    { value: StatusProntuario.ARQUIVADO, label: 'Arquivado' },
  ];

  const [showAdvancedSearch, setShowAdvancedSearch] = React.useState(false);

  return (
    <div className="card mb-6">
      <form onSubmit={handleSubmit(onSearch)}>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome, número ou CPF..."
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
              Filtros
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Número do Prontuário"
                placeholder="Digite o número..."
                {...register('numeroProntuario')}
              />
              
              <Select
                label="Tipo de Tratamento"
                options={tipoTratamentoOptions}
                {...register('tipoTratamento')}
              />
              
              <Select
                label="Status"
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
              variant="secondary"
              size="sm"
              leftIcon={<X className="h-4 w-4" />}
              onClick={handleReset}
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