import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useWatch, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import { PacienteFormData, Genero, RacaCor, TipoSanguineo } from '../../types/paciente';
import { ufsBrasil } from '../../data/ufsBrasil';
import { 
    User, Calendar, Mail, Phone, MapPin, CreditCard, Droplet, Users, Briefcase, Info, Search, Loader2, 
    Activity, 
    AlertTriangle, 
    Pill,
    PlusCircle, Trash2
} from 'lucide-react';

const apenasLetrasEspacosAcentosHifenApostrofo = /^[a-zA-ZÀ-ú\s'-]+$/;
const nomeMinLength = 3;
const nomeMaePaiMinLength = 3;

const alergiaSchema = z.object({
  id: z.number().optional(),
  descricao: z.string().min(3, 'A descrição da alergia deve ter no mínimo 3 caracteres.').max(500, 'Descrição da alergia muito longa (máx. 500).'),
});

const comorbidadeSchema = z.object({
  id: z.number().optional(),
  descricao: z.string().min(3, 'A descrição da comorbidade deve ter no mínimo 3 caracteres.').max(500, 'Descrição da comorbidade muito longa (máx. 500).'),
});

const medicamentoContinuoSchema = z.object({
  id: z.number().optional(),
  descricao: z.string().min(3, 'A descrição do medicamento deve ter no mínimo 3 caracteres.').max(500, 'Descrição do medicamento muito longa (máx. 500).'),
});

const pacienteFormSchema = z.object({
  nome: z.string()
    .min(nomeMinLength, `Nome completo deve ter no mínimo ${nomeMinLength} caracteres.`)
    .regex(apenasLetrasEspacosAcentosHifenApostrofo, 'Nome deve conter apenas letras, espaços, acentos, apóstrofos e hífens.'),
  dataNascimento: z.string()
    .refine(val => !!val, { message: 'Data de nascimento é obrigatória.' })
    .refine(val => !isNaN(Date.parse(val)) && new Date(val) <= new Date(), { message: 'Data de nascimento inválida ou futura.'}),
  cpf: z.preprocess(
    (val) => String(val ?? '').replace(/\D/g, ''),
    z.string()
      .length(11, 'CPF deve ter 11 dígitos.')
      .regex(/^\d{11}$/, 'CPF deve conter apenas números.')
  ),
  rg: z.string()
    .optional()
    .transform(val => (val === "" ? undefined : val))
    .refine(val => !val || /^\d{1,9}$/.test(val), {message: 'RG deve conter no máximo 9 dígitos numéricos.'}),
  genero: z.nativeEnum(Genero, { errorMap: () => ({ message: 'Selecione um gênero válido.'})}),
  telefone: z.preprocess(
    (val) => String(val ?? '').replace(/\D/g, ''),
    z.string()
      .min(10, 'Telefone deve ter 10 ou 11 dígitos.')
      .max(11, 'Telefone deve ter 10 ou 11 dígitos.')
      .regex(/^\d{10,11}$/, 'Telefone deve conter apenas números (com DDD).')
  ),
  email: z.string().email('Email inválido (precisa de @ e domínio).'),
  nomeMae: z.string()
    .min(nomeMaePaiMinLength, `Nome da mãe deve ter no mínimo ${nomeMaePaiMinLength} caracteres.`)
    .regex(apenasLetrasEspacosAcentosHifenApostrofo, 'Nome da mãe deve conter apenas letras, espaços, acentos, apóstrofos e hífens.'),
  nomePai: z.string()
    .optional()
    .transform(val => (val === "" ? undefined : val))
    .refine(val => !val || val.length === 0 || (val.length >= nomeMaePaiMinLength && apenasLetrasEspacosAcentosHifenApostrofo.test(val)), {
        message: `Nome do pai, se informado, deve ter no mínimo ${nomeMaePaiMinLength} caracteres e conter apenas letras, espaços, acentos, apóstrofos e hífens.`
    }),
  cartaoSus: z.preprocess(
    (val) => String(val ?? '').replace(/\D/g, ''),
    z.string()
      .optional()
      .transform(val => (val === "" ? undefined : val))
      .refine(val => !val || /^\d{15}$/.test(val), { message: 'Cartão SUS deve conter 15 dígitos numéricos.' })
  ),
  racaCor: z.union([z.nativeEnum(RacaCor), z.literal("")]).optional(),
  tipoSanguineo: z.union([z.nativeEnum(TipoSanguineo), z.literal("")]).optional(),
  nacionalidade: z.string().optional().transform(val => (val === "" ? undefined : val)),
  ocupacao: z.string()
    .optional()
    .transform(val => (val === "" ? undefined : val))
    .refine(val => !val || apenasLetrasEspacosAcentosHifenApostrofo.test(val), 'Ocupação deve conter apenas letras, espaços, acentos, apóstrofos e hífens.'),
  
  alergias: z.array(alergiaSchema).optional(),
  comorbidades: z.array(comorbidadeSchema).optional(),
  medicamentosContinuos: z.array(medicamentoContinuoSchema).optional(),

  endereco: z.object({
    cep: z.string()
      .min(8, 'CEP deve ter 8 dígitos.')
      .max(8, 'CEP deve ter 8 dígitos.')
      .regex(/^\d{8}$/, 'CEP deve conter apenas números.'),
    logradouro: z.string().min(3, 'Logradouro é obrigatório.'),
    numero: z.string()
      .min(1, 'Número é obrigatório.')
      .regex(/^\d+$/, 'Número deve conter apenas dígitos.'),
    complemento: z.string().optional().transform(val => (val === "" ? undefined : val)),
    bairro: z.string().min(2, 'Bairro é obrigatório.'),
    cidade: z.string().min(2, 'Cidade é obrigatória.'),
    estado: z.string().length(2, 'UF inválida.'),
  }),
});


interface PacienteFormProps {
  onSubmit: (data: PacienteFormData) => void;
  initialData?: Partial<PacienteFormData>;
  isLoading?: boolean;
  isEditMode?: boolean;
  customActions?: React.ReactNode;
}

const PacienteForm: React.FC<PacienteFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  isEditMode = false,
  customActions,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    clearErrors,
    watch
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteFormSchema),
  });

  const { fields: alergiaFields, append: appendAlergia, remove: removeAlergia } = useFieldArray({
    control,
    name: "alergias"
  });

  const { fields: comorbidadeFields, append: appendComorbidade, remove: removeComorbidade } = useFieldArray({
    control,
    name: "comorbidades"
  });

  const { fields: medicamentoFields, append: appendMedicamento, remove: removeMedicamento } = useFieldArray({
    control,
    name: "medicamentosContinuos"
  });

  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const cepValue = useWatch({ control, name: 'endereco.cep' });

  const fetchAddressFromCep = useCallback(async (cep: string) => {
    if (cep.length === 8 && /^\d{8}$/.test(cep)) {
      setIsCepLoading(true);
      setCepError(null);
      clearErrors("endereco.cep");
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) throw new Error('CEP não encontrado ou inválido.');
        const data = await response.json();
        if (data.erro) throw new Error('CEP não encontrado.');
        setValue('endereco.logradouro', data.logradouro || '', { shouldValidate: true });
        setValue('endereco.bairro', data.bairro || '', { shouldValidate: true });
        setValue('endereco.cidade', data.localidade || '', { shouldValidate: true });
        setValue('endereco.estado', data.uf || '', { shouldValidate: true });
        setValue('endereco.complemento', data.complemento || '');
        document.getElementById('endereco.numero')?.focus();
      } catch (error: any) {
        setCepError(error.message || 'Erro ao buscar CEP.');
        ['logradouro', 'bairro', 'cidade', 'estado'].forEach(field => setValue(`endereco.${field}` as any, ''));
      } finally {
        setIsCepLoading(false);
      }
    } else {
      setCepError(null);
    }
  }, [setValue, clearErrors]);

  useEffect(() => {
    if (cepValue) fetchAddressFromCep(cepValue.replace(/\D/g, ''));
  }, [cepValue, fetchAddressFromCep]);

  React.useEffect(() => {
    const defaultFormValues: PacienteFormData = {
        nome: '', dataNascimento: '', cpf: '', rg: '', genero: Genero.NAO_INFORMADO,
        telefone: '', email: '', nomeMae: '', nomePai: '',
        cartaoSus: '',
        racaCor: '' as RacaCor | '', tipoSanguineo: '' as TipoSanguineo | '', nacionalidade: 'Brasileira', ocupacao: '',
        alergias: [],
        comorbidades: [],
        medicamentosContinuos: [],
        endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' },
    };

    if (initialData) {
        const dataToReset = {
            ...defaultFormValues, 
            ...initialData, 
            dataNascimento: initialData.dataNascimento ? initialData.dataNascimento.split('T')[0] : '',
            alergias: initialData.alergias || [],
            comorbidades: initialData.comorbidades || [],
            medicamentosContinuos: initialData.medicamentosContinuos || [],
        };
        reset(dataToReset);
    } else {
        reset(defaultFormValues);
    }
  }, [initialData, reset]);

  const generoOptions = Object.values(Genero).map(g => ({ value: g, label: g.charAt(0) + g.slice(1).toLowerCase().replace(/_/g, " ") }));
  const racaCorOptions = [{value: '', label: 'Selecione...'}, ...Object.values(RacaCor).map(rc => ({ value: rc, label: rc.charAt(0) + rc.slice(1).toLowerCase().replace(/_/g, " ") }))];
  const tipoSanguineoOptions = [{value: '', label: 'Selecione...'}, ...Object.values(TipoSanguineo).map(ts => ({ value: ts, label: ts.replace(/_/g, " ") }))];

  const handleNomeInput = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    let value = input.value;
    
    value = value.replace(/[^a-zA-ZÀ-ú\s'-]/g, ''); 
    input.value = value.toUpperCase();
    
    if (start !== null && end !== null) {
      try { input.setSelectionRange(start, end); } catch (e) {}
    }
  };
  
  const handleOnlyLettersAndAccentsInput = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    input.value = input.value.replace(/[^a-zA-ZÀ-ú\s'-]/g, '');
  };

  const handleOnlyNumbersInput = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    input.value = input.value.replace(/\D/g, '');
  };

  const maskCPF = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    let result = '';
    for (let i = 0; i < digits.length; i++) {
      if (i === 3 || i === 6) result += '.';
      else if (i === 9) result += '-';
      result += digits[i];
    }
    return result;
  };

  const maskTelefone = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    const n = digits.length;
    if (n === 0) return "";
    if (n <= 2) return `(${digits}`;
    if (n <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (n <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const maskCartaoSUS = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 15);
    let result = '';
    for (let i = 0; i < digits.length; i++) {
      if (i === 3 || i === 7 || i === 11) result += '.';
      result += digits[i];
    }
    return result;
  };

  const createMaskedInputHandler = (formatter: (value: string) => string) => {
    return (event: React.FormEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      const originalValue = input.value;
      const originalSelectionStart = input.selectionStart;
      const formattedValue = formatter(originalValue);
      input.value = formattedValue;
      if (originalSelectionStart !== null) {
        let newCursorPos = originalSelectionStart + (formattedValue.length - originalValue.length);
        newCursorPos = Math.max(0, Math.min(newCursorPos, formattedValue.length));
        try {
          input.setSelectionRange(newCursorPos, newCursorPos);
        } catch (e) {}
      }
    };
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h3 className="text-lg font-medium text-neutral-900 border-b pb-2">Dados Pessoais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nome Completo*" {...register('nome')} error={errors.nome?.message} leftAddon={<User className="h-4 w-4" />} onInput={handleNomeInput} />
        <Input label="Data de Nascimento*" type="date" {...register('dataNascimento')} error={errors.dataNascimento?.message} leftAddon={<Calendar className="h-4 w-4" />} />
        <Input 
          label="CPF*" 
          {...register('cpf')} 
          error={errors.cpf?.message} 
          placeholder="___.___.___-__" 
          maxLength={14} 
          leftAddon={<Info className="h-4 w-4" />} 
          onInput={createMaskedInputHandler(maskCPF)}
        />
        <Input 
          label="RG" 
          {...register('rg')} 
          error={errors.rg?.message} 
          placeholder="Somente números" 
          maxLength={9} 
          leftAddon={<Info className="h-4 w-4" />} 
          onInput={handleOnlyNumbersInput} 
        />
        <Controller
            name="genero"
            control={control}
            render={({ field }) => (
                <Select label="Gênero*" options={generoOptions} {...field} error={errors.genero?.message} leftAddon={<Users className="h-4 w-4" />} />
            )}
        />
        <Input label="Nacionalidade" {...register('nacionalidade')} error={errors.nacionalidade?.message} leftAddon={<MapPin className="h-4 w-4" />} onInput={handleOnlyLettersAndAccentsInput} />
      </div>

      <h3 className="text-lg font-medium text-neutral-900 border-b pb-2 pt-4">Filiação e Contato</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nome da Mãe*" {...register('nomeMae')} error={errors.nomeMae?.message} leftAddon={<User className="h-4 w-4" />} onInput={handleNomeInput} />
        <Input label="Nome do Pai" {...register('nomePai')} error={errors.nomePai?.message} leftAddon={<User className="h-4 w-4" />} onInput={handleNomeInput} />
        <Input 
          label="Telefone*" 
          {...register('telefone')} 
          error={errors.telefone?.message} 
          placeholder="(__) _____-____" 
          maxLength={15} 
          leftAddon={<Phone className="h-4 w-4" />} 
          onInput={createMaskedInputHandler(maskTelefone)} 
        />
        <Input label="Email*" type="email" {...register('email')} error={errors.email?.message} leftAddon={<Mail className="h-4 w-4" />} />
      </div>

      <h3 className="text-lg font-medium text-neutral-900 border-b pb-2 pt-4">Dados Adicionais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
        <Input 
          label="Cartão SUS" 
          {...register('cartaoSus')} 
          error={errors.cartaoSus?.message} 
          placeholder="___.___.___.___" 
          maxLength={18}
          leftAddon={<CreditCard className="h-4 w-4" />} 
          onInput={createMaskedInputHandler(maskCartaoSUS)} 
        />
         <Controller
            name="racaCor"
            control={control}
            render={({ field }) => (
                <Select label="Raça/Cor" options={racaCorOptions} {...field} error={errors.racaCor?.message} leftAddon={<Users className="h-4 w-4" />} />
            )}
        />
        <Controller
            name="tipoSanguineo"
            control={control}
            render={({ field }) => (
                <Select label="Tipo Sanguíneo" options={tipoSanguineoOptions} {...field} error={errors.tipoSanguineo?.message} leftAddon={<Droplet className="h-4 w-4" />} />
            )}
        />
        <Input label="Ocupação" {...register('ocupacao')} error={errors.ocupacao?.message} leftAddon={<Briefcase className="h-4 w-4" />} onInput={handleOnlyLettersAndAccentsInput} />
      </div>

      <h3 className="text-lg font-medium text-neutral-900 border-b pb-2 pt-4">Histórico de Saúde</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-neutral-700">Alergias</label>
          <Button type="button" variant="secondary" size="sm" onClick={() => appendAlergia({ descricao: '' })} leftIcon={<PlusCircle className="h-4 w-4" />}>
            Adicionar Alergia
          </Button>
        </div>
        {alergiaFields.length === 0 && (
          <p className="text-sm text-neutral-500 italic">Nenhuma alergia cadastrada.</p>
        )}
        {alergiaFields.map((item, index) => (
          <div key={item.id} className="flex items-end space-x-2">
            <Input
              label={`Descrição da Alergia ${index + 1}`}
              placeholder="Ex: Dipirona, Pólen, Amendoim..."
              {...register(`alergias.${index}.descricao` as const)}
              error={errors.alergias?.[index]?.descricao?.message}
              fullWidth
            />
            <Button type="button" variant="danger" size="md" onClick={() => removeAlergia(index)} leftIcon={<Trash2 className="h-10 w-4" />}>
              Remover
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-neutral-700">Comorbidades</label>
          <Button type="button" variant="secondary" size="sm" onClick={() => appendComorbidade({ descricao: '' })} leftIcon={<PlusCircle className="h-4 w-4" />}>
            Adicionar Comorbidade
          </Button>
        </div>
        {comorbidadeFields.length === 0 && (
          <p className="text-sm text-neutral-500 italic">Nenhuma comorbidade cadastrada.</p>
        )}
        {comorbidadeFields.map((item, index) => (
          <div key={item.id} className="flex items-end space-x-2">
            <Input
              label={`Descrição da Comorbidade ${index + 1}`}
              placeholder="Ex: Hipertensão, Diabetes Tipo 2..."
              {...register(`comorbidades.${index}.descricao` as const)}
              error={errors.comorbidades?.[index]?.descricao?.message}
              fullWidth
            />
            <Button type="button" variant="danger" size="md" onClick={() => removeComorbidade(index)} leftIcon={<Trash2 className="h-10 w-4" />}>
              Remover
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-neutral-700">Medicamentos Contínuos</label>
          <Button type="button" variant="secondary" size="sm" onClick={() => appendMedicamento({ descricao: '' })} leftIcon={<PlusCircle className="h-4 w-4" />}>
            Adicionar Medicamento
          </Button>
        </div>
        {medicamentoFields.length === 0 && (
          <p className="text-sm text-neutral-500 italic">Nenhum medicamento contínuo cadastrado.</p>
        )}
        {medicamentoFields.map((item, index) => (
          <div key={item.id} className="flex items-end space-x-2">
            <Input
              label={`Descrição do Medicamento ${index + 1}`}
              placeholder="Ex: Losartana 50mg, Insulina NPH..."
              {...register(`medicamentosContinuos.${index}.descricao` as const)}
              error={errors.medicamentosContinuos?.[index]?.descricao?.message}
              fullWidth
            />
            <Button type="button" variant="danger" size="md" onClick={() => removeMedicamento(index)} leftIcon={<Trash2 className="h-10 w-4" />}>
              Remover
            </Button>
          </div>
        ))}
      </div>


      <h3 className="text-lg font-medium text-neutral-900 border-b pb-2 pt-4">Endereço</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          label="CEP*"
          {...register('endereco.cep')}
          error={errors.endereco?.cep?.message || cepError || undefined}
          placeholder="Somente números"
          maxLength={8}
          leftAddon={<MapPin className="h-4 w-4" />}
          rightAddon={isCepLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 text-gray-400"/>}
          onInput={handleOnlyNumbersInput}
        />
        <Input label="Logradouro*" {...register('endereco.logradouro')} error={errors.endereco?.logradouro?.message} className="md:col-span-2 lg:col-span-2" />
        <Input
            label="Número*" 
            {...register('endereco.numero')} 
            error={errors.endereco?.numero?.message} 
            id="endereco.numero" 
            placeholder="Apenas números"
            onInput={handleOnlyNumbersInput}
        />
        <Input label="Complemento" {...register('endereco.complemento')} error={errors.endereco?.complemento?.message} />
        <Input label="Bairro*" {...register('endereco.bairro')} error={errors.endereco?.bairro?.message} />
        <Input label="Cidade*" {...register('endereco.cidade')} error={errors.endereco?.cidade?.message} />
         <Controller
            name="endereco.estado"
            control={control}
            render={({ field }) => (
                <Select label="UF*" options={ufsBrasil} {...field} error={errors.endereco?.estado?.message} />
            )}
        />
      </div>

      <div className="pt-8 flex flex-wrap justify-end items-center gap-3">
        {customActions}
        <Button type="submit" variant={isEditMode ? "primary" : "success"} isLoading={isLoading}>
          {isEditMode ? 'Salvar Alterações' : 'Cadastrar Paciente'}
        </Button>
      </div>
    </form>
  );
};
export default PacienteForm;