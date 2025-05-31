import React, { useEffect, useRef, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface SearchFormData {
  nome?: string;
  cpf?: string;
}

interface PacienteSearchFormProps {
  onSearch: (data: SearchFormData) => void;
  initialFilters?: SearchFormData;
}

const DEBOUNCE_DELAY = 500;

const PacienteSearchForm: React.FC<PacienteSearchFormProps> = ({
  onSearch,
  initialFilters = { nome: '', cpf: '' },
}) => {
  const { handleSubmit, reset, watch, control } = useForm<SearchFormData>({
    defaultValues: initialFilters,
  });

  const nomeValue = watch('nome');
  const cpfValue = watch('cpf');

  const lastSearchedValuesRef = useRef<SearchFormData>(initialFilters);

  const triggerSearch = useCallback((data: SearchFormData) => {
    const searchData: SearchFormData = {
      nome: data.nome?.trim() ? data.nome.trim() : undefined,
      cpf: data.cpf?.trim() ? data.cpf.trim() : undefined,
    };

    const hasEffectiveValueChanged =
      searchData.nome !== lastSearchedValuesRef.current.nome ||
      searchData.cpf !== lastSearchedValuesRef.current.cpf;

    const wereFieldsPreviouslyFilled =
      lastSearchedValuesRef.current.nome || lastSearchedValuesRef.current.cpf;

    const areFieldsNowEmpty = !searchData.nome && !searchData.cpf;

    if (hasEffectiveValueChanged || (areFieldsNowEmpty && wereFieldsPreviouslyFilled)) {
      onSearch(searchData);
      lastSearchedValuesRef.current = searchData;
    }
  }, [onSearch]);

  useEffect(() => {
    const currentValues = { nome: nomeValue, cpf: cpfValue };
    const handler = setTimeout(() => {
      triggerSearch(currentValues);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [nomeValue, cpfValue, triggerSearch]);

  const handleReset = () => {
    reset({ nome: '', cpf: '' });
  };

  const handleFormSubmit = (data: SearchFormData) => {
    triggerSearch(data);
  };
  
  const hasAnyFilterValue = (watch('nome')?.trim() || watch('cpf')?.trim());


  return (
    <div className="card mb-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
          <div className="flex-grow">
            <Controller
              name="nome"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  label="Buscar por Nome do Paciente"
                  placeholder="Digite o nome..."
                  value={field.value || ''}
                  onChange={(e) => {
                    const valorInput = e.target.value;
                    const valorFiltrado = valorInput.replace(/[^a-zA-ZÀ-ú\s]/g, '');
                    field.onChange(valorFiltrado);
                  }}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  leftAddon={<Search className="h-4 w-4" />}
                />
              )}
            />
          </div>
          <div className="flex-grow">
            <Controller
              name="cpf"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  label="Buscar por CPF"
                  placeholder="Digite o CPF..."
                  value={field.value || ''}
                  onChange={(e) => {
                    const valorInput = e.target.value;
                    const valorApenasNumeros = valorInput.replace(/\D/g, '');
                    field.onChange(valorApenasNumeros.slice(0, 11));
                  }}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  maxLength={11}
                  leftAddon={<Search className="h-4 w-4" />}
                />
              )}
            />
          </div>
        </div>

        {hasAnyFilterValue && (
          <div className="flex justify-end">
            <Button type="button" variant="link" size="sm" onClick={handleReset} className="text-sm">
              Limpar Filtros
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PacienteSearchForm;