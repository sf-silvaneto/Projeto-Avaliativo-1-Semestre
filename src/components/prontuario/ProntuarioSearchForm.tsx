// sf-silvaneto/clientehm/ClienteHM-cec72d0146ab088abd633688e5d76c66bc940402/cliente-hm-front-main/src/components/prontuario/ProntuarioSearchForm.tsx
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
  const lastSearchedTermRef = useRef<string | undefined>(undefined); // Inicializado como undefined

  const inputRef = useRef<HTMLInputElement | null>(null);

  const triggerSearch = useCallback((data: SearchFormData) => {
    const searchTerm = data.termo?.trim() ? data.termo.trim() : undefined;
    
    // Condição para evitar a busca inicial com termo vazio
    if (searchTerm === undefined && lastSearchedTermRef.current === undefined) {
      // console.log('Initial empty state, skipping onSearch.'); // Remover ou comentar esta linha
      return; 
    }

    const hasEffectiveValueChanged = searchTerm !== lastSearchedTermRef.current;
    
    const wasPreviouslyFilled = lastSearchedTermRef.current !== undefined && lastSearchedTermRef.current !== '';
    const isNowEmpty = searchTerm === undefined || searchTerm === '';

    // Remover ou comentar as linhas de console.log abaixo
    // console.log('--- triggerSearch ---');
    // console.log('searchTerm:', searchTerm);
    // console.log('lastSearchedTermRef.current:', lastSearchedTermRef.current);
    // console.log('hasEffectiveValueChanged:', hasEffectiveValueChanged);
    // console.log('wasPreviouslyFilled:', wasPreviouslyFilled);
    // console.log('isNowEmpty:', isNowEmpty);

    if (hasEffectiveValueChanged || (isNowEmpty && wasPreviouslyFilled)) {
      // console.log('Calling onSearch with:', searchTerm); // Remover ou comentar esta linha
      onSearch({ termo: searchTerm });
      lastSearchedTermRef.current = searchTerm;
    } else {
      // console.log('No effective change, skipping onSearch.'); // Remover ou comentar esta linha
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
    // console.log('handleFormSubmit called with:', data.termo); // Remover ou comentar esta linha
    triggerSearch(data);
    inputRef.current?.focus(); 
  };

  const handleReset = () => {
    // console.log('handleReset called.'); // Remover ou comentar esta linha
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