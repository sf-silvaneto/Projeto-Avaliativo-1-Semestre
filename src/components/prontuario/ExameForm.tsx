// src/components/prontuario/ExameForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { AdicionarExameRequest } from '../../types/prontuarioRegistros';
import { Save, Calendar, Microscope as MicroscopeIcon } from 'lucide-react';

// Schema Zod para validação do formulário de Exame
const exameSchema = z.object({
  nome: z.string().min(3, { message: "Nome do exame é obrigatório (mín. 3 caracteres)." }).max(200, "Nome do exame muito longo (máx. 200)."),
  data: z.string().datetime({ message: "Data e hora do exame inválidas." })
    .refine(val => new Date(val) <= new Date(), { message: "Data e hora do exame não podem ser no futuro." }),
  resultado: z.string().min(5, { message: "Resultado do exame é obrigatório (mín. 5 caracteres)." }).max(5000, "Resultado muito longo (máx. 5000)."),
  observacoes: z.string().max(2000, "Observações não podem exceder 2000 caracteres.").optional().or(z.literal('')),
  // arquivo: z.instanceof(File).optional(), // Validação de arquivo pode ser mais complexa
});

type ExameFormData = Omit<AdicionarExameRequest, 'arquivo'>; // O arquivo é tratado separadamente

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

  const handleFormSubmit = (data: ExameFormData) => {
    // Lógica para lidar com o arquivo (se houver) precisaria ser adicionada aqui,
    // possivelmente pegando o arquivo de um <input type="file" /> separado.
    const submissionData: AdicionarExameRequest = {
        ...data,
        observacoes: data.observacoes?.trim() || undefined,
        // arquivo: (opcional, viria de um input de arquivo)
    };
    onSubmitEvento(submissionData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 p-1 animate-fade-in">
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

      {/* TODO: Adicionar input para upload de arquivo se necessário */}
      {/* <Input label="Anexar Arquivo (Opcional)" type="file" {...register('arquivo')} /> */}


      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Voltar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Save size={18}/>}>
          Salvar Exame
        </Button>
      </div>
    </form>
  );
};

export default ExameForm;