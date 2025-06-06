import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { Save, Calendar, Activity, Thermometer, Heart, Percent, AlertTriangle as AllergyIcon, Stethoscope as ComorbidityIcon, Pill } from 'lucide-react';

const entradaMedicaSchema = z.object({
  dataHoraEntrada: z.string().datetime({ message: "Data e hora inválidas" }),
  motivoEntrada: z.string().min(5, { message: "Motivo da entrada é muito curto." }),
  queixasPrincipais: z.string().min(10, { message: "Queixa principal é muito curta." }),
  pressaoArterial: z.string().optional().or(z.literal('')),
  temperatura: z.string().optional().or(z.literal('')),
  frequenciaCardiaca: z.string().optional().or(z.literal('')),
  saturacao: z.string().optional().or(z.literal('')),
  
  alergias: z.string().optional(),
  semAlergiasConhecidas: z.boolean().optional(),

  temComorbidades: z.string().optional(),
  comorbidadesDetalhes: z.string().optional(),
  
  usaMedicamentosContinuos: z.string().optional(),
  medicamentosContinuosDetalhes: z.string().optional(),

  historicoFamiliarRelevante: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.temComorbidades === 'sim' && (!data.comorbidadesDetalhes || data.comorbidadesDetalhes.trim().length < 3)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Detalhes das comorbidades são obrigatórios se 'Sim' for selecionado.",
            path: ['comorbidadesDetalhes'],
        });
    }
    if (data.usaMedicamentosContinuos === 'sim' && (!data.medicamentosContinuosDetalhes || data.medicamentosContinuosDetalhes.trim().length < 3)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Detalhes dos medicamentos são obrigatórios se 'Sim' for selecionado.",
            path: ['medicamentosContinuosDetalhes'],
        });
    }
    if (!data.semAlergiasConhecidas && (!data.alergias || data.alergias.trim().length < 3)) {
    }
     if (data.temperatura && Number.isNaN(parseFloat(data.temperatura.replace(',', '.')))) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Temperatura deve ser um número.", path: ["temperatura"]});
    }
    if (data.frequenciaCardiaca && Number.isNaN(parseInt(data.frequenciaCardiaca))) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Frequência cardíaca deve ser um número.", path: ["frequenciaCardiaca"]});
    }
    if (data.saturacao && Number.isNaN(parseInt(data.saturacao))) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Saturação deve ser um número.", path: ["saturacao"]});
    }
});


export type EntradaMedicaFormData = z.infer<typeof entradaMedicaSchema>;

