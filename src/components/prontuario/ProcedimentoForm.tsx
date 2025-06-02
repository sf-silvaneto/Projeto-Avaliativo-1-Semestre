import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { NovaProcedimentoRequest } from '../../types/prontuarioRegistros';
import { Save, Calendar, ClipboardPlus as ProcedimentoIcon, ArrowLeft } from 'lucide-react';

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const procedimentoSchema = z.object({
  dataProcedimento: z.string()
    .min(1, "Data e hora do procedimento são obrigatórias.")
    .regex(datetimeLocalRegex, { message: "Formato de data e hora inválido. Use o seletor ou YYYY-MM-DDTHH:MM." })
    .refine(val => !isNaN(Date.parse(val)), { message: "Data e hora do procedimento inválidas (não é uma data real)." })
    .refine(val => new Date(val) <= new Date(), { message: "Data e hora do procedimento não podem ser no futuro." }),
  descricaoProcedimento: z.string().min(10, { message: "Descrição do procedimento é obrigatória (mín. 10 caracteres)." }).max(1000, "Descrição muito longa (máx. 1000)."),
  relatorioProcedimento: z.string().max(10000, "Relatório não pode exceder 10000 caracteres.").optional().or(z.literal('')),
});

type ProcedimentoFormData = Omit<NovaProcedimentoRequest, 'medicoExecutorId'>;

interface ProcedimentoFormProps {
  onSubmitEvento: (data: NovaProcedimentoRequest) => void;
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

  const handleLocalSubmit = (data: ProcedimentoFormData) => {
    console.log('ProcedimentoForm: handleLocalSubmit - DADOS DO FORMULÁRIO:', JSON.stringify(data, null, 2));
    const submissionData = {
        ...data,
        relatorioProcedimento: data.relatorioProcedimento?.trim() || undefined,
    };
    // O medicoExecutorId será adicionado pelo ProntuarioForm
    onSubmitEvento(submissionData as NovaProcedimentoRequest);
  };

  return (
    <div className="space-y-6 p-1 animate-fade-in">
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
          Salvar Procedimento e Criar Prontuário
        </Button>
      </div>
    </div>
  );
};

export default ProcedimentoForm;