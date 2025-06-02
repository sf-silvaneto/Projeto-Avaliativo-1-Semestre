// sf-silvaneto/clientehm/ClienteHM-057824fed8786ee29c7b4f9a2010aca3a83abc37/cliente-hm-front-main/src/components/prontuario/ExameForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { AdicionarExameRequest } from '../../types/prontuarioRegistros';
import { Save, Calendar, Microscope as MicroscopeIcon, ArrowLeft } from 'lucide-react';

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const exameSchema = z.object({
  nome: z.string().min(3, { message: "Nome do exame é obrigatório (mín. 3 caracteres)." }).max(200, "Nome do exame muito longo (máx. 200)."),
  data: z.string()
    .min(1, "Data e hora do exame são obrigatórias.")
    .regex(datetimeLocalRegex, { message: "Formato de data e hora inválido. Use o seletor ou YYYY-MM-DDTHH:MM." })
    .refine(val => !isNaN(Date.parse(val)), { message: "Data e hora do exame inválidas (não é uma data real)." })
    .refine(val => new Date(val) <= new Date(), { message: "Data e hora do exame não podem ser no futuro." }),
  resultado: z.string().min(5, { message: "Resultado do exame é obrigatório (mín. 5 caracteres)." }).max(5000, "Resultado muito longo (máx. 5000)."),
  observacoes: z.string().max(2000, "Observações não podem exceder 2000 caracteres.").optional().or(z.literal('')),
});

type ExameFormData = AdicionarExameRequest;

interface ExameFormProps {
  onSubmitEvento: (data: AdicionarExameRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<AdicionarExameRequest>;
}

const getLocalDateTimeString = (date: Date): string => {
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
  initialData = {},
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ExameFormData>({
    resolver: zodResolver(exameSchema),
    defaultValues: {
      nome: initialData?.nome || '',
      data: initialData?.data || getLocalDateTimeString(new Date()),
      resultado: initialData?.resultado || '',
      observacoes: initialData?.observacoes || '',
    },
  });

  const handleLocalSubmit = (data: ExameFormData) => {
    console.log('ExameForm: handleLocalSubmit - DADOS DO FORMULÁRIO:', JSON.stringify(data, null, 2));
    const submissionData: AdicionarExameRequest = {
        ...data,
        observacoes: data.observacoes?.trim() || undefined,
    };
    console.log('ExameForm: handleLocalSubmit - SUBMISSION DATA PARA onSubmitEvento:', JSON.stringify(submissionData, null, 2));
    onSubmitEvento(submissionData);
  };

  return (
    <div className="space-y-6 p-1 animate-fade-in">
      <h4 className="text-lg font-medium text-neutral-800 mb-4">Registrar Novo Exame</h4>

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
        {...register('data')}
        error={errors.data?.message}
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
          Salvar Exame e Criar Prontuário
        </Button>
      </div>
    </div>
  );
};

export default ExameForm;