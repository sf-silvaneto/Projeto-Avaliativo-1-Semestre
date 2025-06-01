// src/components/prontuario/ProntuarioForm.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, FormProvider, Controller, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import {
    NovaConsultaRequest,
    NovaInternacaoRequest,
    // AdicionarExameRequest, // Descomente se for usar
    TipoPrimeiroRegistro
} from '../../types/prontuarioRegistros';
import { Medico, StatusMedico } from '../../types/medico';
import { Paciente, BuscaPacienteParams } from '../../types/paciente';
import { buscarMedicos } from '../../services/medicoService';
import { buscarPacientes } from '../../services/pacienteService';
import {
  ChevronRight, ChevronLeft, User, Stethoscope, FileText,
  ArrowLeft, Search, Loader2, Users, Activity, BedDouble, Microscope, Scissors, AlertCircle
} from 'lucide-react';

// Importar os sub-formulários de evento
import ConsultaForm from './ConsultaForm'; // Garanta que este arquivo existe e exporta ConsultaForm
import InternacaoForm from './InternacaoForm'; // Garanta que este arquivo existe e exporta InternacaoForm
// import ExameForm from './ExameForm'; // Exemplo, se você criar este formulário

// Schemas Zod:
const selecaoEntidadeSchema = z.object({
  pacienteId: z.string().min(1, 'Paciente é obrigatório. Realize a busca e selecione um paciente.'),
  medicoId: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number({ required_error: "Selecione um médico responsável inicial." }).positive("Médico responsável é obrigatório.")
  ),
  pacienteNomeFormatado: z.string().optional(),
});
type SelecaoEntidadeFormData = z.infer<typeof selecaoEntidadeSchema>;

const tipoRegistroSchema = z.object({
  tipoPrimeiroRegistro: z.enum(['CONSULTA', 'INTERNACAO', 'EXAME', 'CIRURGIA', 'ANOTACAO_GERAL'], {
    required_error: "Selecione o tipo de registro a ser criado.",
    invalid_type_error: "Tipo de registro inválido.",
  }),
});
type TipoRegistroFormData = z.infer<typeof tipoRegistroSchema>;

export interface ProntuarioWizardFormData extends SelecaoEntidadeFormData, TipoRegistroFormData {}

