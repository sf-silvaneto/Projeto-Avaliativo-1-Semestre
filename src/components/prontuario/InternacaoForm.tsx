// src/components/prontuario/InternacaoForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { NovaInternacaoRequest } from '../../types/prontuarioRegistros';
import { Save, Calendar, Edit3 as EditIcon } from 'lucide-react';

const internacaoSchema = z.object({
  dataAdmissao: z.string().datetime({ message: "Data e hora da admissão inválidas. Use o formato completo." })
    .refine(val => new Date(val) <= new Date(), { message: "Data e hora da admissão não podem ser no futuro." }),
  motivoInternacao: z.string().min(10, { message: "Motivo da internação é obrigatório (mín. 10 caracteres)." }).max(1000, "Motivo muito longo (máx. 1000)."),
  historiaDoencaAtual: z.string().max(10000, "Detalhes não podem exceder 10000 caracteres.").optional().or(z.literal('')),
  dataAltaPrevista: z.string().optional().nullable().refine(val => {
    if (!val) return true; 
    try {
        const date = new Date(val);
        return !isNaN(date.getTime());
    } catch {
        return false;
    }
  }, { message: "Data de alta prevista inválida." }),
});

type InternacaoFormData = Omit<NovaInternacaoRequest, 'pacienteId' | 'medicoResponsavelAdmissaoId'>;

interface InternacaoFormProps {
  onSubmitEvento: (data: InternacaoFormData) => void; 
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<InternacaoFormData>;
}

const InternacaoForm: React.FC<InternacaoFormProps> = ({
  onSubmitEvento,
  onCancel,
  isLoading = false,
  initialData = {},
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<InternacaoFormData>({
    resolver: zodResolver(internacaoSchema),
    defaultValues: {
      dataAdmissao: initialData?.dataAdmissao || new Date().toISOString().slice(0, 16),
      motivoInternacao: initialData?.motivoInternacao || '',
      historiaDoencaAtual: initialData?.historiaDoencaAtual || '',
      dataAltaPrevista: initialData?.dataAltaPrevista || null, 
    },
  });

  const handleFormSubmit = (data: InternacaoFormData) => {
    const submissionData = {
        ...data,
        dataAltaPrevista: data.dataAltaPrevista || undefined, 
        historiaDoencaAtual: data.historiaDoencaAtual?.trim() || undefined,
    };
    onSubmitEvento(submissionData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 p-1 animate-fade-in">
      <h4 className="text-lg font-medium text-neutral-800 mb-4">Detalhes da Internação</h4>

      <Input
        label="Data e Hora da Admissão*"
        type="datetime-local"
        leftAddon={<Calendar size={18} className="text-gray-500"/>}
        {...register('dataAdmissao')}
        error={errors.dataAdmissao?.message}
      />

      <Textarea
        label="Motivo da Internação*"
        rows={4}
        placeholder="Descreva o motivo principal que levou à internação..."
        leftAddon={<EditIcon size={18} className="text-gray-500 mt-2"/>}
        {...register('motivoInternacao')}
        error={errors.motivoInternacao?.message}
      />

      <Textarea
        label="História da Doença Atual / Detalhes Adicionais (Opcional)"
        rows={6}
        placeholder="Detalhes sobre a condição atual, evolução, comorbidades relevantes para a internação, etc."
        {...register('historiaDoencaAtual')}
        error={errors.historiaDoencaAtual?.message}
      />
      
      <Input
        label="Data de Alta Prevista (Opcional)"
        type="datetime-local"
        leftAddon={<Calendar size={18} className="text-gray-500"/>}
        {...register('dataAltaPrevista')}
        error={errors.dataAltaPrevista?.message}
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Voltar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Save size={18}/>}>
          Salvar Internação
        </Button>
      </div>
    </form>
  );
};

export default InternacaoForm;