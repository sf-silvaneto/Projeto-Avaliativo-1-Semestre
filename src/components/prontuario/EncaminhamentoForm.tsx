import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { NovaEncaminhamentoRequest, AtualizarEncaminhamentoRequest } from '../../types/prontuarioRegistros';
// import { Medico, StatusMedico } from '../../types/medico'; // Remova StatusMedico
import { Medico } from '../../types/medico'; // Mantenha apenas Medico
import Select from '../ui/Select';
import { Save, Calendar, Send as EncaminhamentoIcon, ArrowLeft, Stethoscope } from 'lucide-react';

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const encaminhamentoSchema = z.object({
  dataEncaminhamento: z.string()
    .min(1, "Data e hora do encaminhamento são obrigatórias.")
    .regex(datetimeLocalRegex, { message: "Formato de data e hora inválido. Use o seletor ou format yyyy-MM-DDTHH:MM." })
    .refine(val => !isNaN(Date.parse(val)), { message: "Data e hora do encaminhamento inválidas (não é uma data real)." })
    .refine(val => new Date(val) <= new Date(), { message: "Data e hora do encaminhamento não podem ser no futuro." }),
  especialidadeDestino: z.string().min(3, { message: "Especialidade de destino é obrigatória (mín. 3 caracteres)." }).max(200, "Especialidade muito longa (máx. 200)."),
  motivoEncaminhamento: z.string().min(10, { message: "Motivo do encaminhamento é obrigatório (mín. 10 caracteres)." }).max(1000, "Motivo muito longo (máx. 1000)."),
  observacoes: z.string().max(2000, "Observações não podem exceder 2000 caracteres.").optional().or(z.literal('')),
  medicoSolicitanteId: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().positive("Médico solicitante do encaminhamento é obrigatório.").optional().nullable()
  )
});

type EncaminhamentoFormData = z.infer<typeof encaminhamentoSchema>;

interface EncaminhamentoFormProps {
  onSubmitEvento: (data: NovaEncaminhamentoRequest | AtualizarEncaminhamentoRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<EncaminhamentoFormData & { id?: string }>;
  isEditMode?: boolean;
  medicosDisponiveis?: Medico[];
}

const getLocalDateTimeString = (dateString?: string | Date): string => {
    const date = dateString ? new Date(dateString) : new Date();
    if (isNaN(date.getTime())) {
        console.warn("getLocalDateTimeString recebeu data inválida:", dateString, "Usando data/hora atual.");
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const EncaminhamentoForm: React.FC<EncaminhamentoFormProps> = ({
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
        dataEncaminhamento: getLocalDateTimeString(initialData.dataEncaminhamento),
        especialidadeDestino: ensureStringOrEmpty(initialData.especialidadeDestino),
        motivoEncaminhamento: ensureStringOrEmpty(initialData.motivoEncaminhamento),
        observacoes: ensureStringOrEmpty(initialData.observacoes),
        medicoSolicitanteId: initialData.medicoSolicitanteId || undefined,
      };
    }
    return {
      dataEncaminhamento: getLocalDateTimeString(new Date()),
      especialidadeDestino: '',
      motivoEncaminhamento: '',
      observacoes: '',
      medicoSolicitanteId: undefined,
    };
  }, [initialData, isEditMode]);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<EncaminhamentoFormData>({
    resolver: zodResolver(encaminhamentoSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: processedInitialData,
  });

  useEffect(() => {
    reset(processedInitialData);
  }, [processedInitialData, reset]);

  const handleLocalSubmit = (data: EncaminhamentoFormData) => {
    const submissionData: NovaEncaminhamentoRequest | AktualizarEncaminhamentoRequest = {
        ...data, 
        observacoes: data.observacoes?.trim() || undefined,
    };
    onSubmitEvento(submissionData);
  };

  // Filtra médicos que não estão inativos (excludedAt é null ou undefined)
  const medicoOptions = medicosDisponiveis
    .filter(m => m.excludedAt === null || m.excludedAt === undefined) // Filtra médicos ativos
    .map(m => ({
        value: m.id.toString(),
        label: `${m.nomeCompleto} (CRM: ${m.crm || 'N/A'})`
    }));

  return (
    <div className="space-y-6 p-1 animate-fade-in">
      <h4 className="text-lg font-medium text-neutral-800 mb-4">
        {isEditMode ? 'Editar Registro de Encaminhamento' : 'Registrar Encaminhamento Médico'}
        </h4>

      {isEditMode && (
         <Controller
            name="medicoSolicitanteId"
            control={control}
            render={({ field }) => (
                <Select
                    label="Médico Solicitante*"
                    options={[{ value: "", label: "Selecione um médico" }, ...medicoOptions]}
                    {...field}
                    value={String(field.value ?? "")}
                    onChange={e => {
                        const value = e.target.value;
                        field.onChange(value ? Number(value) : undefined);
                    }}
                    error={errors.medicoSolicitanteId?.message}
                    leftAddon={<Stethoscope className="h-5 w-5 text-gray-400" />}
                    disabled={medicosDisponiveis.length === 0}
                />
            )}
        />
      )}

      <Input
        label="Data e Hora do Encaminhamento*"
        type="datetime-local"
        leftAddon={<Calendar size={18} className="text-gray-500"/>}
        {...register('dataEncaminhamento')}
        error={errors.dataEncaminhamento?.message}
      />

      <Input
        label="Especialidade de Destino*"
        placeholder="Ex: Cardiologia, Neurologia, Fisioterapia..."
        leftAddon={<EncaminhamentoIcon size={18} className="text-gray-500"/>}
        {...register('especialidadeDestino')}
        error={errors.especialidadeDestino?.message}
      />

      <Textarea
        label="Motivo do Encaminhamento*"
        rows={4}
        placeholder="Descreva o motivo para o encaminhamento..."
        {...register('motivoEncaminhamento')}
        error={errors.motivoEncaminhamento?.message}
      />

      <Textarea
        label="Observações (Opcional)"
        rows={3}
        placeholder="Observações adicionais, história relevante, etc."
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
          {isEditMode ? 'Salvar Alterações do Encaminhamento' : 'Salvar Encaminhamento'}
        </Button>
      </div>
    </div>
  );
};

export default EncaminhamentoForm;