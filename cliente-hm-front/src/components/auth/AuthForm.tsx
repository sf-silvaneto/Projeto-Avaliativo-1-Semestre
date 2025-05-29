import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { User, Mail, Lock, AlertTriangle } from 'lucide-react';

// Esquema de validação para CPF
const validarCPF = (cpf: string) => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Cálculo de validação
  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

// Definindo esquemas de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const cadastroSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().refine(validarCPF, { message: 'CPF inválido' }),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type CadastroFormData = z.infer<typeof cadastroSchema>;

interface AuthFormProps {
  type: 'login' | 'cadastro';
  onSubmit: (data: LoginFormData | CadastroFormData) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  type,
  onSubmit,
  isLoading = false,
  error,
  className,
}) => {
  const isLogin = type === 'login';
  const schema = isLogin ? loginSchema : cadastroSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className={className}>
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-4"
        />
      )}

      {!isLogin && (
        <Input
          label="Nome Completo"
          placeholder="Digite seu nome completo"
          leftAddon={<User className="h-5 w-5" />}
          {...register('nome')}
          error={errors.nome?.message}
        />
      )}

      <Input
        label="Email"
        type="email"
        placeholder="Digite seu email"
        leftAddon={<Mail className="h-5 w-5" />}
        {...register('email')}
        error={errors.email?.message}
      />

      {!isLogin && (
        <Input
          label="CPF"
          placeholder="000.000.000-00"
          helperText="Digite apenas os números"
          {...register('cpf')}
          error={errors.cpf?.message}
        />
      )}

      <Input
        label="Senha"
        type="password"
        placeholder={isLogin ? "Digite sua senha" : "Crie uma senha"}
        leftAddon={<Lock className="h-5 w-5" />}
        helperText={!isLogin ? "Mínimo de 6 caracteres" : undefined}
        {...register('senha')}
        error={errors.senha?.message}
      />

      {!isLogin && (
        <Input
          label="Confirmar Senha"
          type="password"
          placeholder="Confirme sua senha"
          leftAddon={<Lock className="h-5 w-5" />}
          {...register('confirmarSenha')}
          error={errors.confirmarSenha?.message}
        />
      )}

      <div className="mt-6">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
        >
          {isLogin ? 'Entrar' : 'Cadastrar'}
        </Button>
      </div>

      {isLogin && (
        <div className="mt-4 text-center">
          <a href="/recuperar-senha" className="text-sm text-primary-600 hover:text-primary-700">
            Esqueceu sua senha?
          </a>
        </div>
      )}

      {!isLogin && (
        <div className="mt-4 flex items-center justify-center text-sm">
          <AlertTriangle className="h-4 w-4 text-warning-500 mr-2" />
          <span className="text-neutral-600">
            Protegemos seus dados conforme a LGPD
          </span>
        </div>
      )}
    </form>
  );
};

export default AuthForm;