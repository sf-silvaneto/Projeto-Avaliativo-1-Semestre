import React, { useState } from 'react';
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { Genero, TipoTratamento, NovoProntuarioRequest } from '../../types/prontuario';
import { ChevronRight, ChevronLeft, Save, User, Phone, Mail, MapPin, Calendar, FileText } from 'lucide-react';

// Validador de CPF
const validarCPF = (cpf: string) => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Cálculo de validação
  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

// Validador de telefone
const validarTelefone = (telefone: string) => {
  // Remove caracteres não numéricos
  telefone = telefone.replace(/[^\d]/g, '');
  
  // Verifica se tem entre 10 e 11 dígitos (com ou sem DDD)
  return telefone.length >= 10 && telefone.length <= 11;
};

// Validador de CEP
const validarCEP = (cep: string) => {
  // Remove caracteres não numéricos
  cep = cep.replace(/[^\d]/g, '');
  
  // CEP tem 8 dígitos
  return cep.length === 8;
};

// Schema de validação do formulário
const prontuarioSchema = z.object({
  paciente: z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    dataNascimento: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Data de nascimento inválida',
    }),
    cpf: z.string().refine(validarCPF, {
      message: 'CPF inválido',
    }),
    genero: z.nativeEnum(Genero, {
      errorMap: () => ({ message: 'Selecione um gênero válido' }),
    }),
    telefone: z.string().refine(validarTelefone, {
      message: 'Telefone inválido',
    }),
    email: z.string().email('Email inválido'),
    endereco: z.object({
      logradouro: z.string().min(3, 'Logradouro deve ter pelo menos 3 caracteres'),
      numero: z.string().min(1, 'Número é obrigatório'),
      complemento: z.string().optional(),
      bairro: z.string().min(2, 'Bairro deve ter pelo menos 2 caracteres'),
      cidade: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
      estado: z.string().length(2, 'Use a sigla do estado com 2 letras'),
      cep: z.string().refine(validarCEP, {
        message: 'CEP inválido',
      }),
    }),
  }),
  tipoTratamento: z.nativeEnum(TipoTratamento, {
    errorMap: () => ({ message: 'Selecione um tipo de tratamento válido' }),
  }),
  historicoMedico: z.object({
    descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  }),
});

type ProntuarioFormData = z.infer<typeof prontuarioSchema>;

// Componente para dados do paciente
const DadosPacienteStep: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<ProntuarioFormData>();
  
  const generoOptions = [
    { value: Genero.MASCULINO, label: 'Masculino' },
    { value: Genero.FEMININO, label: 'Feminino' },
    { value: Genero.OUTRO, label: 'Outro' },
    { value: Genero.NAO_INFORMADO, label: 'Não informado' },
  ];
  
  return (
    <div className="animate-fade-in">
      <h3 className="mb-4 text-lg font-medium text-neutral-900">Dados do Paciente</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome Completo"
          placeholder="Nome completo do paciente"
          leftAddon={<User className="h-5 w-5" />}
          {...register('paciente.nome')}
          error={errors.paciente?.nome?.message}
          required
        />
        
        <Input
          label="Data de Nascimento"
          type="date"
          leftAddon={<Calendar className="h-5 w-5" />}
          {...register('paciente.dataNascimento')}
          error={errors.paciente?.dataNascimento?.message}
          required
        />
        
        <Input
          label="CPF"
          placeholder="000.000.000-00"
          helperText="Digite apenas os números"
          {...register('paciente.cpf')}
          error={errors.paciente?.cpf?.message}
          required
        />
        
        <Select
          label="Gênero"
          options={generoOptions}
          {...register('paciente.genero')}
          error={errors.paciente?.genero?.message}
          required
        />
        
        <Input
          label="Telefone"
          placeholder="(00) 00000-0000"
          leftAddon={<Phone className="h-5 w-5" />}
          {...register('paciente.telefone')}
          error={errors.paciente?.telefone?.message}
          required
        />
        
        <Input
          label="Email"
          type="email"
          placeholder="email@exemplo.com"
          leftAddon={<Mail className="h-5 w-5" />}
          {...register('paciente.email')}
          error={errors.paciente?.email?.message}
          required
        />
      </div>
      
      <h4 className="mt-6 mb-4 text-base font-medium text-neutral-900">Endereço</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="CEP"
          placeholder="00000-000"
          helperText="Digite apenas os números"
          leftAddon={<MapPin className="h-5 w-5" />}
          {...register('paciente.endereco.cep')}
          error={errors.paciente?.endereco?.cep?.message}
          required
        />
        
        <Input
          label="Logradouro"
          placeholder="Rua, Avenida, etc."
          {...register('paciente.endereco.logradouro')}
          error={errors.paciente?.endereco?.logradouro?.message}
          required
        />
        
        <Input
          label="Número"
          placeholder="Número"
          {...register('paciente.endereco.numero')}
          error={errors.paciente?.endereco?.numero?.message}
          required
        />
        
        <Input
          label="Complemento"
          placeholder="Apartamento, bloco, etc."
          {...register('paciente.endereco.complemento')}
          error={errors.paciente?.endereco?.complemento?.message}
        />
        
        <Input
          label="Bairro"
          placeholder="Bairro"
          {...register('paciente.endereco.bairro')}
          error={errors.paciente?.endereco?.bairro?.message}
          required
        />
        
        <Input
          label="Cidade"
          placeholder="Cidade"
          {...register('paciente.endereco.cidade')}
          error={errors.paciente?.endereco?.cidade?.message}
          required
        />
        
        <Input
          label="Estado"
          placeholder="UF"
          maxLength={2}
          {...register('paciente.endereco.estado')}
          error={errors.paciente?.endereco?.estado?.message}
          required
        />
      </div>
    </div>
  );
};

