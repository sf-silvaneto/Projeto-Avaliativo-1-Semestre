import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, FormProvider, Controller, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { NovoProntuarioRequest } from '../../types/prontuario';
import { Medico, StatusMedico } from '../../types/medico';
import { Paciente, BuscaPacienteParams } from '../../types/paciente';
import { buscarMedicos } from '../../services/medicoService';
import { buscarPacientes } from '../../services/pacienteService';
import { 
  ChevronRight, ChevronLeft, Save, User, Stethoscope, FileText, 
  ArrowLeft, Search, AlertCircle, Loader2, Users
} from 'lucide-react';

// Schema Zod MODIFICADO
const prontuarioSchema = z.object({
  pacienteId: z.string().min(1, 'Paciente é obrigatório. Realize a busca e selecione um paciente.'),
  medicoId: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    // MODIFICADO: Alterado required_error para "Selecione um médico."
    z.number({ required_error: "Selecione um médico." }).positive("Médico responsável é obrigatório.") 
  ),
  historicoMedico: z.object({
    descricao: z.string().min(10, 'Descrição do histórico deve ter pelo menos 10 caracteres.'),
  }),
});

type ProntuarioFormData = z.infer<typeof prontuarioSchema> & {
  pacienteNomeFormatado?: string;
};

const formatCPFDisplay = (cpf: string): string => {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpf; 
};

