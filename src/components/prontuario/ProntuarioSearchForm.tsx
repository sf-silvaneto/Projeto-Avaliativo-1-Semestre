import React, { useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Search, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

interface SearchFormData {
  termo?: string;
}

interface ProntuarioSearchFormProps {
  onSearch: (data: SearchFormData) => void;
  isLoading?: boolean;
  initialFilters?: SearchFormData;
}

const DEBOUNCE_DELAY = 500;

const ProntuarioSearchForm: React.FC<ProntuarioSearchFormProps> = ({
  onSearch,
  isLoading = false,
  initialFilters = { termo: '' },
}) => {
  const { register, handleSubmit, reset, watch } = useForm<SearchFormData>({
    defaultValues: initialFilters,
  });

  const termoValue = watch('termo');
  const lastSearchedTermRef = useRef<string | undefined>(initialFilters.termo);

  const triggerSearch = useCallback((data: SearchFormData) => {
    const searchTerm = data.termo?.trim() ? data.termo.trim() : undefined;
    const hasEffectiveValueChanged = searchTerm !== lastSearchedTermRef.current;
    const wasPreviouslyFilled = lastSearchedTermRef.current !== undefined && lastSearchedTermRef.current !== '';
    const isNowEmpty = searchTerm === undefined || searchTerm === '';

    if (hasEffectiveValueChanged || (isNowEmpty && wasPreviouslyFilled)) {
      onSearch({ termo: searchTerm });
      lastSearchedTermRef.current = searchTerm;
    }
  }, [onSearch]);

  useEffect(() => {
    const currentValues = { termo: termoValue };
    const handler = setTimeout(() => {
      triggerSearch(currentValues);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [termoValue, triggerSearch]);

  const handleFormSubmit = (data: SearchFormData) => {
    triggerSearch(data);
  };

  const handleReset = () => {
    reset({ termo: '' });
    onSearch({ termo: undefined });
    lastSearchedTermRef.current = undefined;
  };
  
  const hasAnyFilterValue = watch('termo')?.trim();

  return (
    <Card className="mb-6"> 
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate> 
        <div className="flex flex-col md:flex-row gap-4 mb-1">
          <div className="flex-1">
            <Input
              label="Buscar por Nome do Paciente, Nº Prontuário ou CPF"
              placeholder="Digite para buscar..."
              leftAddon={<Search className="h-4 w-4 text-gray-500" />}
              {...register('termo')}
              aria-label="Buscar prontuários"
              disabled={isLoading}
            />
          </div>
        </div>

        {hasAnyFilterValue && (
          <div className="flex justify-end mt-2">
            <Button
              type="button"
              variant="link"
              size="sm"
              leftIcon={<X className="h-4 w-4" />}
              onClick={handleReset}
              className="text-gray-600 hover:text-red-600"
              disabled={isLoading}
            >
              Limpar filtro
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
};

export default ProntuarioSearchForm;