interface EntradaMedicaFormProps {
  prontuarioId: string;
  onSubmit: (data: EntradaMedicaFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<EntradaMedicaFormData>;
}

const EntradaMedicaForm: React.FC<EntradaMedicaFormProps> = ({
  prontuarioId,
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = {},
}) => {
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<EntradaMedicaFormData>({
    resolver: zodResolver(entradaMedicaSchema),
    defaultValues: {
      dataHoraEntrada: initialData.dataHoraEntrada || new Date().toISOString().slice(0, 16), // Formato YYYY-MM-DDTHH:mm
      motivoEntrada: initialData.motivoEntrada || '',
      queixasPrincipais: initialData.queixasPrincipais || '',
      pressaoArterial: initialData.pressaoArterial || '',
      temperatura: initialData.temperatura || '',
      frequenciaCardiaca: initialData.frequenciaCardiaca || '',
      saturacao: initialData.saturacao || '',
      alergias: initialData.alergias || '',
      semAlergiasConhecidas: initialData.semAlergiasConhecidas || false,
      temComorbidades: initialData.temComorbidades || 'nao',
      comorbidadesDetalhes: initialData.comorbidadesDetalhes || '',
      usaMedicamentosContinuos: initialData.usaMedicamentosContinuos || 'nao',
      medicamentosContinuosDetalhes: initialData.medicamentosContinuosDetalhes || '',
      historicoFamiliarRelevante: initialData.historicoFamiliarRelevante || '',
    },
  });

  const watchSemAlergias = watch('semAlergiasConhecidas');
  const watchTemComorbidades = watch('temComorbidades');
  const watchUsaMedicamentos = watch('usaMedicamentosContinuos');

  const simNaoOptions = [
    { value: 'nao', label: 'Não' },
    { value: 'sim', label: 'Sim' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
      <h2 className="text-xl font-semibold text-neutral-700 mb-6 border-b pb-2">Registrar Nova Entrada Médica</h2>

      <Input
        label="Data e Hora da Entrada"
        type="datetime-local"
        leftAddon={<Calendar size={18} className="text-neutral-500" />}
        {...register('dataHoraEntrada')}
        error={errors.dataHoraEntrada?.message}
        required
      />

      <Textarea
        label="Motivo da Entrada"
        rows={2}
        {...register('motivoEntrada')}
        error={errors.motivoEntrada?.message}
        required
      />
      <Textarea
        label="Queixas Principais"
        rows={3}
        {...register('queixasPrincipais')}
        error={errors.queixasPrincipais?.message}
        required
      />

      <fieldset className="border p-4 rounded-md">
        <legend className="text-sm font-medium text-neutral-700 px-1">Sinais Vitais</legend>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <Input label="P.A." placeholder="mmHg" {...register('pressaoArterial')} error={errors.pressaoArterial?.message} leftAddon={<Activity size={18} className="text-neutral-500"/>} />
          <Input label="Temp." placeholder="°C" {...register('temperatura')} error={errors.temperatura?.message} leftAddon={<Thermometer size={18} className="text-neutral-500"/>} />
          <Input label="F.C." placeholder="bpm" {...register('frequenciaCardiaca')} error={errors.frequenciaCardiaca?.message} leftAddon={<Heart size={18} className="text-neutral-500"/>} />
          <Input label="Sat O₂" placeholder="%" {...register('saturacao')} error={errors.saturacao?.message} leftAddon={<Percent size={18} className="text-neutral-500"/>} />
        </div>
      </fieldset>

      <fieldset className="border p-4 rounded-md">
        <legend className="text-sm font-medium text-neutral-700 px-1">Histórico Clínico</legend>
        <div className="space-y-4 mt-2">
            <div>
                <Textarea
                    label="Alergias"
                    rows={2}
                    {...register('alergias')}
                    error={errors.alergias?.message}
                    disabled={watchSemAlergias}
                    placeholder={watchSemAlergias ? "Sem alergias conhecidas selecionado" : "Descreva as alergias"}
                    leftAddon={<AllergyIcon size={18} className="text-neutral-500 mt-2"/>}
                />
                <div className="mt-1 flex items-center">
                    <input id="semAlergias" type="checkbox" {...register('semAlergiasConhecidas')} className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500" />
                    <label htmlFor="semAlergias" className="ml-2 block text-sm text-neutral-700">
                        Sem alergias conhecidas
                    </label>
                </div>
            </div>
            
            <Controller
                name="temComorbidades"
                control={control}
                render={({ field }) => (
                    <Select
                        label="Comorbidades?"
                        options={simNaoOptions}
                        {...field}
                        error={errors.temComorbidades?.message}
                        leftAddon={<ComorbidityIcon size={18} className="text-neutral-500"/>}
                    />
                )}
            />
            {watchTemComorbidades === 'sim' && (
                <Textarea
                    label="Detalhes das Comorbidades"
                    rows={2}
                    {...register('comorbidadesDetalhes')}
                    error={errors.comorbidadesDetalhes?.message}
                />
            )}

            <Controller
                name="usaMedicamentosContinuos"
                control={control}
                render={({ field }) => (
                    <Select
                        label="Uso de Medicamentos Contínuos?"
                        options={simNaoOptions}
                        {...field}
                        error={errors.usaMedicamentosContinuos?.message}
                        leftAddon={<Pill size={18} className="text-neutral-500"/>}
                    />
                )}
            />
            {watchUsaMedicamentos === 'sim' && (
                <Textarea
                    label="Detalhes dos Medicamentos Contínuos"
                    rows={2}
                    {...register('medicamentosContinuosDetalhes')}
                    error={errors.medicamentosContinuosDetalhes?.message}
                />
            )}

            <Textarea
                label="Histórico Familiar Relevante (opcional)"
                rows={2}
                {...register('historicoFamiliarRelevante')}
                error={errors.historicoFamiliarRelevante?.message}
            />
        </div>
      </fieldset>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Save size={18}/>}>
          Salvar Entrada
        </Button>
      </div>
    </form>
  );
};

export default EntradaMedicaForm;