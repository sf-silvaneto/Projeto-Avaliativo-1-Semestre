import React, { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider, Controller, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { TipoTratamento, NovoProntuarioRequest } from '../../types/prontuario';
import { Medico, StatusMedico } from '../../types/medico';
import { Paciente, BuscaPacienteParams } from '../../types/paciente';
import { buscarMedicos } from '../../services/medicoService';
import { buscarPacientes } from '../../services/pacienteService';
import { 
  ChevronRight, ChevronLeft, Save, User, Stethoscope, FileText, 
  ArrowLeft, Search, AlertCircle, Loader2, Users
} from 'lucide-react';

const prontuarioSchema = z.object({
  pacienteId: z.string().min(1, 'Paciente é obrigatório. Realize a busca e selecione um paciente.'),
  medicoId: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number({ required_error: "Selecione um médico responsável" }).positive("Médico responsável é obrigatório")
  ),
  tipoTratamento: z.nativeEnum(TipoTratamento, {
    errorMap: () => ({ message: 'Selecione um tipo de tratamento válido' }),
  }),
  historicoMedico: z.object({
    descricao: z.string().min(10, 'Descrição do histórico deve ter pelo menos 10 caracteres'),
  }),
});

type ProntuarioFormData = z.infer<typeof prontuarioSchema>;

const SelecaoEntidadesStep: React.FC = () => {
  const { control, formState: { errors }, setValue, trigger, watch } = useFormContext<ProntuarioFormData>();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [searchTermPaciente, setSearchTermPaciente] = useState('');
  const [isSearchingPacientes, setIsSearchingPacientes] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const pacienteIdSelecionado = watch('pacienteId');

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
    setIsSearchingPacientes(true);
    setSearchAttempted(true);
    setPacientes([]);

    const params: BuscaPacienteParams = { tamanho: 10, pagina: 0 };
    const isCpfSearch = /^\d+$/.test(term) && term.length >= 3;

    if (isCpfSearch) {
      params.cpf = term;
    } else {
      params.nome = term;
    }

    try {
      const response = await buscarPacientes(params);
      setPacientes(response.content);
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
      setPacientes([]);
    } finally {
      setIsSearchingPacientes(false);
    }
  }, []);

  useEffect(() => {
    if (searchTermPaciente.length === 0) {
      setPacientes([]);
      setSearchAttempted(false);
      return;
    }
    if (searchTermPaciente.length > 2) {
      const timerId = setTimeout(() => {
        performSearch(searchTermPaciente);
      }, 700);
      return () => clearTimeout(timerId);
    } else {
      setSearchAttempted(false);
      setIsSearchingPacientes(false);
    }
  }, [searchTermPaciente, performSearch]);

  const medicoOptions = medicos.map(medico => ({
    value: medico.id.toString(),
    label: `${medico.nomeCompleto} - CRM: ${medico.crm} (${medico.especialidade})`
  }));

  const pacienteOptions = pacientes.map(paciente => ({
    value: paciente.id.toString(),
    label: `${paciente.nome} (CPF: ${paciente.cpf})`
  }));
  
  const handlePacienteSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    setValue('pacienteId', selectedId, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    const selectedPaciente = pacientes.find(p => p.id.toString() === selectedId);
    if (selectedPaciente) {
      setSearchTermPaciente(selectedPaciente.nome);
    }
    setPacientes([]); 
    setSearchAttempted(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h3 className="text-xl font-semibold text-neutral-800 border-b border-neutral-300 pb-3 mb-6">
        Vincular Paciente e Médico
      </h3>
      
      <div className="p-5 border border-neutral-200 rounded-lg bg-white shadow-soft">
        <Input
            label="Buscar Paciente por Nome ou CPF*"
            placeholder="Digite 3+ caracteres para buscar..."
            value={searchTermPaciente}
            onChange={(e) => setSearchTermPaciente(e.target.value)}
            leftAddon={<Search className="h-5 w-5 text-neutral-500" />}
            helperText="Após a busca, selecione um paciente da lista abaixo."
            className="mb-3"
        />

        {isSearchingPacientes && (
          <div className="flex items-center text-sm text-primary-600 mt-2 py-2">
            <Loader2 size={18} className="mr-2 animate-spin" />
            Buscando pacientes...
          </div>
        )}
        
        {!isSearchingPacientes && searchAttempted && pacientes.length > 0 && (
             <Controller
                name="pacienteId"
                control={control}
                render={({ field }) => (
                    <Select
                        label="Selecionar Paciente Encontrado:"
                        options={[{ value: "", label: "Selecione um paciente da lista" }, ...pacienteOptions]}
                        value={field.value}
                        onChange={(e) => {
                            handlePacienteSelection(e);
                        }}
                        error={errors.pacienteId?.message}
                        className="mt-2"
                    />
                )}
            />
        )}
        
        {!isSearchingPacientes && searchAttempted && pacientes.length === 0 && searchTermPaciente.length > 2 && (
            <div className="flex items-start text-sm text-warning-700 mt-2 p-3 bg-warning-50 rounded-md border border-warning-200">
                <AlertCircle size={20} className="mr-2 flex-shrink-0 text-warning-500" />
                <div>
                    Nenhum paciente encontrado para "<span className="font-medium">{searchTermPaciente}</span>".
                    <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => window.open('/pacientes/novo', '_blank')}
                        className="p-0 h-auto ml-1 text-primary-600 hover:text-primary-700 font-medium inline"
                    >
                        Cadastrar Novo Paciente?
                    </Button>
                </div>
            </div>
        )}
         {errors.pacienteId && !pacienteIdSelecionado && (
             <p className="form-error mt-1">{errors.pacienteId.message}</p>
          )}
      </div>

      <div className="p-5 border border-neutral-200 rounded-lg bg-white shadow-soft">
        <Controller
            name="medicoId"
            control={control}
            render={({ field }) => (
                <Select
                label="Médico Responsável*"
                options={[{value: "", label: "Selecione um médico"}, ...medicoOptions]}
                {...field}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.medicoId?.message}
                leftAddon={<Stethoscope className="h-5 w-5 text-neutral-500" />}
            />
            )}
        />
      </div>
    </div>
  );
};