// --- COMPONENTE SelecaoEntidadesStep ---
const SelecaoEntidadesStep: React.FC = () => {
  const { control, formState: { errors }, setValue, watch, getValues } = useFormContext<ProntuarioWizardFormData>();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [searchTermPaciente, setSearchTermPaciente] = useState(watch('pacienteNomeFormatado') || '');
  const [isSearchingPacientes, setIsSearchingPacientes] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [showPacienteSuggestions, setShowPacienteSuggestions] = useState(false);
  
  const pacienteIdAtual = watch('pacienteId');
  const nomePacienteFormatadoAtual = watch('pacienteNomeFormatado');
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
  
  const formatCPFDisplay = (cpf: string): string => {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.length === 11 ? cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : cpf;
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

  const performSearch = useCallback(async (term: string) => {
    if (term.trim().length <= 2) {
      setPacientes([]); setShowPacienteSuggestions(false); setSearchAttempted(false); return;
    }
    setIsSearchingPacientes(true); setSearchAttempted(true);
    const params: BuscaPacienteParams = { tamanho: 10, pagina: 0 };
    const justDigitsInTerm = term.replace(/\D/g, '');
    const isPotentiallyCpf = /^\d+$/.test(justDigitsInTerm) && justDigitsInTerm.length >= 3 && justDigitsInTerm.length <= 11;
    if (isPotentiallyCpf) params.cpf = justDigitsInTerm; else params.nome = term;

    try {
      const response = await buscarPacientes(params);
      setPacientes(response.content); setShowPacienteSuggestions(true); 
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error); setPacientes([]); setShowPacienteSuggestions(true); 
    } finally {
      setIsSearchingPacientes(false);
    }
  }, []); 

  useEffect(() => {
    if (searchTermPaciente !== nomePacienteFormatadoAtual && pacienteIdAtual) {
        setValue('pacienteId', '', { shouldValidate: true });
    }
    const trimmedSearchTerm = searchTermPaciente.trim();
    if (trimmedSearchTerm.length === 0) {
        setPacientes([]); setShowPacienteSuggestions(false); setSearchAttempted(false);
        if (pacienteIdAtual) setValue('pacienteId', '', { shouldValidate: true });
        return;
    }
    const currentFormPacienteId = getValues('pacienteId');
    const currentFormPacienteNome = getValues('pacienteNomeFormatado');
    if (currentFormPacienteId && searchTermPaciente === currentFormPacienteNome) {
        setShowPacienteSuggestions(false); return;
    }
    if (trimmedSearchTerm.length > 2) {
        const timerId = setTimeout(() => performSearch(trimmedSearchTerm), 500); 
        return () => clearTimeout(timerId);
    } else { 
        setShowPacienteSuggestions(false); setPacientes([]);
    }
  }, [searchTermPaciente, performSearch, nomePacienteFormatadoAtual, pacienteIdAtual, setValue, getValues]);

  const medicoOptions = medicos.map(medico => ({
    value: medico.id.toString(),
    label: `${medico.nomeCompleto} | ${medico.especialidade} | CRM: ${medico.crm}`
  }));
  
  const handlePacienteSelect = (paciente: Paciente) => {
    const nomeFormatado = `${paciente.nome} | CPF: ${formatCPFDisplay(paciente.cpf)}`;
    setValue('pacienteId', paciente.id.toString(), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('pacienteNomeFormatado', nomeFormatado, { shouldValidate: false });
    setSearchTermPaciente(nomeFormatado);
    setShowPacienteSuggestions(false); setPacientes([]); setSearchAttempted(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowPacienteSuggestions(false);
      }
    }
    if (showPacienteSuggestions) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPacienteSuggestions]);

  return (
    <div className="animate-fade-in space-y-6">
      <h3 className="text-xl font-semibold text-neutral-800 border-b border-neutral-300 pb-3 mb-6">
        1. Paciente e Médico Responsável Inicial
      </h3>
      <div className="p-5 border border-neutral-200 rounded-lg bg-white shadow-sm relative" ref={suggestionsRef}>
        <Controller
            name="pacienteNomeFormatado" control={control}
            render={() => ( // field não é usado diretamente para value/onChange do Input principal
                <Input
                    label="Buscar Paciente por Nome ou CPF*"
                    placeholder="Digite nome ou CPF para buscar..."
                    value={searchTermPaciente}
                    onChange={(e) => {
                        const rawValue = e.target.value;
                        let displayValue = rawValue;
                        if (!/[a-zA-ZÀ-ú]/.test(rawValue)) displayValue = formatCPFInput(rawValue);
                        setSearchTermPaciente(displayValue);
                    }}
                    error={errors.pacienteId?.message}
                    helperText="Digite para buscar e clique para selecionar."
                    autoComplete="off" leftAddon={<Search className="h-5 w-5 text-gray-400" />}
                />
            )}
        />
        {showPacienteSuggestions && (
             <div className="absolute z-20 w-[calc(100%-1rem)] md:w-[calc(100%-2.5rem)] mt-1 max-h-60 overflow-y-auto bg-white border border-neutral-300 rounded-md shadow-lg">
                {isSearchingPacientes && <div className="px-4 py-3 text-sm text-neutral-500 flex items-center"><Loader2 size={16} className="mr-2 animate-spin" /> Buscando...</div>}
                {!isSearchingPacientes && pacientes.length > 0 && pacientes.map(p => (
                    <div key={p.id} onClick={() => handlePacienteSelect(p)} className="px-4 py-3 hover:bg-neutral-100 cursor-pointer text-sm"><p className="font-medium">{p.nome}</p><p className="text-xs text-neutral-500">CPF: {formatCPFDisplay(p.cpf)}</p></div>
                ))}
                {!isSearchingPacientes && searchAttempted && pacientes.length === 0 && searchTermPaciente.trim().length > 2 && (
                    <div className="px-4 py-3 text-sm text-neutral-500">Nenhum paciente encontrado. <Button variant="link" size="sm" onClick={() => window.open('/pacientes/novo', '_blank')} className="p-0 h-auto ml-1 text-primary-600 hover:text-primary-700">Cadastrar Novo?</Button></div>
                )}
            </div>
        )}
      </div>
      <div className="p-5 border border-neutral-200 rounded-lg bg-white shadow-sm">
        <Controller
          name="medicoId" control={control}
          render={({ field }) => (
            <Select
              label="Médico Responsável Inicial*"
              options={[{value: "", label: "Selecione um médico"}, ...medicoOptions]} 
              {...field}
              value={String(field.value || "")} // Garante que o valor seja string
              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              error={errors.medicoId?.message} leftAddon={<Stethoscope className="h-5 w-5 text-gray-400" />}
            />
          )}
        />
      </div>
    </div>
  );
};

