import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { NovaConsultaRequest } from '../../types/prontuarioRegistros';
import {
    Save, Calendar, Activity, Thermometer, Heart, Percent,
    BookOpen, Brain, ClipboardPlus, FileText as FileTextIcon, Edit3 as EditIcon,
    ArrowLeft
} from 'lucide-react';

const formatarPA = (value: string): string => {
    let digitos = value.replace(/\D/g, '');
    if (digitos.length > 6) { digitos = digitos.substring(0, 6); }
    if (digitos.length <= 3) { return digitos; }
    return `${digitos.substring(0, 3)}/${digitos.substring(3, 5)}`;
};

const formatarTemperatura = (value: string): string => {
    let val = value.replace(/[^0-9,.]/g, '');
    val = val.replace(',', '.');
    const parts = val.split('.');
    if (parts.length > 2) { val = parts[0] + '.' + parts.slice(1).join(''); }
    const [inteiro, decimal] = val.split('.');
    let formattedVal = inteiro || '';
    if (inteiro && inteiro.length > 2) { formattedVal = inteiro.substring(0, 2); }
    if (decimal !== undefined) { formattedVal += '.' + decimal.substring(0, 2); }
    return formattedVal;
};

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const consultaSchema = z.object({
    dataHoraConsulta: z.string()
        .min(1, "Data e hora da consulta são obrigatórias.")
        .regex(datetimeLocalRegex, { message: "Formato de data e hora inválido. Use o seletor ou YYYY-MM-DDTHH:MM." })
        .refine(val => !isNaN(Date.parse(val)), { message: "Data e hora da consulta inválidas (não é uma data real)." })
        .refine(val => new Date(val) <= new Date(), { message: "Data e hora da consulta não podem ser no futuro." }),
    motivoConsulta: z.string().min(5, { message: "Motivo da consulta é muito curto (mín. 5 caracteres)." }).max(500, "Motivo muito longo (máx. 500)."),
    queixasPrincipais: z.string().min(10, { message: "Queixa principal é muito curta (mín. 10 caracteres)." }).max(2000, "Queixas muito longas (máx. 2000)."),
    pressaoArterial: z.string().optional().or(z.literal(''))
        .refine(val => {
            if (!val || val.trim() === '') return true;
            const parts = val.split('/');
            if (parts.length !== 2) return false;
            const sistolica = parseInt(parts[0], 10);
            const diastolica = parseInt(parts[1], 10);
            return !isNaN(sistolica) && !isNaN(diastolica) &&
                sistolica >= 70 && sistolica <= 300 &&
                diastolica >= 40 && diastolica <= 200;
        }, { message: "P.A. inválida (Ex: 120/80, Sist:70-300, Diast:40-200)" }),
    temperatura: z.string().optional().or(z.literal(''))
        .refine(val => {
            if (!val || val.trim() === '') return true;
            const tempStr = val.replace(',', '.');
            const temp = parseFloat(tempStr);
            return !isNaN(temp) && temp >= 30.0 && temp <= 45.0 && /^\d{1,2}(\.\d{1,2})?$/.test(tempStr);
        }, { message: "Temp. inválida (Ex: 36.7 ou 37.75, entre 30.0-45.0)" }),
    frequenciaCardiaca: z.string().optional().or(z.literal(''))
        .refine(val => {
            if (!val || val.trim() === '') return true;
            const fc = parseInt(val, 10);
            return /^\d+$/.test(val) && !isNaN(fc) && fc >= 30 && fc <= 250;
        }, { message: "F.C. inválida (inteiro entre 30-250 bpm)" }),
    saturacao: z.string().optional().or(z.literal(''))
        .refine(val => {
            if (!val || val.trim() === '') return true;
            const sat = parseInt(val, 10);
            return /^\d+$/.test(val) && !isNaN(sat) && sat >= 50 && sat <= 100;
        }, { message: "Sat O₂ inválida (inteiro entre 50-100%)" }),
    exameFisico: z.string().max(5000, "Exame físico (máx. 5000).").optional().or(z.literal('')),
    hipoteseDiagnostica: z.string().max(2000, "Hipótese (máx. 2000).").optional().or(z.literal('')),
    condutaPlanoTerapeutico: z.string().max(5000, "Conduta/Plano (máx. 5000).").optional().or(z.literal('')),
    detalhesConsulta: z.string().max(10000, "Detalhes da consulta (máx. 10000).").optional().or(z.literal('')),
    observacoesConsulta: z.string().max(5000, "Observações da consulta (máx. 5000).").optional().or(z.literal('')),
});

