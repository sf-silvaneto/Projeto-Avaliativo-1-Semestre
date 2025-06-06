import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { AdicionarExameRequest, AktualizarExameRequest } from '../../types/prontuarioRegistros';
import { Medico, StatusMedico } from '../../types/medico';
import Select from '../ui/Select';
import { Save, Calendar, Microscope as MicroscopeIcon, ArrowLeft, Stethoscope } from 'lucide-react';

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const exameSchema = z.object({
  nome: z.string().min(3, { message: "Nome do exame é obrigatório (mín. 3 caracteres)." }).max(200, "Nome do exame muito longo (máx. 200)."),
  dataExame: z.string()
    .min(1, "Data e hora do exame são obrigatórias.")
    .regex(datetimeLocalRegex, { message: "Formato de data e hora inválido. Use o seletor ou YYYY-MM-DDTHH:MM." })
    .refine(val => !isNaN(Date.parse(val)), { message: "Data e hora do exame inválidas (não é uma data real)." })
    .refine(val => new Date(val) <= new Date(), { message: "Data e hora do exame não podem ser no futuro." }),
  resultado: z.string().min(5, { message: "Resultado do exame é obrigatório (mín. 5 caracteres)." }).max(5000, "Resultado muito longo (máx. 5000)."),
  observacoes: z.string().max(2000, "Observações não podem exceder 2000 caracteres.").optional().or(z.literal('')),
  medicoResponsavelExameId: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().positive("Médico responsável pelo exame é obrigatório.").optional().nullable()
  )
});

type ExameFormData = z.infer<typeof exameSchema>;

interface ExameFormProps {
  onSubmitEvento: (data: AdicionarExameRequest | AktualizarExameRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<ExameFormData & { id?: string; medicoResponsavelExameId?: number | null; dataExame?: string; data?: string }>;
  isEditMode?: boolean;
  medicosDisponiveis?: Medico[];
}

const getLocalDateTimeString = (dateString?: string | Date): string => {
    const dateCandidate = dateString ? new Date(dateString) : new Date(); 
    if (isNaN(dateCandidate.getTime())) {
        console.warn("getLocalDateTimeString recebeu data inválida ou nula:", dateString, "Usando data/hora atual como fallback.");
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }
    
    const date = dateCandidate;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const ExameForm: React.FC<ExameFormProps> = ({
  onSubmitEvento,
  onCancel,
  isLoading = false,
  initialData,
  isEditMode = false,
  medicosDisponiveis = []
}) => {

  const processedInitialData = useMemo(() => {
    const ensureStringOrEmpty = (value: string | undefined | null): string => value || '';
    if (isEditMode && initialData && Object.keys(initialData).length > 0) {
      return {
        nome: ensureStringOrEmpty(initialData.nome),
        dataExame: getLocalDateTimeString(initialData.dataExame || initialData.data), 
        resultado: ensureStringOrEmpty(initialData.resultado),
        observacoes: ensureStringOrEmpty(initialData.observacoes),
        medicoResponsavelExameId: initialData.medicoResponsavelExameId === null ? undefined : initialData.medicoResponsavelExameId,
      };
    }
    return { 
      nome: '',
      dataExame: getLocalDateTimeString(), 
      resultado: '',
      observacoes: '',
      medicoResponsavelExameId: undefined,
    };
  }, [initialData, isEditMode]);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<ExameFormData>({
    resolver: zodResolver(exameSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: processedInitialData,
  });

  useEffect(() => {
    reset(processedInitialData);
  }, [processedInitialData, reset]);

  const handleLocalSubmit = (data: ExameFormData) => {
    const { dataExame, ...restOfData } = data;
    const submissionData: AdicionarExameRequest | AktualizarExameRequest = {
        ...restOfData,
        data: dataExame,
        observacoes: data.observacoes?.trim() || undefined,
    };
    onSubmitEvento(submissionData);
  };

  const medicoOptions = medicosDisponiveis
    .filter(m => m.status === StatusMedico.ATIVO)
    .map(m => ({
        value: m.id.toString(),
        label: `${m.nomeCompleto} (CRM: ${m.crm || 'N/A'})`
    }));

  return (
    <div className="space-y-6 p-1 animate-fade-in">
      <h4 className="text-lg font-medium text-neutral-800 mb-4">
        {isEditMode ? 'Editar Registro de Exame' : 'Registrar Novo Exame'}
      </h4>

      {isEditMode && ( 
         <Controller
            name="medicoResponsavelExameId"
            control={control}
            render={({ field }) => (
                <Select
                    label="Médico Responsável pelo Exame"
                    options={[{ value: "", label: "Manter atual ou selecione novo" }, ...medicoOptions]}
                    {...field}
                    value={String(field.value ?? "")}
                    onChange={e => {
                        const value = e.target.value;
                        field.onChange(value ? Number(value) : undefined);
                    }}
                    error={errors.medicoResponsavelExameId?.message}
                    leftAddon={<Stethoscope className="h-5 w-5 text-gray-400" />}
                    disabled={medicosDisponiveis.length === 0}
                />
            )}
        />
      )}

      <Input
        label="Nome do Exame*"
        placeholder="Ex: Hemograma Completo"
        leftAddon={<MicroscopeIcon size={18} className="text-gray-500"/>}
        {...register('nome')}
        error={errors.nome?.message}
      />

      <Input
        label="Data e Hora do Exame*"
        type="datetime-local"
        leftAddon={<Calendar size={18} className="text-gray-500"/>}
        {...register('dataExame')} 
        error={errors.dataExame?.message} 
      />

      <Textarea
        label="Resultado do Exame*"
        rows={5}
        placeholder="Descreva os resultados do exame..."
        {...register('resultado')}
        error={errors.resultado?.message}
      />

      <Textarea
        label="Observações (Opcional)"
        rows={3}
        placeholder="Observações adicionais sobre o exame..."
        {...register('observacoes')}
        error={errors.observacoes?.message}
      />

      <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
        <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="w-full sm:w-auto"
        >
          {isEditMode ? 'Cancelar Edição' : 'Voltar'}
        </Button>
        <Button
            type="button"
            onClick={handleSubmit(handleLocalSubmit)}
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Save size={18}/>}
            className="w-full sm:w-auto"
        >
          {isEditMode ? 'Salvar Alterações do Exame' : 'Salvar Exame'}
        </Button>
      </div>
    </div>
  );
};

export default ExameForm;