// --- COMPONENTE TipoRegistroStep ---
const TipoRegistroStep: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<ProntuarioWizardFormData>();
  const tiposRegistroOpcoes: { value: TipoPrimeiroRegistro; label: string; icon: React.ReactNode }[] = [
    { value: 'CONSULTA', label: 'Registrar Consulta', icon: <Activity className="h-5 w-5 mr-2" /> },
    { value: 'INTERNACAO', label: 'Registrar Internação', icon: <BedDouble className="h-5 w-5 mr-2" /> },
    // { value: 'EXAME', label: 'Registrar Exame', icon: <Microscope className="h-5 w-5 mr-2" /> },
    // { value: 'CIRURGIA', label: 'Registrar Cirurgia', icon: <Scissors className="h-5 w-5 mr-2" /> },
    // { value: 'ANOTACAO_GERAL', label: 'Adicionar Anotação Geral', icon: <FileText className="h-5 w-5 mr-2" /> },
  ];

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold text-neutral-800 border-b border-neutral-300 pb-3 mb-6">
        2. Tipo de Primeiro Registro
      </h3>
      <Controller
        name="tipoPrimeiroRegistro" control={control}
        render={({ field }) => (
          <div className="space-y-3">
            {tiposRegistroOpcoes.map(opcao => (
              <label key={opcao.value} htmlFor={`tipo-${opcao.value}`}
                className={`flex items-center p-4 border rounded-md cursor-pointer hover:border-primary-500 hover:shadow-sm transition-all ${field.value === opcao.value ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-500' : 'border-neutral-300 bg-white'}`}>
                <input type="radio" id={`tipo-${opcao.value}`} {...field} value={opcao.value} checked={field.value === opcao.value} className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500 mr-3"/>
                {opcao.icon}
                <span className="text-sm font-medium text-neutral-700">{opcao.label}</span>
              </label>
            ))}
            {errors.tipoPrimeiroRegistro && <p className="form-error mt-2">{errors.tipoPrimeiroRegistro.message}</p>}
          </div>
        )}
      />
    </div>
  );
};

interface ProntuarioFormProps {
  onSubmitFinal: (data: ProntuarioWizardFormData & { dadosEvento: any }) => Promise<void>;
  isLoading?: boolean;
}