const InformacoesTratamentoStep: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<ProntuarioFormData>();
  const tipoTratamentoOptions = [
    { value: TipoTratamento.TERAPIA_INDIVIDUAL, label: 'Terapia Individual' },
    { value: TipoTratamento.TERAPIA_CASAL, label: 'Terapia de Casal' },
    { value: TipoTratamento.TERAPIA_GRUPO, label: 'Terapia de Grupo' },
    { value: TipoTratamento.TERAPIA_FAMILIAR, label: 'Terapia Familiar' },
    { value: TipoTratamento.OUTRO, label: 'Outro' },
  ];
  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold text-neutral-800 border-b border-neutral-300 pb-3 mb-6">
        Informações do Tratamento
      </h3>
      <div className="grid grid-cols-1 gap-6">
        <div className="p-5 border border-neutral-200 rounded-lg bg-white shadow-soft">
            <Select
              label="Tipo de Tratamento*"
              options={[{value: "", label: "Selecione um tipo"}, ...tipoTratamentoOptions]}
              {...register('tipoTratamento')}
              error={errors.tipoTratamento?.message}
              required
              leftAddon={<FileText className="h-5 w-5 text-neutral-500" />}
            />
        </div>
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

interface ProntuarioFormProps {
  onSubmit: (data: NovoProntuarioRequest) => void;
  initialData?: Partial<NovoProntuarioRequest>;
  isLoading?: boolean;
}

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
      tipoTratamento: initialData?.tipoTratamento || undefined,
      historicoMedico: {
        descricao: initialData?.historicoMedico?.descricao || '',
      },
    },
  });
  
  const steps = [
    { title: 'Paciente e Médico', icon: <Users className="h-4 w-4" />, component: <SelecaoEntidadesStep /> },
    { title: 'Detalhes do Tratamento', icon: <FileText className="h-4 w-4" />, component: <InformacoesTratamentoStep /> },
  ];
  
  const nextStep = async () => {
    let isValidCurrentStep = false;
    if (currentStep === 0) {
      isValidCurrentStep = await methods.trigger(['pacienteId', 'medicoId']);
    } else if (currentStep === 1) { 
      isValidCurrentStep = await methods.trigger(['tipoTratamento', 'historicoMedico.descricao']);
    }
    
    if (isValidCurrentStep && currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
    }
  };
  
  const handleVoltarClick = () => { 
    if (currentStep === 0) {
      navigate('/prontuarios'); 
    } else {
      setCurrentStep(currentStep - 1); 
    }
  };
  
  const handleSubmitForm = methods.handleSubmit((data) => {
    const submissionData: NovoProntuarioRequest = {
      ...data,
      pacienteId: data.pacienteId, 
      medicoId: Number(data.medicoId),
    };
    onSubmit(submissionData);
  });
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmitForm}>
        {/* Stepper */}
        <div className="mb-8">
          <ol className="flex items-center w-full">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <li className={`flex w-full items-center ${index <= currentStep ? 'text-primary-600 dark:text-primary-500' : 'text-neutral-500 dark:text-neutral-400'} ${index < steps.length -1 ? `after:content-[''] after:w-full after:h-1 after:border-b ${index < currentStep ? 'after:border-primary-600 dark:after:border-primary-500' : 'after:border-neutral-200 dark:after:border-neutral-700'} after:border-1 after:inline-block` : ''}`}>
                  <div className={`flex items-center justify-center w-10 h-10 ${index <= currentStep ? 'bg-primary-100 dark:bg-primary-800' : 'bg-neutral-100 dark:bg-neutral-800'} rounded-full lg:h-12 lg:w-12 shrink-0`}>
                    {step.icon}
                  </div>
                </li>
              </React.Fragment>
            ))}
          </ol>
           <div className="mt-3 flex justify-between text-sm font-medium">
            {steps.map((step, index) => (
                <span key={`label-${index}`} className={`w-1/${steps.length} text-center ${index <= currentStep ? 'text-primary-600' : 'text-neutral-500'}`}>{step.title}</span>
            ))}
          </div>
        </div>
        
        <div className="mb-8 min-h-[400px]">
          {steps[currentStep].component}
        </div>
        
        {/* Área dos botões de ação MODIFICADA */}
        <div className="flex justify-end items-center gap-3 pt-6 border-t border-neutral-300 mt-8"> {/* Alterado para justify-end e gap-3 (ou outro valor de sua preferência) */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleVoltarClick}
            disabled={isLoading}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            // size="lg" // Removido size="lg"
          >
            Voltar
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
              disabled={isLoading}
              rightIcon={<ChevronRight className="h-4 w-4" />}
              // size="lg" // Removido size="lg"
            >
              Próximo
            </Button>
          ) : (
            <Button
              type="submit"
              variant="success"
              isLoading={isLoading}
              leftIcon={<Save className="h-4 w-4" />}
              // size="lg" // Removido size="lg"
            >
              Salvar Prontuário
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default ProntuarioForm;