type ConsultaFormData = z.infer<typeof consultaSchema>;

interface ConsultaFormProps {
    onSubmitEvento: (data: NovaConsultaRequest) => void;
    onCancel: () => void;
    isLoading?: boolean;
    initialData?: Partial<NovaConsultaRequest>;
}

const getLocalDateTimeString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const ConsultaForm: React.FC<ConsultaFormProps> = ({
    onSubmitEvento,
    onCancel,
    isLoading = false,
    initialData = {},
}) => {
    const { register, handleSubmit, control, formState: { errors } } = useForm<ConsultaFormData>({
        resolver: zodResolver(consultaSchema),
        defaultValues: {
            dataHoraConsulta: initialData?.dataHoraConsulta || getLocalDateTimeString(new Date()),
            motivoConsulta: initialData?.motivoConsulta || '',
            queixasPrincipais: initialData?.queixasPrincipais || '',
            pressaoArterial: initialData?.pressaoArterial || '',
            temperatura: initialData?.temperatura || '',
            frequenciaCardiaca: initialData?.frequenciaCardiaca || '',
            saturacao: initialData?.saturacao || '',
            exameFisico: initialData?.exameFisico || '',
            hipoteseDiagnostica: initialData?.hipoteseDiagnostica || '',
            condutaPlanoTerapeutico: initialData?.condutaPlanoTerapeutico || '',
            detalhesConsulta: initialData?.detalhesConsulta || '',
            observacoesConsulta: initialData?.observacoesConsulta || '',
        },
    });

    const handleLocalSubmit = (data: ConsultaFormData) => {
        console.log('ConsultaForm: handleLocalSubmit - DADOS DO FORMULÁRIO:', JSON.stringify(data, null, 2));
        const submissionData: NovaConsultaRequest = {
            dataHoraConsulta: data.dataHoraConsulta,
            motivoConsulta: data.motivoConsulta,
            queixasPrincipais: data.queixasPrincipais,
            pressaoArterial: data.pressaoArterial?.trim() || undefined,
            temperatura: data.temperatura?.trim().replace(',', '.') || undefined,
            frequenciaCardiaca: data.frequenciaCardiaca?.trim() || undefined,
            saturacao: data.saturacao?.trim() || undefined,
            exameFisico: data.exameFisico?.trim() || undefined,
            hipoteseDiagnostica: data.hipoteseDiagnostica?.trim() || undefined,
            condutaPlanoTerapeutico: data.condutaPlanoTerapeutico?.trim() || undefined,
            detalhesConsulta: data.detalhesConsulta?.trim() || undefined,
            observacoesConsulta: data.observacoesConsulta?.trim() || undefined,
        };
        console.log('ConsultaForm: handleLocalSubmit - SUBMISSION DATA PARA onSubmitEvento:', JSON.stringify(submissionData, null, 2));
        onSubmitEvento(submissionData);
    };

    return (
        <div className="space-y-6 p-1 animate-fade-in">
            <h4 className="text-lg font-medium text-neutral-800 mb-4">Registro de Consulta</h4>

            <Input
                label="Data e Hora da Consulta*"
                type="datetime-local"
                leftAddon={<Calendar size={18} className="text-gray-500" />}
                {...register('dataHoraConsulta')}
                error={errors.dataHoraConsulta?.message}
            />

            <Textarea
                label="Motivo da Consulta/Queixa Principal (Resumido)*"
                rows={3}
                placeholder="Ex: Dor de cabeça há 3 dias..."
                {...register('motivoConsulta')}
                error={errors.motivoConsulta?.message}
            />
            <Textarea
                label="História da Doença Atual / Queixas Detalhadas*"
                rows={5}
                placeholder="Detalhar início, características, fatores de melhora/piora, sintomas associados..."
                {...register('queixasPrincipais')}
                error={errors.queixasPrincipais?.message}
            />

            <fieldset className="border p-4 rounded-md mt-4">
                <legend className="text-sm font-medium text-neutral-700 px-1">Sinais Vitais (Opcional)</legend>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <Controller
                        name="pressaoArterial"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <Input
                                label="P.A."
                                placeholder="Ex: 120/80"
                                {...field}
                                onChange={(e) => field.onChange(formatarPA(e.target.value))}
                                error={errors.pressaoArterial?.message}
                                leftAddon={<Activity size={18} className="text-gray-500" />}
                                maxLength={7}
                            />
                        )}
                    />
                    <Controller
                        name="temperatura"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <Input
                                label="Temp."
                                placeholder="Ex: 36.7"
                                {...field}
                                onChange={(e) => field.onChange(formatarTemperatura(e.target.value))}
                                error={errors.temperatura?.message}
                                leftAddon={<Thermometer size={18} className="text-gray-500" />}
                                maxLength={5}
                            />
                        )}
                    />
                    <Input
                        label="F.C."
                        placeholder="bpm"
                        {...register('frequenciaCardiaca')}
                        error={errors.frequenciaCardiaca?.message}
                        leftAddon={<Heart size={18} className="text-gray-500" />}
                        type="text"
                        inputMode="numeric"
                        maxLength={3}
                    />
                    <Input
                        label="Sat O₂"
                        placeholder="%"
                        {...register('saturacao')}
                        error={errors.saturacao?.message}
                        leftAddon={<Percent size={18} className="text-gray-500" />}
                        type="text"
                        inputMode="numeric"
                        maxLength={3}
                    />
                </div>
            </fieldset>

            <Textarea
                label="Detalhes da Consulta (Opcional)"
                rows={6}
                placeholder="Espaço para anotações detalhadas sobre a consulta, evolução do paciente, discussões, etc."
                leftAddon={<FileTextIcon size={18} className="text-gray-500 mt-2" />}
                {...register('detalhesConsulta')}
                error={errors.detalhesConsulta?.message}
            />

            <Textarea
                label="Observações (Opcional)"
                rows={3}
                placeholder="Observações gerais, lembretes, ou informações pendentes."
                leftAddon={<EditIcon size={18} className="text-gray-500 mt-2" />}
                {...register('observacoesConsulta')}
                error={errors.observacoesConsulta?.message}
            />

            <fieldset className="border p-4 rounded-md mt-4">
                <legend className="text-sm font-medium text-neutral-700 px-1">Avaliação e Conduta Médica (Opcional)</legend>
                <div className="space-y-4 mt-2">
                    <Textarea label="Exame Físico (Resumido/Principais Achados)" rows={4} {...register('exameFisico')} error={errors.exameFisico?.message} leftAddon={<BookOpen size={18} className="text-gray-500 mt-2" />} placeholder="Achados principais do exame físico..." />
                    <Textarea label="Hipótese Diagnóstica" rows={3} {...register('hipoteseDiagnostica')} error={errors.hipoteseDiagnostica?.message} leftAddon={<Brain size={18} className="text-gray-500 mt-2" />} placeholder="Principais hipóteses diagnósticas..." />
                    <Textarea label="Conduta / Plano Terapêutico" rows={4} {...register('condutaPlanoTerapeutico')} error={errors.condutaPlanoTerapeutico?.message} leftAddon={<ClipboardPlus size={18} className="text-gray-500 mt-2" />} placeholder="Medicações, exames, orientações..." />
                </div>
            </fieldset>

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
                    leftIcon={<Save size={18} />}
                    className="w-full sm:w-auto"
                >
                    Salvar Consulta e Criar Prontuário
                </Button>
            </div>
        </div>
    );
};

export default ConsultaForm;