const ProntuarioForm: React.FC<ProntuarioFormProps> = ({
  onSubmitFinal,
  isLoading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const methods = useForm<ProntuarioWizardFormData>({
    resolver: zodResolver(
      currentStep === 0 ? selecaoEntidadeSchema :
      currentStep === 1 ? tipoRegistroSchema : z.object({})
    ),
    defaultValues: {
      pacienteId: '', medicoId: undefined, pacienteNomeFormatado: '', tipoPrimeiroRegistro: undefined,
    },
    mode: "onSubmit",
  });

  const { watch, trigger, getValues } = methods;
  const tipoRegistroSelecionado = watch('tipoPrimeiroRegistro');

  const handleEventoSubmit = async (dadosDoEventoEspecifico: any) => {
    const wizardData = getValues();
    // Certifique-se de que pacienteId e medicoId são passados.
    // Eles devem ter sido validados nos passos anteriores.
    if (!wizardData.pacienteId || wizardData.medicoId === undefined) {
        console.error("Paciente ou Médico não selecionado antes de submeter evento.");
        // Idealmente, mostrar um erro para o usuário ou forçar a volta para o passo anterior.
        // Para este exemplo, vamos logar e tentar submeter.
        // Em um cenário real, você pode querer setar um erro no formulário ou impedir a submissão.
        alert("Erro: Paciente ou Médico não selecionado. Volte aos passos anteriores.");
        return;
    }
    await onSubmitFinal({
        ...wizardData,
        dadosEvento: dadosDoEventoEspecifico
    });
  };

  const renderEventoForm = () => {
    const commonEventFormProps = {
        onSubmitEvento: handleEventoSubmit,
        onCancel: () => setCurrentStep(1), 
        isLoading: isLoading,
    };
    // Verifique se os componentes ConsultaForm e InternacaoForm estão sendo importados corretamente
    // e se eles existem no caminho especificado.
    if (tipoRegistroSelecionado === 'CONSULTA') {
        return <ConsultaForm {...commonEventFormProps} />;
    }
    if (tipoRegistroSelecionado === 'INTERNACAO') {
        return <InternacaoForm {...commonEventFormProps} />;
    }
    // Adicionar outros casos aqui se necessário
    // if (tipoRegistroSelecionado === 'EXAME') {
    //   return <ExameForm {...commonEventFormProps} />;
    // }

    return ( // Este é o JSX que será renderizado se nenhum tipo for selecionado ou implementado
        <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-md text-center">
            <AlertCircle className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600">
                {currentStep === 2 && !tipoRegistroSelecionado ? 
                    'Por favor, volte e selecione um tipo de registro para continuar.' : 
                    `Formulário para '${tipoRegistroSelecionado}' ainda não implementado ou tipo não selecionado.`
                }
            </p>
        </div>
    );
  };


  const steps = [
    { title: 'Paciente e Médico', icon: <Users className="h-4 w-4" />, component: <SelecaoEntidadesStep /> },
    { title: 'Tipo de Registro', icon: <FileText className="h-4 w-4" />, component: <TipoRegistroStep /> },
    // Atualizado para chamar a função renderEventoForm diretamente aqui para que o componente seja recriado quando tipoRegistroSelecionado mudar
    { title: 'Detalhes do Registro', icon: <Activity className="h-4 w-4" />, component: renderEventoForm() },
  ];
  
  const nextStep = async () => {
    let isValid = false;
    if (currentStep === 0) isValid = await trigger(['pacienteId', 'medicoId']);
    else if (currentStep === 1) isValid = await trigger(['tipoPrimeiroRegistro']);
    
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length -1) {
        // No último passo, o botão de submit do sub-formulário (ConsultaForm, InternacaoForm)
        // deve chamar handleEventoSubmit.
        console.log("Tentando submeter o formulário do evento específico.");
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else navigate(-1); 
  };
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-8">
          <ol className="flex items-center w-full">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <li className={`flex w-full items-center ${index <= currentStep ? 'text-primary-600' : 'text-neutral-500'} ${index < steps.length -1 ? `after:content-[''] after:w-full after:h-1 after:border-b ${index < currentStep ? 'after:border-primary-600' : 'after:border-neutral-200'} after:border-1 after:inline-block` : ''}`}>
                  <div className={`flex items-center justify-center w-10 h-10 ${index <= currentStep ? 'bg-primary-100' : 'bg-neutral-100'} rounded-full lg:h-12 lg:w-12 shrink-0`}>
                    {React.cloneElement(step.icon, { className: `w-5 h-5 lg:w-6 lg:h-6 ${index <= currentStep ? 'text-primary-600' : 'text-neutral-500'}`})}
                  </div>
                </li>
              </React.Fragment>
            ))}
          </ol>
          <div className="mt-3 flex justify-between text-sm font-medium">
            {steps.map((step, index) => (
              <span key={`label-${index}`} className={`w-1/${steps.length} text-center ${index === currentStep ? 'text-primary-600 font-semibold' : index < currentStep ? 'text-primary-500' : 'text-neutral-500'}`}>{step.title}</span>
            ))}
          </div>
        </div>
        
        {/* A chave no div força a remontagem do componente do passo quando currentStep muda, o que é bom.
            E, crucialmente, quando `tipoRegistroSelecionado` muda, o `renderEventoForm()` dentro de `steps[currentStep].component`
            também precisa ser reavaliado. Colocar `tipoRegistroSelecionado` na chave do div do passo 2
            garante que o componente do passo 2 (que é `renderEventoForm()`) seja remontado.
        */}
        <div className="mb-8 min-h-[350px]" key={`${currentStep}-${tipoRegistroSelecionado}`}>
            {steps[currentStep].component}
        </div>
        
        <div className="flex justify-between items-center gap-3 pt-6 border-t border-neutral-300 mt-8">
          <Button
            type="button" variant="secondary" onClick={prevStep}
            disabled={isLoading && currentStep === 0}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            {currentStep === 0 ? 'Voltar' : 'Voltar'} 
          </Button>
          
          {currentStep < steps.length - 1 && ( // Mostrar "Próximo" apenas se não for o último passo
            <Button
              type="button" variant="primary" onClick={nextStep}
              disabled={isLoading || (currentStep === 1 && !tipoRegistroSelecionado)}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              {currentStep === steps.length - 2 ? 'Continuar para Detalhes' : 'Próximo'}
            </Button>
          )}
          {/* O botão de "Salvar" final estará DENTRO de cada formulário de evento */}
        </div>
      </form>
    </FormProvider>
  );
};

export default ProntuarioForm;