const formatCPFInput = (value: string): string => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '').substring(0, 11);

    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.substring(0, 3)}.${digits.substring(3)}`;
    if (digits.length <= 9) return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6)}`;
    return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9)}`;
};

// --- COMPONENTE SelecaoEntidadesStep MODIFICADO ---
const SelecaoEntidadesStep: React.FC = () => {
  const { control, formState: { errors }, setValue, watch, getValues } = useFormContext<ProntuarioFormData>();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [searchTermPaciente, setSearchTermPaciente] = useState(watch('pacienteNomeFormatado') || '');
  const [isSearchingPacientes, setIsSearchingPacientes] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [showPacienteSuggestions, setShowPacienteSuggestions] = useState(false);
  
  const pacienteIdAtual = watch('pacienteId');
  const nomePacienteFormatadoAtual = watch('pacienteNomeFormatado'); // Nome do paciente selecionado no form

  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carregarMedicos = async () => {
      try {
        const response = await buscarMedicos({ status: StatusMedico.ATIVO, tamanho: 200, pagina: 0 });
        setMedicos(response.content);
      } catch (error) {
        console.error("Erro ao buscar médicos:", error);
      }
    };
    carregarMedicos();
  }, []);

  const performSearch = useCallback(async (term: string) => {
    if (term.trim().length <= 2) {
      setPacientes([]);
      setShowPacienteSuggestions(false);
      setSearchAttempted(false);
      return;
    }
    setIsSearchingPacientes(true);
    setSearchAttempted(true);

    const params: BuscaPacienteParams = { tamanho: 10, pagina: 0 };
    const justDigitsInTerm = term.replace(/\D/g, '');
    
    const isPotentiallyCpf = /^\d+$/.test(justDigitsInTerm) && justDigitsInTerm.length >= 3 && justDigitsInTerm.length <= 11;

    if (isPotentiallyCpf) {
      params.cpf = justDigitsInTerm;
    } else {
      params.nome = term;
    }

    try {
      const response = await buscarPacientes(params);
      setPacientes(response.content);
      setShowPacienteSuggestions(true); 
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
      setPacientes([]);
      setShowPacienteSuggestions(true); 
    } finally {
      setIsSearchingPacientes(false);
    }
  }, []); 

  // MODIFICADO: Lógica para gerenciar busca e exibição de sugestões de paciente
  useEffect(() => {
    // Se o termo de busca (no input) é diferente do nome do paciente já selecionado (no form),
    // E um paciente está de fato selecionado (pacienteIdAtual existe),
    // então o usuário está tentando buscar um novo paciente. Devemos limpar o ID do paciente anterior.
    if (searchTermPaciente !== nomePacienteFormatadoAtual && pacienteIdAtual) {
        setValue('pacienteId', '', { shouldValidate: true });
        // O `pacienteNomeFormatado` no form não precisa ser limpo aqui, pois ele só deve
        // refletir um paciente *confirmado* pela seleção. Se `pacienteId` está limpo,
        // as condições abaixo tratarão de permitir uma nova busca.
    }

    const trimmedSearchTerm = searchTermPaciente.trim();

    // Se o campo de busca está vazio
    if (trimmedSearchTerm.length === 0) {
        setPacientes([]);
        setShowPacienteSuggestions(false);
        setSearchAttempted(false);
        // Se havia um paciente selecionado e o campo foi limpo, deselecione-o (limpe o ID).
        if (pacienteIdAtual) { // Verifica o valor atual de pacienteId (do watch)
            setValue('pacienteId', '', { shouldValidate: true });
            // Não é necessário limpar pacienteNomeFormatado aqui, pois ele não é usado para disparar a busca.
        }
        return; // Interrompe o efeito aqui para campo vazio.
    }

    // Se um paciente está selecionado (pacienteIdAtual existe) E
    // o termo de busca (searchTermPaciente) é EXATAMENTE o nome formatado desse paciente (nomePacienteFormatadoAtual)
    // Isso significa que o campo de input está refletindo o paciente já selecionado. Não faça nova busca.
    // Use getValues para garantir que estamos comparando com os valores mais recentes do formulário,
    // embora `watch` deva fornecer isso.
    const currentFormPacienteId = getValues('pacienteId');
    const currentFormPacienteNome = getValues('pacienteNomeFormatado');

    if (currentFormPacienteId && searchTermPaciente === currentFormPacienteNome) {
        setShowPacienteSuggestions(false); // Garante que as sugestões fiquem fechadas.
        // Como um paciente está selecionado e o campo o reflete, não há necessidade de buscar.
        // As listas de pacientes e o status de tentativa de busca já foram resetados em handlePacienteSelect.
        return; // Interrompe o efeito aqui.
    }

    // Se o termo de busca tem mais de 2 caracteres (e não se encaixa nos casos acima)
    if (trimmedSearchTerm.length > 2) {
        const timerId = setTimeout(() => {
            performSearch(trimmedSearchTerm);
        }, 500); 
        return () => clearTimeout(timerId);
    } else { // Termo tem 2 ou menos caracteres (e não está vazio)
        setShowPacienteSuggestions(false);
        setPacientes([]);
        // Não resetar searchAttempted aqui, pois o usuário pode estar apenas começando a digitar.
    }
  }, [searchTermPaciente, performSearch, nomePacienteFormatadoAtual, pacienteIdAtual, setValue, getValues]);


  const medicoOptions = medicos.map(medico => ({
    value: medico.id.toString(),
    label: `${medico.nomeCompleto} (${medico.especialidade}) CRM: ${medico.crm} `
  }));
  
  const handlePacienteSelect = (paciente: Paciente) => {
    const nomeFormatado = `${paciente.nome} - CPF: ${formatCPFDisplay(paciente.cpf)}`;
    setValue('pacienteId', paciente.id.toString(), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('pacienteNomeFormatado', nomeFormatado, { shouldValidate: false }); // Atualiza o campo do form
    setSearchTermPaciente(nomeFormatado); // Atualiza o estado do input de busca
    setShowPacienteSuggestions(false);
    setPacientes([]); 
    setSearchAttempted(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowPacienteSuggestions(false);
      }
    }
    if (showPacienteSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPacienteSuggestions]);

  return (
    <div className="animate-fade-in space-y-6">
      <h3 className="text-xl font-semibold text-neutral-800 border-b border-neutral-300 pb-3 mb-6">
        Vincular Paciente e Médico
      </h3>
      
      <div className="p-5 border border-neutral-200 rounded-lg bg-white shadow-soft relative" ref={suggestionsRef}>
        <Controller
            name="pacienteNomeFormatado" // O Controller está aqui para RHF conhecer o campo, mas o input é controlado por searchTermPaciente
            control={control}
            render={({ field }) => ( // field não é usado diretamente para value/onChange do Input principal, mas poderia ser.
                <Input
                    label="Buscar e Selecionar Paciente por Nome ou CPF*"
                    placeholder="Digite nome ou CPF para buscar..."
                    value={searchTermPaciente} // Controlado pelo estado local
                    onChange={(e) => {
                        const rawValue = e.target.value;
                        let displayValue = rawValue;
                        const hasLetters = /[a-zA-ZÀ-ú]/.test(rawValue);

                        if (!hasLetters) {
                            displayValue = formatCPFInput(rawValue);
                        }
                        setSearchTermPaciente(displayValue); // Atualiza o estado local
                    }}
                    onFocus={() => {
                        // Reabre sugestões no foco se:
                        // 1. Termo é > 2 caracteres.
                        // 2. E (NÃO há paciente selecionado E o termo não é o nome dele)
                        // 3. E (há pacientes na lista OU uma busca foi tentada e falhou)
                        // Basicamente, se há algo para mostrar e não é um paciente já selecionado.
                        const trimmedSearchTerm = searchTermPaciente.trim();
                        if (trimmedSearchTerm.length > 2 &&
                            !(pacienteIdAtual && searchTermPaciente === nomePacienteFormatadoAtual) &&
                            (pacientes.length > 0 || (searchAttempted && pacientes.length === 0))
                        ) {
                            setShowPacienteSuggestions(true);
                        }
                    }}
                    leftAddon={<Search className="h-5 w-5 text-neutral-500" />}
                    error={errors.pacienteId?.message} // Erro de pacienteId é mostrado aqui
                    helperText="Digite o nome ou CPF para buscar e clique para selecionar."
                    autoComplete="off"
                />
            )}
        />
      
        {showPacienteSuggestions && (
            <div 
                className="absolute z-10 w-[calc(100%-2.5rem)] mt-1 max-h-60 overflow-y-auto bg-white border border-neutral-300 rounded-md shadow-lg"
            >
                {isSearchingPacientes && (
                    <div className="px-4 py-3 text-sm text-neutral-500 flex items-center">
                        <Loader2 size={16} className="mr-2 animate-spin" /> Buscando...
                    </div>
                )}
                {!isSearchingPacientes && pacientes.length > 0 && (
                    pacientes.map(paciente => (
                        <div
                            key={paciente.id}
                            onClick={() => handlePacienteSelect(paciente)}
                            className="px-4 py-3 hover:bg-neutral-100 cursor-pointer text-sm border-b border-neutral-100 last:border-b-0"
                        >
                            <p className="font-medium text-neutral-800">{paciente.nome}</p>
                            <p className="text-xs text-neutral-500">CPF: {formatCPFDisplay(paciente.cpf)}</p> 
                        </div>
                    ))
                )}
                {!isSearchingPacientes && searchAttempted && pacientes.length === 0 && searchTermPaciente.trim().length > 2 && (
                    <div className="px-4 py-3 text-sm text-neutral-500">
                        Nenhum paciente encontrado para "<span className="font-medium">{searchTermPaciente}</span>".
                        <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => {
                                window.open('/pacientes/novo', '_blank');
                            }}
                            className="p-0 h-auto ml-1 text-primary-600 hover:text-primary-700 font-medium inline"
                        >
                            Cadastrar Novo?
                        </Button>
                    </div>
                )}
            </div>
        )}
      </div>

      <div className="p-5 border border-neutral-200 rounded-lg bg-white shadow-soft">
        <Controller
          name="medicoId"
          control={control}
          render={({ field }) => (
            <Select
              label="Médico Responsável*"
              // A opção placeholder já tem "Selecione um médico"
              options={[{value: "", label: "Selecione um médico"}, ...medicoOptions]} 
              {...field}
              value={field.value || ""} 
              error={errors.medicoId?.message} // Agora mostrará "Selecione um médico." se vazio
              leftAddon={<Stethoscope className="h-5 w-5 text-neutral-500" />}
            />
          )}
        />
      </div>
    </div>
  );
};
// --- FIM DO COMPONENTE SelecaoEntidadesStep MODIFICADO ---


// --- COMPONENTE InformacoesIniciaisStep (sem alterações) ---
const InformacoesIniciaisStep: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<ProntuarioFormData>();
  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold text-neutral-800 border-b border-neutral-300 pb-3 mb-6">
        Informações Iniciais do Prontuário
      </h3>
      <div className="grid grid-cols-1 gap-6">
        <div className="p-5 border border-neutral-200 rounded-lg bg-white shadow-soft">
            <Textarea
              label="Histórico Médico Inicial / Queixa Principal*"
              placeholder="Descreva o histórico médico inicial e/ou a queixa principal do paciente..."
              rows={6}
              {...register('historicoMedico.descricao')}
              error={errors.historicoMedico?.descricao?.message}
              required
            />
        </div>
      </div>
    </div>
  );
};
// --- FIM DO COMPONENTE InformacoesIniciaisStep ---


// --- Interface ProntuarioFormProps (sem alterações) ---
interface ProntuarioFormProps {
  onSubmit: (data: NovoProntuarioRequest) => void;
  initialData?: Partial<Omit<NovoProntuarioRequest, 'tipoTratamento'> & { pacienteNomeFormatado?: string; pacienteId?: string; medicoId?: number; historicoMedico?: { descricao: string} }>;
  isLoading?: boolean;
}
// --- FIM DA Interface ProntuarioFormProps ---


// --- COMPONENTE ProntuarioForm (sem alterações diretas na lógica principal) ---
const ProntuarioForm: React.FC<ProntuarioFormProps> = ({
  onSubmit,
  initialData, 
  isLoading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const methods = useForm<ProntuarioFormData>({
    resolver: zodResolver(prontuarioSchema),
    defaultValues: {
      pacienteId: initialData?.pacienteId || '',
      medicoId: initialData?.medicoId || undefined,
      historicoMedico: {
        descricao: initialData?.historicoMedico?.descricao || '',
      },
      pacienteNomeFormatado: initialData?.pacienteNomeFormatado || '', 
    },
    mode: "onTouched", 
  });
  
  const steps = [
    { title: 'Paciente e Médico', icon: <Users className="h-4 w-4" />, component: <SelecaoEntidadesStep /> },
    { title: 'Informações Iniciais', icon: <FileText className="h-4 w-4" />, component: <InformacoesIniciaisStep /> },
  ];
  
  const nextStep = async () => {
    console.log("Attempting to go to next step from step:", currentStep);
    let fieldsToValidate: (keyof ProntuarioFormData)[] | string[] = [];
    
    if (currentStep === 0) {
      fieldsToValidate = ['pacienteId', 'medicoId'];
    }
    
    console.log("Fields to validate for nextStep:", fieldsToValidate);
    const isValidCurrentStep = fieldsToValidate.length > 0 
      ? await methods.trigger(fieldsToValidate as any, { shouldFocus: true }) 
      : true;
    
    console.log("Is current step valid?", isValidCurrentStep);
    console.log("Current form errors after trigger:", methods.formState.errors);
    
    if (isValidCurrentStep && currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        console.log("Moved to next step:", currentStep + 1);
    } else if (!isValidCurrentStep) {
        console.log("Validation failed for current step. Errors:", methods.formState.errors);
    }
  };
  
  const handleVoltarClick = () => { 
    if (currentStep === 0) {
      navigate(-1); 
    } else {
      setCurrentStep(currentStep - 1); 
    }
  };
  
  const handleSubmitForm = methods.handleSubmit(
    (data) => {
      console.log("Form submitted successfully with data:", data);
      const submissionData: NovoProntuarioRequest = {
        pacienteId: data.pacienteId, 
        medicoId: Number(data.medicoId),
        historicoMedico: {
          descricao: data.historicoMedico.descricao,
        },
      };
      onSubmit(submissionData);
    },
    (errors) => {
      console.error("FORM SUBMISSION FAILED - Validation errors:", errors);
      if ((errors.pacienteId || errors.medicoId) && currentStep === 1) {
        setCurrentStep(0);
      }
    }
  );
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmitForm}>
        <div className="mb-8">
          <ol className="flex items-center w-full">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <li className={`flex w-full items-center ${index <= currentStep ? 'text-primary-600 dark:text-primary-500' : 'text-neutral-500 dark:text-neutral-400'} ${index < steps.length -1 ? `after:content-[''] after:w-full after:h-1 after:border-b ${index < currentStep ? 'after:border-primary-600 dark:after:border-primary-500' : 'after:border-neutral-200 dark:after:border-neutral-700'} after:border-1 after:inline-block` : ''}`}>
                  <div className={`flex items-center justify-center w-10 h-10 ${index <= currentStep ? 'bg-primary-100 dark:bg-primary-800' : 'bg-neutral-100 dark:bg-neutral-800'} rounded-full lg:h-12 lg:w-12 shrink-0`}>
                    {React.cloneElement(step.icon, { className: `w-5 h-5 lg:w-6 lg:h-6 ${index <= currentStep ? 'text-primary-600 dark:text-primary-300' : 'text-neutral-500 dark:text-neutral-400'}`})}
                  </div>
                </li>
              </React.Fragment>
            ))}
          </ol>
            <div className="mt-3 flex justify-between text-sm font-medium">
            {steps.map((step, index) => (
              <span key={`label-${index}`} className={`w-1/${steps.length} text-center ${index <= currentStep ? 'text-primary-600 font-semibold' : 'text-neutral-500'}`}>{step.title}</span>
            ))}
            </div>
        </div>
        
        <div className="mb-8 min-h-[350px]">
          {steps.map((step, index) => (
            <div key={index} style={{ display: index === currentStep ? 'block' : 'none' }}>
              {step.component}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end items-center gap-3 pt-6 border-t border-neutral-300 mt-8">
          <Button
            type="button"
            variant="secondary"
            onClick={handleVoltarClick}
            disabled={isLoading}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            {currentStep === 0 ? 'Voltar' : 'Anterior'} 
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
              disabled={isLoading}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Próximo
            </Button>
          ) : (
            <Button
              type="submit"
              variant="success" 
              isLoading={isLoading}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Salvar Prontuário
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};
// --- FIM DO COMPONENTE ProntuarioForm ---

export default ProntuarioForm;