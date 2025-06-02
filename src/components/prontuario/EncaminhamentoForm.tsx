// sf-silvaneto/clientehm/ClienteHM-057824fed8786ee29c7b4f9a2010aca3a83abc37/cliente-hm-front-main/src/components/prontuario/EncaminhamentoForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { NovaEncaminhamentoRequest } from '../../types/prontuarioRegistros';
import { Save, Calendar, Send as EncaminhamentoIcon, Edit3, ArrowLeft } from 'lucide-react';

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const encaminhamentoSchema = z.object({
  dataEncaminhamento: z.string()
    .min(1, "Data e hora do encaminhamento são obrigatórias.")
    .regex(datetimeLocalRegex, { message: "Formato de data e hora inválido. Use o seletor ou YYYY-MM-DDTHH:MM." })
    .refine(val => !isNaN(Date.parse(val)), { message: "Data e hora do encaminhamento inválidas (não é uma data real)." })
    .refine(val => new Date(val) <= new Date(), { message: "Data e hora do encaminhamento não podem ser no futuro." }),
  especialidadeDestino: z.string().min(3, { message: "Especialidade de destino é obrigatória (mín. 3 caracteres)." }).max(200, "Especialidade muito longa (máx. 200)."),
  motivoEncaminhamento: z.string().min(10, { message: "Motivo do encaminhamento é obrigatório (mín. 10 caracteres)." }).max(1000, "Motivo muito longo (máx. 1000)."),
  observacoes: z.string().max(2000, "Observações não podem exceder 2000 caracteres.").optional().or(z.literal('')),
});

type EncaminhamentoFormData = Omit<NovaEncaminhamentoRequest, 'medicoSolicitanteId'>;

interface EncaminhamentoFormProps {
  onSubmitEvento: (data: NovaEncaminhamentoRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<EncaminhamentoFormData>;
}

const getLocalDateTimeString = (date: Date): string => {
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
  initialData = {},
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<EncaminhamentoFormData>({
    resolver: zodResolver(encaminhamentoSchema),
    defaultValues: {
      dataEncaminhamento: initialData?.dataEncaminhamento || getLocalDateTimeString(new Date()),
      especialidadeDestino: initialData?.especialidadeDestino || '',
      motivoEncaminhamento: initialData?.motivoEncaminhamento || '',
      observacoes: initialData?.observacoes || '',
    },
  });

  const handleLocalSubmit = (data: EncaminhamentoFormData) => {
    console.log('EncaminhamentoForm: handleLocalSubmit - DADOS DO FORMULÁRIO:', JSON.stringify(data, null, 2));
    const submissionData = {
        ...data,
        observacoes: data.observacoes?.trim() || undefined,
    };
    // O medicoSolicitanteId será adicionado pelo ProntuarioForm
    onSubmitEvento(submissionData as NovaEncaminhamentoRequest);
  };

  return (
    // Removida a tag <form>
    <div className="space-y-6 p-1 animate-fade-in">
      <h4 className="text-lg font-medium text-neutral-800 mb-4">Registrar Encaminhamento Médico</h4>

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
        leftAddon={<Edit3 size={18} className="text-gray-500 mt-2"/>}
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
          Voltar
        </Button>
        <Button
            type="button"
            onClick={handleSubmit(handleLocalSubmit)}
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Save size={18}/>}
            className="w-full sm:w-auto"
        >
          Salvar Encaminhamento e Criar Prontuário
        </Button>
      </div>
    </div>
  );
};

export default EncaminhamentoForm;