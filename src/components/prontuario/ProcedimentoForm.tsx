// sf-silvaneto/clientehm/ClienteHM-cbef18b48718619b7cb987800e689467da84dc95/cliente-hm-front-main/src/components/prontuario/ProcedimentoForm.tsx
import React, { useEffect } from 'react';
// Certifique-se de que 'Controller' está importado aqui e 'control' é extraído de useForm
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { NovaProcedimentoRequest, AtualizarProcedimentoRequest } from '../../types/prontuarioRegistros';
import { Medico, StatusMedico } from '../../types/medico';
import Select from '../ui/Select';
import { Save, Calendar, ClipboardPlus as ProcedimentoIcon, ArrowLeft, Stethoscope } from 'lucide-react';

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const procedimentoSchema = z.object({
  dataProcedimento: z.string()
    .min(1, "Data e hora do procedimento são obrigatórias.")
    .regex(datetimeLocalRegex, { message: "Formato de data e hora inválido. Use o seletor ou YYYY-MM-DDTHH:MM." }) // Corrigido exemplo de formato
    .refine(val => !isNaN(Date.parse(val)), { message: "Data e hora do procedimento inválidas (não é uma data real)." })
    .refine(val => new Date(val) <= new Date(), { message: "Data e hora do procedimento não podem ser no futuro." }),
  descricaoProcedimento: z.string().min(10, { message: "Descrição do procedimento é obrigatória (mín. 10 caracteres)." }).max(1000, "Descrição muito longa (máx. 1000)."),
  relatorioProcedimento: z.string().max(10000, "Relatório não pode exceder 10000 caracteres.").optional().or(z.literal('')),
  medicoExecutorId: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    // No modo de edição, o médico pode ser opcional se o backend permitir a remoção ou se já existir um valor.
    // Para criação, este campo pode não ser validado aqui se vier de outro passo (ProntuarioForm).
    // Tornando opcional para cobrir o caso de edição onde pode ser alterado ou mantido.
    z.number().positive("Médico executor do procedimento é obrigatório.").optional().nullable()
  )
});

type ProcedimentoFormData = z.infer<typeof procedimentoSchema>;

interface ProcedimentoFormProps {
  onSubmitEvento: (data: NovaProcedimentoRequest | AtualizarProcedimentoRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<ProcedimentoFormData & { id?: string }>;
  isEditMode?: boolean;
  medicosDisponiveis?: Medico[];
}

const getLocalDateTimeString = (dateString?: string | Date): string => {
    const date = dateString ? new Date(dateString) : new Date();
    if (isNaN(date.getTime())) {
        console.warn("getLocalDateTimeString recebeu data inválida:", dateString);
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

const ProcedimentoForm: React.FC<ProcedimentoFormProps> = ({
  onSubmitEvento,
  onCancel,
  isLoading = false,
  initialData = {},
  isEditMode = false,
  medicosDisponiveis = []
}) => {
  // Certifique-se que 'control' é extraído aqui
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<ProcedimentoFormData>({
    resolver: zodResolver(procedimentoSchema),
  });

  useEffect(() => {
    const ensureStringOrEmpty = (value: string | undefined | null): string => value || '';

    let baseDefaultValues: Partial<ProcedimentoFormData> = {
        descricaoProcedimento: '',
        relatorioProcedimento: '',
        medicoExecutorId: undefined,
    };

    if (isEditMode && initialData && Object.keys(initialData).length > 0) {
        const populatedDefaults: Partial<ProcedimentoFormData> = {
            ...baseDefaultValues,
            ...initialData,
            dataProcedimento: getLocalDateTimeString(initialData.dataProcedimento),
            descricaoProcedimento: ensureStringOrEmpty(initialData.descricaoProcedimento),
            relatorioProcedimento: ensureStringOrEmpty(initialData.relatorioProcedimento),
            medicoExecutorId: initialData.medicoExecutorId || undefined,
        };
        reset(populatedDefaults);
    } else {
        // Modo de criação
        baseDefaultValues.dataProcedimento = getLocalDateTimeString(new Date());
        // medicoExecutorId não é definido aqui, pois deve vir do ProntuarioForm (wizard) na criação.
        // Se este formulário for usado de forma independente para criar um procedimento
        // em um prontuário existente, a lógica para medicoExecutorId precisaria ser diferente.
        reset(baseDefaultValues);
    }
  }, [initialData, isEditMode, reset]);

  const handleLocalSubmit = (data: ProcedimentoFormData) => {
    const submissionData: NovaProcedimentoRequest | AtualizarProcedimentoRequest = {
        ...data,
        relatorioProcedimento: data.relatorioProcedimento?.trim() || undefined,
    };
    // Na edição, o medicoExecutorId já está em 'data' e será enviado.
    // Na criação via wizard, o medicoExecutorId principal do prontuário é usado pelo ProntuarioForm.
    // Se este form for usado para adicionar procedimento a um prontuário existente,
    // a prop medicoExecutorId (vindo do initialData ou selecionado no form) será usada.
    onSubmitEvento(submissionData);
  };

  const medicoOptions = medicosDisponiveis
    .filter(m => m.status === StatusMedico.ATIVO)
    .map(m => ({
        value: m.id.toString(),
        label: `${m.nomeCompleto} (CRM: ${m.crm || 'N/A'})`
    }));

  return (
    <div className="space-y-6 p-1 animate-fade-in">
      <h4 className="text-lg font-medium text-neutral-800 mb-4">
        {isEditMode ? 'Editar Registro de Procedimento' : 'Registrar Novo Procedimento'}
      </h4>

      {/* O seletor de médico só aparece no modo de edição */}
      {isEditMode && (
         <Controller
            name="medicoExecutorId" // Este é o campo que será validado pelo Zod
            control={control}
            render={({ field }) => (
                <Select
                    label="Médico Executor do Procedimento*"
                    options={[{ value: "", label: "Selecione um médico" }, ...medicoOptions]}
                    {...field}
                    value={String(field.value ?? "")} // Garante que o valor seja string ou ""
                    onChange={e => {
                        const value = e.target.value;
                        field.onChange(value ? Number(value) : undefined);
                    }}
                    error={errors.medicoExecutorId?.message}
                    leftAddon={<Stethoscope className="h-5 w-5 text-gray-400" />}
                    disabled={medicosDisponiveis.length === 0}
                />
            )}
        />
      )}

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
          {isEditMode ? 'Salvar Alterações do Procedimento' : 'Salvar Procedimento'}
        </Button>
      </div>
    </div>
  );
};

export default ProcedimentoForm;