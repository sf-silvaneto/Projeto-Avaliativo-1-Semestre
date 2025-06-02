// sf-silvaneto/clientehm/ClienteHM-057824fed8786ee29c7b4f9a2010aca3a83abc37/cliente-hm-front-main/src/components/prontuario/ExameForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { AdicionarExameRequest } from '../../types/prontuarioRegistros';
import { Save, Calendar, Microscope as MicroscopeIcon, ArrowLeft } from 'lucide-react'; // Ícone ArrowLeft adicionado

// Schema Zod para validação do formulário de Exame
const exameSchema = z.object({
  nome: z.string().min(3, { message: "Nome do exame é obrigatório (mín. 3 caracteres)." }).max(200, "Nome do exame muito longo (máx. 200)."),
  data: z.string().datetime({ message: "Data e hora do exame inválidas." }) // Mantido datetime para consistência, pode ser date se o backend esperar só data
    .refine(val => new Date(val) <= new Date(), { message: "Data e hora do exame não podem ser no futuro." }),
  resultado: z.string().min(5, { message: "Resultado do exame é obrigatório (mín. 5 caracteres)." }).max(5000, "Resultado muito longo (máx. 5000)."),
  observacoes: z.string().max(2000, "Observações não podem exceder 2000 caracteres.").optional().or(z.literal('')),
  // arquivo não faz mais parte do schema aqui, pois foi removido de AdicionarExameRequest
});

type ExameFormData = AdicionarExameRequest; // AdicionarExameRequest já não tem 'arquivo'

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
    const submissionData: AdicionarExameRequest = {
        ...data,
        observacoes: data.observacoes?.trim() || undefined,
        // Não há mais campo 'arquivo' para tratar
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
        label="Data e Hora do Exame*" // Ou apenas "Data do Exame" se o backend aceitar apenas data
        type="datetime-local" // Mudar para "date" se o backend e o tipo AdicionarExameRequest.data forem apenas data
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

      {/* REMOVIDO: Input para upload de arquivo */}
      {/* <Input label="Anexar Arquivo (Opcional)" type="file" /> */}


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
          Salvar Exame
        </Button>
      </div>
    </form>
  );
};

export default ExameForm;