// sf-silvaneto/clientehm/ClienteHM-057824fed8786ee29c7b4f9a2010aca3a83abc37/cliente-hm-front-main/src/components/prontuario/EncaminhamentoForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { NovaEncaminhamentoRequest } from '../../types/prontuarioRegistros';
import { Save, Calendar, Send as EncaminhamentoIcon, Edit3, ArrowLeft } from 'lucide-react'; // Ícone ArrowLeft adicionado

const encaminhamentoSchema = z.object({
  dataEncaminhamento: z.string().datetime({ message: "Data e hora do encaminhamento inválidas." })
    .refine(val => new Date(val) <= new Date(), { message: "Data e hora do encaminhamento não podem ser no futuro." }),
  especialidadeDestino: z.string().min(3, { message: "Especialidade de destino é obrigatória (mín. 3 caracteres)." }).max(200, "Especialidade muito longa (máx. 200)."),
  motivoEncaminhamento: z.string().min(10, { message: "Motivo do encaminhamento é obrigatório (mín. 10 caracteres)." }).max(1000, "Motivo muito longo (máx. 1000)."),
  observacoes: z.string().max(2000, "Observações não podem exceder 2000 caracteres.").optional().or(z.literal('')),
  // medicoSolicitanteId virá do wizard (medicoId)
});

// Omitir medicoSolicitanteId, pois será pego do wizard/contexto
type EncaminhamentoFormData = Omit<NovaEncaminhamentoRequest, 'medicoSolicitanteId'>;

interface EncaminhamentoFormProps {
  onSubmitEvento: (data: EncaminhamentoFormData) => void;
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

  const handleFormSubmit = (data: EncaminhamentoFormData) => {
    const submissionData = {
        ...data,
        observacoes: data.observacoes?.trim() || undefined,
    };
    onSubmitEvento(submissionData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 p-1 animate-fade-in">
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

      {/* TODO: Adicionar input para upload de arquivo se necessário */}

      <div className="flex justify-end space-x-3 pt-4">
        <Button 
            type="button" 
            variant="secondary" 
            onClick={onCancel} 
            disabled={isLoading}
            leftIcon={<ArrowLeft className="h-4 w-4" />} // Ícone adicionado aqui
        >
          Voltar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Save size={18}/>}>
          Salvar Encaminhamento
        </Button>
      </div>
    </form>
  );
};

export default EncaminhamentoForm;