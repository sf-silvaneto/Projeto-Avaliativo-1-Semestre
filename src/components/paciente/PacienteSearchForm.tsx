// src/components/paciente/PacienteSearchForm.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Search } from 'lucide-react';
import Button from '../../components/ui/Button'; // Ajustado para o caminho correto
import Input from '../../components/ui/Input';   // Ajustado para o caminho correto

interface SearchFormData {
  nome?: string;
  cpf?: string;
}

interface PacienteSearchFormProps {
  onSearch: (data: SearchFormData) => void;
  initialFilters?: SearchFormData;
}

const DEBOUNCE_DELAY = 500; // Milissegundos para o debounce

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
    // Prepara os dados para a busca:
    // - Remove espaços em branco das pontas.
    // - Se o campo estiver vazio após o trim, envia undefined para não filtrar por ele.
    // - Para nome, agora busca a partir do primeiro caractere.
    const searchData: SearchFormData = {
      nome: data.nome?.trim() ? data.nome.trim() : undefined,
      cpf: data.cpf?.trim() ? data.cpf.trim() : undefined,
    };

    // Só busca se os valores efetivos (nome ou cpf) mudaram desde a última busca
    // OU se ambos os campos estão agora vazios mas antes tinham algum valor (para limpar a busca)
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
    // O debounce garante que a busca não seja disparada a cada milissegundo enquanto o usuário digita.
    const handler = setTimeout(() => {
      triggerSearch(currentValues);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler); // Limpa o timeout se o componente desmontar ou os valores mudarem antes do debounce.
    };
  }, [nomeValue, cpfValue, triggerSearch]); // Re-executa o efeito se nomeValue, cpfValue ou triggerSearch mudarem.

  const handleReset = () => {
    reset({ nome: '', cpf: '' });
    // O useEffect capturará a mudança e chamará triggerSearch, que por sua vez chamará onSearch com os campos vazios.
  };

  // Chamado se o formulário for submetido explicitamente (ex: pressionando Enter)
  const handleFormSubmit = (data: SearchFormData) => {
    triggerSearch(data); // Força a busca com os valores atuais do formulário
  };
  
  // Verifica se algum filtro tem valor para mostrar o botão de limpar
  const hasAnyFilterValue = (watch('nome')?.trim() || watch('cpf')?.trim());


  return (
    <div className="card mb-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate> {/* noValidate para desabilitar validação HTML5 padrão */}
        <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
          <div className="flex-grow">
            <Controller
              name="nome"
              control={control}
              defaultValue="" // Garante que o valor inicial seja uma string vazia
              render={({ field }) => (
                <Input
                  label="Buscar por Nome do Paciente"
                  placeholder="Digite o nome..."
                  value={field.value || ''} // Garante que o valor não seja null/undefined para o input
                  onChange={(e) => {
                    const valorInput = e.target.value;
                    // Permite letras, espaços e acentos. Remove números e outros símbolos.
                    const valorFiltrado = valorInput.replace(/[^a-zA-ZÀ-ú\s]/g, '');
                    field.onChange(valorFiltrado);
                  }}
                  onBlur={field.onBlur}
                  ref={field.ref} // Passa a ref para o Input (se ele encaminhar para o input HTML)
                  leftAddon={<Search className="h-4 w-4" />}
                />
              )}
            />
          </div>
          <div className="flex-grow">
            <Controller
              name="cpf"
              control={control}
              defaultValue="" // Garante que o valor inicial seja uma string vazia
              render={({ field }) => (
                <Input
                  label="Buscar por CPF"
                  placeholder="Digite o CPF..."
                  value={field.value || ''} // Garante que o valor não seja null/undefined para o input
                  onChange={(e) => {
                    const valorInput = e.target.value;
                    // Permite apenas números no CPF e limita a 11 caracteres
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
           {/* // O botão de submit manual foi removido pois a busca é automática com debounce.
           // Se precisar dele, descomente e passe a prop isLoading de PacienteListPage.
           <Button type="submit" variant="primary" isLoading={isLoading} className="w-full md:w-auto">
             Buscar
           </Button> 
           */}
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