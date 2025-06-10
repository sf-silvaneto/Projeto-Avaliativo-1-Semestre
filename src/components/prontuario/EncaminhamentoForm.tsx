import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { NovaEncaminhamentoRequest, AtualizarEncaminhamentoRequest } from '../../types/prontuarioRegistros';
import { Medico } from '../../types/medico';
import Select from '../ui/Select';
import { Save, Calendar, Send as EncaminhamentoIcon, ArrowLeft, Stethoscope } from 'lucide-react';

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const encaminhamentoSchema = z.object({
  dataEncaminhamento: z.string().optional().transform(e => e === "" ? undefined : e)
    .refine((val) => {
        if (!val) return true;
        return datetimeLocalRegex.test(val);
    }, { message: "Formato de data e hora inválido. Use o seletor ou formato YYYY-MM-DDTHH:MM." })
    .refine((val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, { message: "Data e hora do encaminhamento inválidas (não é uma data real)." })
    .refine((val) => {
        if (!val) return true;
        return new Date(val) <= new Date();
    }, { message: "Data e hora do encaminhamento não podem ser no futuro." }),
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
  initialData?: Partial<EncaminhamentoFormData & { id?: string; createdAt?: string; updatedAt?: string; }>;
  isEditMode?: boolean;
  medicosDisponiveis?: Medico[];
}

const getLocalDateTimeStringForInput = (dateString?: string | Date): string | undefined => {
    if (!dateString) return undefined;

    const dateCandidate = new Date(typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-') ? dateString + 'Z' : dateString);

    if (isNaN(dateCandidate.getTime())) {
        console.warn("getLocalDateTimeStringForInput recebeu data inválida ou nula após parsing:", dateString);
        return undefined;
    }
    
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23', // Garante formato 24h
        timeZone: 'America/Sao_Paulo'
    };

    const formatter = new Intl.DateTimeFormat('sv-SE', options);
    const formatted = formatter.format(dateCandidate);

    return formatted.replace(' ', 'T');
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
      // Lógica: prefere updatedAt, se nulo, usa createdAt
      const dateToPreFill = initialData.updatedAt || initialData.createdAt;

      return {
        dataEncaminhamento: dateToPreFill ? getLocalDateTimeStringForInput(dateToPreFill) : undefined,
        especialidadeDestino: ensureStringOrEmpty(initialData.especialidadeDestino),
        motivoEncaminhamento: ensureStringOrEmpty(initialData.motivoEncaminhamento),
        observacoes: ensureStringOrEmpty(initialData.observacoes),
        medicoSolicitanteId: initialData.medicoSolicitanteId || undefined,
      };
    }
    return {
      dataEncaminhamento: undefined,
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
    const baseData = {
        especialidadeDestino: data.especialidadeDestino,
        motivoEncaminhamento: data.motivoEncaminhamento,
        observacoes: data.observacoes?.trim() || undefined,
    };

    if (isEditMode) {
        const updateData = baseData as AtualizarEncaminhamentoRequest;
        updateData.medicoSolicitanteId = data.medicoSolicitanteId;
        (updateData as any).dataEncaminhamento = data.dataEncaminhamento; // Envia a data editada
        onSubmitEvento(updateData);
    } else {
        onSubmitEvento(baseData as NovaEncaminhamentoRequest);
    }
  };

  const medicoOptions = medicosDisponiveis
    .filter(m => m.deletedAt === null || m.deletedAt === undefined) // Alterado de excludedAt para deletedAt
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

      {isEditMode && (
        <Input
          label="Data e Hora do Encaminhamento"
          type="datetime-local"
          leftAddon={<Calendar size={18} className="text-gray-500"/>}
          {...register('dataEncaminhamento')}
          error={errors.dataEncaminhamento?.message}
        />
      )}

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