// Componente para informações de tratamento
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
      <h3 className="mb-4 text-lg font-medium text-neutral-900">Informações de Tratamento</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <Select
          label="Tipo de Tratamento"
          options={tipoTratamentoOptions}
          leftAddon={<FileText className="h-5 w-5" />}
          {...register('tipoTratamento')}
          error={errors.tipoTratamento?.message}
          required
        />
        
        <Textarea
          label="Histórico Médico Inicial"
          placeholder="Descreva o histórico médico inicial do paciente..."
          rows={6}
          {...register('historicoMedico.descricao')}
          error={errors.historicoMedico?.descricao?.message}
          required
        />
      </div>
    </div>
  );
};

interface ProntuarioFormProps {
  onSubmit: (data: NovoProntuarioRequest) => void;
  initialData?: NovoProntuarioRequest;
  isLoading?: boolean;
}

const ProntuarioForm: React.FC<ProntuarioFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const methods = useForm<ProntuarioFormData>({
    resolver: zodResolver(prontuarioSchema),
    defaultValues: initialData || {
      paciente: {
        nome: '',
        dataNascimento: '',
        cpf: '',
        genero: Genero.NAO_INFORMADO,
        telefone: '',
        email: '',
        endereco: {
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
        },
      },
      tipoTratamento: TipoTratamento.TERAPIA_INDIVIDUAL,
      historicoMedico: {
        descricao: '',
      },
    },
  });
  
  const steps = [
    { title: 'Dados do Paciente', component: <DadosPacienteStep /> },
    { title: 'Informações de Tratamento', component: <InformacoesTratamentoStep /> },
  ];
  
  const nextStep = () => {
    // Valida o formulário com base no step atual
    if (currentStep === 0) {
      methods.trigger([
        'paciente.nome',
        'paciente.dataNascimento',
        'paciente.cpf',
        'paciente.genero',
        'paciente.telefone',
        'paciente.email',
        'paciente.endereco.logradouro',
        'paciente.endereco.numero',
        'paciente.endereco.bairro',
        'paciente.endereco.cidade',
        'paciente.endereco.estado',
        'paciente.endereco.cep',
      ]).then((isValid) => {
        if (isValid) {
          setCurrentStep(currentStep + 1);
        }
      });
    }
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleSubmit = methods.handleSubmit((data) => {
    onSubmit(data as NovoProntuarioRequest);
  });
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit}>
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`mt-2 text-sm ${
                      index <= currentStep ? 'text-primary-600 font-medium' : 'text-neutral-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      index < currentStep ? 'bg-primary-600' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Step Content */}
        <div className="mb-8">
          {steps[currentStep].component}
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-neutral-200">
          <Button
            type="button"
            variant="secondary"
            onClick={prevStep}
            disabled={currentStep === 0}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Anterior
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
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

export default ProntuarioForm;