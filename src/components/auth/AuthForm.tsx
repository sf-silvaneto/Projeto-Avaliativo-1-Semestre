import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { User, Mail, Lock, AlertTriangle, Key as KeyIcon, Eye, EyeOff } from 'lucide-react';

const apenasLetrasEspacosAcentosHifenApostrofo = /^[a-zA-ZÀ-ú\s'-]+$/;

const strongPasswordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/
);

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const cadastroSchema = z.object({
  nome: z.string()
        .min(3, 'O nome deve ter pelo menos 3 caracteres.')
        .regex(apenasLetrasEspacosAcentosHifenApostrofo, 'Nome deve conter apenas letras, espaços, acentos, apóstrofos e hífens.'),
  email: z.string().email('Email inválido.')
            .regex(/^[^\s@]+@hm\.com$/, 'O email deve ser do domínio @hm.com.'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.')
            .regex(strongPasswordValidation, 'Senha fraca. Use maiúscula, minúscula, número e símbolo.'),
  confirmarSenha: z.string(),
  palavraChave: z.string().min(4, 'A palavra-chave deve ter no mínimo 4 caracteres.'),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem.',
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
  const currentSchema = isLogin ? loginSchema : cadastroSchema;

  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [showPalavraChave, setShowPalavraChave] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData | CadastroFormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: isLogin ? {} : {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      palavraChave: ''
    }
  });

  const getError = (fieldName: keyof CadastroFormData | keyof LoginFormData) => {
    return (errors as any)[fieldName]?.message;
  };

  const handleNomeInput = (event: React.FormEvent<HTMLInputElement>) => {
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
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      {error && (
        <Alert type="error" message={error} className="mb-4" />
      )}

      {!isLogin && (
        <Input
          label="Nome Completo"
          placeholder="Digite seu nome completo"
          leftAddon={<User className="h-5 w-5" />}
          {...register('nome')}
          onInput={handleNomeInput}
          error={getError('nome')}
        />
      )}

      <Input
        label="Email"
        type="email"
        placeholder="Digite seu email"
        leftAddon={<Mail className="h-5 w-5" />}
        {...register('email')}
        error={getError('email')}
      />
      
      <Input
        label="Senha"
        type={showSenha ? "text" : "password"}
        placeholder={isLogin ? "Digite sua senha" : "Crie uma senha"}
        leftAddon={<Lock className="h-5 w-5" />}
        rightAddon={
          <button type="button" onClick={() => setShowSenha(!showSenha)} className="focus:outline-none p-1">
            {showSenha ? <EyeOff className="h-5 w-5 text-neutral-500" /> : <Eye className="h-5 w-5 text-neutral-500" />}
          </button>
        }
        helperText={!isLogin ? "Mín. 6 caracteres, com maiúscula, minúscula, número e símbolo." : undefined}
        {...register('senha')}
        error={getError('senha')}
      />

      {!isLogin && (
        <>
          <Input
            label="Confirmar Senha"
            type={showConfirmarSenha ? "text" : "password"}
            placeholder="Confirme sua senha"
            leftAddon={<Lock className="h-5 w-5" />}
            rightAddon={
              <button type="button" onClick={() => setShowConfirmarSenha(!showConfirmarSenha)} className="focus:outline-none p-1">
                {showConfirmarSenha ? <EyeOff className="h-5 w-5 text-neutral-500" /> : <Eye className="h-5 w-5 text-neutral-500" />}
              </button>
            }
            {...register('confirmarSenha')}
            error={getError('confirmarSenha')}
          />
          <Input
            label="Palavra Chave"
            type={showPalavraChave ? "text" : "password"}
            placeholder="Digite sua palavra-chave (mín. 4 caracteres)"
            leftAddon={<KeyIcon className="h-5 w-5" />}
            rightAddon={
              <button type="button" onClick={() => setShowPalavraChave(!showPalavraChave)} className="focus:outline-none p-1">
                {showPalavraChave ? <EyeOff className="h-5 w-5 text-neutral-500" /> : <Eye className="h-5 w-5 text-neutral-500" />}
              </button>
            }
            {...register('palavraChave')}
            error={getError('palavraChave')}
          />
        </>
      )}

      <div className="mt-6">
        <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
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