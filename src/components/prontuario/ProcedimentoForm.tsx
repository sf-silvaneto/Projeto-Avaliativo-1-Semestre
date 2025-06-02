// src/components/prontuario/ProcedimentoForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { NovaProcedimentoRequest } from '../../types/prontuarioRegistros';
import { Save, Calendar, ClipboardPlus as ProcedimentoIcon } from 'lucide-react';

// Schema Zod para validação do formulário de Procedimento
const procedimentoSchema = z.object({
  dataProcedimento: z.string().datetime({ message: "Data e hora do procedimento inválidas." })
    .refine(val => new Date(val) <= new Date(), { message: "Data e hora do procedimento não podem ser no futuro." }),
  descricaoProcedimento: z.string().min(10, { message: "Descrição do procedimento é obrigatória (mín. 10 caracteres)." }).max(1000, "Descrição muito longa (máx. 1000)."),
  relatorioProcedimento: z.string().max(10000, "Relatório não pode exceder 10000 caracteres.").optional().or(z.literal('')),
  // medicoExecutorId não está no formulário, pois virá do passo anterior (medicoId do wizard)
});

// Omitir medicoExecutorId, pois será pego do wizard
type ProcedimentoFormData = Omit<NovaProcedimentoRequest, 'medicoExecutorId'>;

interface ProcedimentoFormProps {
  onSubmitEvento: (data: ProcedimentoFormData) => void; // Ajustado para não esperar medicoExecutorId
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<ProcedimentoFormData>;
}
const getLocalDateTimeString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const ProcedimentoForm: React.FC<ProcedimentoFormProps> = ({
  onSubmitEvento,
  onCancel,
  isLoading = false,
  initialData = {},
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProcedimentoFormData>({
    resolver: zodResolver(procedimentoSchema),
    defaultValues: {
      dataProcedimento: initialData?.dataProcedimento || getLocalDateTimeString(new Date()),
      descricaoProcedimento: initialData?.descricaoProcedimento || '',
      relatorioProcedimento: initialData?.relatorioProcedimento || '',
    },
  });

  const handleFormSubmit = (data: ProcedimentoFormData) => {
    const submissionData = {
        ...data,
        relatorioProcedimento: data.relatorioProcedimento?.trim() || undefined,
    };
    onSubmitEvento(submissionData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 p-1 animate-fade-in">
      <h4 className="text-lg font-medium text-neutral-800 mb-4">Registrar Novo Procedimento</h4>

      <Input
        label="Data e Hora do Procedimento*"
        type="datetime-local"
        leftAddon={<Calendar size={18} className="text-gray-500"/>}
        {...register('dataProcedimento')}
        error={errors.dataProcedimento?.message}
      />

      <Textarea
        label="Descrição do Procedimento*"
        rows={4}
        placeholder="Descreva o procedimento realizado..."
        leftAddon={<ProcedimentoIcon size={18} className="text-gray-500 mt-2"/>}
        {...register('descricaoProcedimento')}
        error={errors.descricaoProcedimento?.message}
      />

      <Textarea
        label="Relatório do Procedimento (Opcional)"
        rows={8}
        placeholder="Detalhes, achados, intercorrências, etc."
        {...register('relatorioProcedimento')}
        error={errors.relatorioProcedimento?.message}
      />

      {/* TODO: Adicionar input para upload de arquivo se necessário */}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Voltar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Save size={18}/>}>
          Salvar Procedimento
        </Button>
      </div>
    </form>
  );
};

export default ProcedimentoForm;