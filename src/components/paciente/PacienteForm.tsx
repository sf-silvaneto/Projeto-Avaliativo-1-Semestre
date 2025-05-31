import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { PacienteFormData, Genero, RacaCor, TipoSanguineo } from '../../types/paciente';
import { ufsBrasil } from '../../data/ufsBrasil';
import { User, Calendar, Mail, Phone, MapPin, CreditCard, Droplet, Users, Briefcase, Info, Search, Loader2 } from 'lucide-react';

const apenasLetrasEspacosAcentos = /^[a-zA-ZÀ-ú\s]+$/;
const nomeMinLength = 10;
const nomeMaePaiMinLength = 10;

const pacienteFormSchema = z.object({
  nome: z.string()
    .min(nomeMinLength, `Nome completo deve ter no mínimo ${nomeMinLength} caracteres.`)
    .regex(apenasLetrasEspacosAcentos, 'Nome deve conter apenas letras e espaços.'),
  dataNascimento: z.string()
    .refine(val => !!val, { message: 'Data de nascimento é obrigatória.' })
    .refine(val => !isNaN(Date.parse(val)), { message: 'Data de nascimento inválida.'}),
  cpf: z.string()
    .min(11, 'CPF deve ter 11 dígitos.')
    .max(11, 'CPF deve ter 11 dígitos.')
    .regex(/^\d{11}$/, 'CPF deve conter apenas números.'),
  rg: z.string()
    .optional()
    .refine(val => !val || /^\d{1,9}$/.test(val), {message: 'RG deve conter no máximo 9 dígitos numéricos.'}),
  genero: z.nativeEnum(Genero, { errorMap: () => ({ message: 'Selecione um gênero válido.'})}),
  telefone: z.string()
    .min(10, 'Telefone deve ter 10 ou 11 dígitos.')
    .max(11, 'Telefone deve ter 10 ou 11 dígitos.')
    .regex(/^\d{10,11}$/, 'Telefone deve conter apenas números (com DDD).'),
  email: z.string().email('Email inválido (precisa de @).'),
  nomeMae: z.string()
    .min(nomeMaePaiMinLength, `Nome da mãe deve ter no mínimo ${nomeMaePaiMinLength} caracteres.`)
    .regex(apenasLetrasEspacosAcentos, 'Nome da mãe deve conter apenas letras e espaços.'),
  nomePai: z.string()
    .optional()
    .refine(val => !val || val.length === 0 || (val.length >= nomeMaePaiMinLength && apenasLetrasEspacosAcentos.test(val)), {
        message: `Nome do pai, se informado, deve ter no mínimo ${nomeMaePaiMinLength} caracteres e conter apenas letras/espaços.`
    }),
  dataEntrada: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: 'Data de entrada inválida.'}),
  cartaoSus: z.string()
    .optional()
    .refine(val => !val || /^\d{1,15}$/.test(val), { message: 'Cartão SUS deve conter no máximo 15 dígitos numéricos.'}),
  racaCor: z.union([z.nativeEnum(RacaCor), z.literal("")]).optional(),
  tipoSanguineo: z.union([z.nativeEnum(TipoSanguineo), z.literal("")]).optional(),
  nacionalidade: z.string().optional(),
  ocupacao: z.string()
    .optional()
    .refine(val => !val || apenasLetrasEspacosAcentos.test(val), 'Ocupação deve conter apenas letras e espaços.'),
  endereco: z.object({
    cep: z.string()
      .min(8, 'CEP deve ter 8 dígitos.')
      .max(8, 'CEP deve ter 8 dígitos.')
      .regex(/^\d{8}$/, 'CEP deve conter apenas números.'),
    logradouro: z.string().min(3, 'Logradouro é obrigatório.'),
    numero: z.string()
      .min(1, 'Número é obrigatório.')
      .regex(/^\d+$/, 'Número deve conter apenas dígitos.'),
    complemento: z.string().optional(),
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
  customActions?: React.ReactNode; // <-- Nova prop adicionada aqui
}

const PacienteForm: React.FC<PacienteFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  isEditMode = false,
  customActions, // <-- Prop recebida aqui
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    clearErrors,
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteFormSchema),
    defaultValues: initialData || {
      nome: '',
      dataNascimento: '',
      cpf: '',
      rg: '',
      genero: Genero.NAO_INFORMADO,
      telefone: '',
      email: '',
      nomeMae: '',
      nomePai: '',
      dataEntrada: new Date().toISOString().split('T')[0],
      cartaoSus: '',
      racaCor: '',
      tipoSanguineo: '',
      nacionalidade: 'Brasileira',
      ocupacao: '',
      endereco: {
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
      },
    },
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
        if (!response.ok) {
          throw new Error('CEP não encontrado ou inválido.');
        }
        const data = await response.json();
        if (data.erro) {
          throw new Error('CEP não encontrado.');
        }
        setValue('endereco.logradouro', data.logradouro || '', { shouldValidate: true });
        setValue('endereco.bairro', data.bairro || '', { shouldValidate: true });
        setValue('endereco.cidade', data.localidade || '', { shouldValidate: true });
        setValue('endereco.estado', data.uf || '', { shouldValidate: true });
        setValue('endereco.complemento', data.complemento || '');
        const numeroInput = document.getElementById('endereco.numero');
        if(numeroInput) numeroInput.focus();

      } catch (error: any) {
        setCepError(error.message || 'Erro ao buscar CEP.');
        setValue('endereco.logradouro', '');
        setValue('endereco.bairro', '');
        setValue('endereco.cidade', '');
        setValue('endereco.estado', '');
      } finally {
        setIsCepLoading(false);
      }
    } else {
      setCepError(null);
    }
  }, [setValue, clearErrors]);

  useEffect(() => {
    if (cepValue) {
      fetchAddressFromCep(cepValue.replace(/\D/g, ''));
    }
  }, [cepValue, fetchAddressFromCep]);


  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
        // Garante que dataEntrada seja definida no modo de criação
        setValue('dataEntrada', new Date().toISOString().split('T')[0]);
        setValue('nacionalidade', 'Brasileira');
        setValue('genero', Genero.NAO_INFORMADO);
    }
  }, [initialData, reset, setValue]);

  const generoOptions = Object.values(Genero).map(g => ({ value: g, label: g.charAt(0) + g.slice(1).toLowerCase().replace(/_/g, " ") }));
  const racaCorOptions = [{value: '', label: 'Selecione...'}, ...Object.values(RacaCor).map(rc => ({ value: rc, label: rc.charAt(0) + rc.slice(1).toLowerCase().replace(/_/g, " ") }))];
  const tipoSanguineoOptions = [{value: '', label: 'Selecione...'}, ...Object.values(TipoSanguineo).map(ts => ({ value: ts, label: ts.replace(/_/g, " ") }))];

  const handleOnlyLettersInput = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    input.value = input.value.replace(/[^a-zA-ZÀ-ú\s]/g, '');
  };

  const handleOnlyNumbersInput = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    input.value = input.value.replace(/\D/g, '');
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h3 className="text-lg font-medium text-neutral-900 border-b pb-2">Dados Pessoais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nome Completo*" {...register('nome')} error={errors.nome?.message} leftAddon={<User className="h-4 w-4" />} onInput={handleOnlyLettersInput} />
        <Input label="Data de Nascimento*" type="date" {...register('dataNascimento')} error={errors.dataNascimento?.message} leftAddon={<Calendar className="h-4 w-4" />} />
        <Input label="CPF*" {...register('cpf')} error={errors.cpf?.message} placeholder="Somente números" maxLength={11} leftAddon={<Info className="h-4 w-4" />} onInput={handleOnlyNumbersInput} />
        <Input label="RG" {...register('rg')} error={errors.rg?.message} placeholder="Somente números" maxLength={9} leftAddon={<Info className="h-4 w-4" />} onInput={handleOnlyNumbersInput}/>
        <Controller
            name="genero"
            control={control}
            render={({ field }) => (
                <Select label="Gênero*" options={generoOptions} {...field} error={errors.genero?.message} leftAddon={<Users className="h-4 w-4" />} />
            )}
        />
        <Input label="Nacionalidade" {...register('nacionalidade')} error={errors.nacionalidade?.message} leftAddon={<MapPin className="h-4 w-4" />} onInput={handleOnlyLettersInput} />
      </div>

      <h3 className="text-lg font-medium text-neutral-900 border-b pb-2 pt-4">Filiação e Contato</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nome da Mãe*" {...register('nomeMae')} error={errors.nomeMae?.message} leftAddon={<User className="h-4 w-4" />} onInput={handleOnlyLettersInput} />
        <Input label="Nome do Pai" {...register('nomePai')} error={errors.nomePai?.message} leftAddon={<User className="h-4 w-4" />} onInput={handleOnlyLettersInput} />
        <Input label="Telefone*" {...register('telefone')} error={errors.telefone?.message} placeholder="Somente números com DDD" maxLength={11} leftAddon={<Phone className="h-4 w-4" />} onInput={handleOnlyNumbersInput} />
        <Input label="Email*" type="email" {...register('email')} error={errors.email?.message} leftAddon={<Mail className="h-4 w-4" />} />
      </div>

      <h3 className="text-lg font-medium text-neutral-900 border-b pb-2 pt-4">Dados Adicionais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input label="Data de Entrada/Cadastro" type="date" {...register('dataEntrada')} error={errors.dataEntrada?.message} leftAddon={<Calendar className="h-4 w-4" />} />
        <Input label="Cartão SUS" {...register('cartaoSus')} error={errors.cartaoSus?.message} placeholder="Somente números" maxLength={15} leftAddon={<CreditCard className="h-4 w-4" />} onInput={handleOnlyNumbersInput} />
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
        <Input label="Ocupação" {...register('ocupacao')} error={errors.ocupacao?.message} leftAddon={<Briefcase className="h-4 w-4" />} onInput={handleOnlyLettersInput} />
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
        <Input label="Número*" {...register('endereco.numero')} error={errors.endereco?.numero?.message} onInput={handleOnlyNumbersInput} id="endereco.numero" />
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

      {/* Área dos botões de ação MODIFICADA */}
      <div className="pt-8 flex flex-wrap justify-end items-center gap-3">
        {customActions} {/* Renderiza as ações personalizadas (botão Voltar) */}
        <Button type="submit" variant={isEditMode ? "primary" : "success"} isLoading={isLoading}>
          {isEditMode ? 'Salvar Alterações' : 'Cadastrar Paciente'}
        </Button>
      </div>
    </form>
  );
};
export default PacienteForm;