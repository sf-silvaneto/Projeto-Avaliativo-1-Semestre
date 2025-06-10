import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { Medico } from '../../types/medico';
import { User, Activity, Award, Edit3, Save, ToggleLeft, ToggleRight, MapPin } from 'lucide-react';
import { especialidadesMedicas, nomesEspecialidades } from '../../data/especialidadesMedicas';
import { ufsBrasil } from '../../data/ufsBrasil';

const apenasLetrasEspacosAcentosHifenApostrofo = /^[a-zA-ZÀ-ú\s'-]+$/;

const sixDigitNumberSchema = z.string()
  .regex(/^\d*$/, 'Apenas números são permitidos')
  .max(6, 'Máximo de 6 dígitos');

const sixDigitNumberRequiredSchema = z.string()
  .min(1, 'Campo obrigatório')
  .regex(/^\d+$/, 'Apenas números são permitidos')
  .max(6, 'Máximo de 6 dígitos');

const nameSchema = z.string()
  .min(10, 'Nome completo deve ter no mínimo 10 caracteres')
  .regex(apenasLetrasEspacosAcentosHifenApostrofo, 'Nome deve conter apenas letras, espaços, acentos, apóstrofos e hífens');

const medicoSchema = z.object({
  nomeCompleto: nameSchema,
  crm: sixDigitNumberRequiredSchema.min(1, 'CRM é obrigatório'),
  crmUf: z.string().min(2, 'UF do CRM é obrigatória').max(2),
  especialidade: z.string().min(1, 'Especialidade é obrigatória'),
  resumoEspecialidade: z.string().max(1000, 'Resumo não pode exceder 1000 caracteres').optional().or(z.literal('')),
  rqe: sixDigitNumberSchema.optional().or(z.literal('')),
  });

export type MedicoFormData = z.infer<typeof medicoSchema>;

interface MedicoFormProps {
  onSubmit: (data: MedicoFormData) => void;
  initialData?: Medico;
  isLoading?: boolean;
  isEditMode?: boolean;
  customActions?: React.ReactNode;
}

const MedicoForm: React.FC<MedicoFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  isEditMode = false,
  customActions,
}) => {
  let initialCrmNumero = '';
  let initialCrmUf = '';

  if (initialData?.crm) {
    const crmMatch = initialData.crm.match(/^(\d+)([A-Z]{2})$/);
    if (crmMatch) {
      initialCrmNumero = crmMatch[1];
      initialCrmUf = crmMatch[2];
    } else if (/^\d+$/.test(initialData.crm) && initialData.crm.length <= 6) {
      initialCrmNumero = initialData.crm;
    } else {
        const potentialUf = initialData.crm.slice(-2);
        if (ufsBrasil.some(uf => uf.value === potentialUf.toUpperCase())) {
            initialCrmNumero = initialData.crm.slice(0, -2);
            initialCrmUf = potentialUf.toUpperCase();
        } else {
            initialCrmNumero = initialData.crm;
            initialCrmUf = ''; 
        }
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch
  } = useForm<MedicoFormData>({
    resolver: zodResolver(medicoSchema),
    defaultValues: initialData ? {
        nomeCompleto: initialData.nomeCompleto,
        crm: initialCrmNumero,
        crmUf: initialCrmUf,
        especialidade: initialData.especialidade,
        resumoEspecialidade: initialData.resumoEspecialidade || '',
        rqe: initialData.rqe || '',
        // deletedAt: initialData.deletedAt, // Considerar se é necessário aqui, já que o formulário não edita explicitamente o status
    } : {
        nomeCompleto: '',
        crm: '',
        crmUf: '',
        especialidade: '',
        resumoEspecialidade: '',
        rqe: '',
    },
  });

  const especialidadeSelecionada = watch('especialidade');

  useEffect(() => {
    if (initialData) {
      let crmNum = '';
      let crmUfVal = '';
      if (initialData.crm) {
        const crmMatch = initialData.crm.match(/^(\d+)([A-Z]{2})$/);
        if (crmMatch) {
          crmNum = crmMatch[1];
          crmUfVal = crmMatch[2];
        } else if (/^\d+$/.test(initialData.crm) && initialData.crm.length <= 6) {
            crmNum = initialData.crm;
        } else {
            const potentialUf = initialData.crm.slice(-2);
            if (ufsBrasil.some(uf => uf.value === potentialUf.toUpperCase())) {
                crmNum = initialData.crm.slice(0, -2);
                crmUfVal = potentialUf.toUpperCase();
            } else {
                crmNum = initialData.crm;
            }
        }
      }

      reset({
        nomeCompleto: initialData.nomeCompleto,
        crm: crmNum,
        crmUf: crmUfVal,
        especialidade: initialData.especialidade,
        resumoEspecialidade: initialData.resumoEspecialidade || '',
        rqe: initialData.rqe || '',
      });
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (especialidadeSelecionada) {
      const detalhe = especialidadesMedicas.find(e => e.nome === especialidadeSelecionada);
      setValue('resumoEspecialidade', detalhe ? detalhe.resumo : '');
    } else {
      setValue('resumoEspecialidade', '');
    }
  }, [especialidadeSelecionada, setValue]);

  const handleNumericInput = (event: React.ChangeEvent<HTMLInputElement>, maxLength: number) => {
    const { value } = event.target;
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= maxLength) {
      event.target.value = numericValue;
    } else {
      event.target.value = numericValue.slice(0, maxLength);
    }
    return event.target.value;
  };

  const handleNomeCompletoInput = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    let value = input.value;
    
    value = value.replace(/[^a-zA-ZÀ-ú\s'-]/g, ''); 
    input.value = value.toUpperCase();
    
    if (start !== null && end !== null) {
      try {
          input.setSelectionRange(start, end);
      } catch (e) {}
    }
  };

  return (
    <form onSubmit={handleSubmit(
        (data) => {
            const submissionData = {
                ...data,
                crm: `${data.crm}${data.crmUf}`, 
            };
            onSubmit(submissionData);
        }
    )} className="space-y-4">
      <Input
        label="Nome Completo*"
        placeholder="Digite o nome completo do médico"
        leftAddon={<User className="h-5 w-5" />}
        {...register('nomeCompleto')}
        onInput={handleNomeCompletoInput}
        error={errors.nomeCompleto?.message}
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
            <Input
                label="CRM*"
                placeholder="Somente números"
                leftAddon={<Activity className="h-5 w-5" />}
                {...register('crm', { 
                    onChange: (e) => { e.target.value = handleNumericInput(e, 6); }
                })}
                error={errors.crm?.message}
                required
                maxLength={6}
                type="text"
            />
        </div>
        <Controller
            name="crmUf"
            control={control}
            defaultValue={initialCrmUf || ""}
            render={({ field }) => (
                <Select
                label="UF do CRM*"
                options={ufsBrasil}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.crmUf?.message}
                leftAddon={<MapPin className="h-5 w-5" />}
                required
                />
            )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
            name="especialidade"
            control={control}
            defaultValue={initialData?.especialidade || ""}
            render={({ field }) => (
            <Select
                label="Especialidade*"
                options={[{value: "", label: "Selecione..."}, ...nomesEspecialidades]}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.especialidade?.message}
                leftAddon={<Award className="h-5 w-5" />}
                required
            />
            )}
        />
        <Input
          label="RQE (Opcional)"
          placeholder="Somente números"
          leftAddon={<Award className="h-5 w-5" />}
          {...register('rqe', {
            onChange: (e) => { e.target.value = handleNumericInput(e, 6); }
          })}
          error={errors.rqe?.message}
          maxLength={6}
          type="text"
        />
      </div>
      
      <Textarea
        label="Resumo da Especialidade (Automático)"
        placeholder="Selecione uma especialidade para preencher o resumo"
        rows={4}
        {...register('resumoEspecialidade')}
        error={errors.resumoEspecialidade?.message}
        readOnly 
      />

      <div className="pt-6 flex flex-wrap justify-end items-center gap-3">
        {customActions} 
        <Button
          type="submit"
          variant={isEditMode ? "primary" : "success"}
          isLoading={isLoading}
          leftIcon={isEditMode ? <Edit3 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        >
          {isEditMode ? 'Salvar Alterações' : 'Cadastrar Médico'}
        </Button>
      </div>
    </form>
  );
};

export default MedicoForm;