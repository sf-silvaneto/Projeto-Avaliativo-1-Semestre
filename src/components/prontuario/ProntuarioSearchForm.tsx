import React, { useEffect, useRef, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  const { control, handleSubmit, reset, watch } = useForm<SearchFormData>({
    defaultValues: initialFilters,
  });

  const termoValue = watch('termo');
  const lastSearchedTermRef = useRef<string | undefined>(undefined);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const triggerSearch = useCallback((data: SearchFormData) => {
    const searchTerm = data.termo?.trim() ? data.termo.trim() : undefined;
    
    if (searchTerm === undefined && lastSearchedTermRef.current === undefined) {
      return; 
    }

    const hasEffectiveValueChanged = searchTerm !== lastSearchedTermRef.current;
    
    const wasPreviouslyFilled = lastSearchedTermRef.current !== undefined && lastSearchedTermRef.current !== '';
    const isNowEmpty = searchTerm === undefined || searchTerm === '';

    if (hasEffectiveValueChanged || (isNowEmpty && wasPreviouslyFilled)) {
      onSearch({ termo: searchTerm });
      lastSearchedTermRef.current = searchTerm;
    } else {
    }
  }, [onSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      triggerSearch({ termo: termoValue }); 
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [termoValue, triggerSearch]);

  useEffect(() => {
    if (inputRef.current && termoValue !== undefined && termoValue !== '' && !isLoading) { 
      inputRef.current.focus();
    }
  }, [isLoading, termoValue]); 

  const handleFormSubmit = (data: SearchFormData) => {
    triggerSearch(data);
    inputRef.current?.focus(); 
  };

  const handleReset = () => {
    reset({ termo: '' });
    onSearch({ termo: undefined });
    lastSearchedTermRef.current = undefined;
    inputRef.current?.focus(); 
  };
  
  const hasAnyFilterValue = watch('termo')?.trim();

  return (
    <Card className="mb-6"> 
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate> 
        <div className="flex flex-col md:flex-row gap-4 mb-1">
          <div className="flex-1">
            <Controller
              name="termo"
              control={control}
              render={({ field }) => (
                <Input
                  label="Buscar por Nome do Paciente, Nº Prontuário ou CPF"
                  placeholder="Digite para buscar..."
                  leftAddon={<Search className="h-4 w-4 text-gray-500" />}
                  {...field} 
                  ref={(e) => { 
                    field.ref(e); 
                    inputRef.current = e;
                  }}
                  aria-label="Buscar prontuários"
                  disabled={isLoading}
                />
              )}
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