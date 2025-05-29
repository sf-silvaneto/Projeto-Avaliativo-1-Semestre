import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { FileText, Lock } from 'lucide-react';

// Schema de validação para solicitação de redefinição
const requestSchema = z.object({
  email: z.string().email('Email inválido'),
});

// Schema de validação para redefinição de senha
const resetSchema = z.object({
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string().min(6, 'A confirmação de senha deve ter pelo menos 6 caracteres'),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type RequestFormData = z.infer<typeof requestSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

const ResetPasswordPage: React.FC = () => {
  const { requestPasswordReset, resetPassword, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if token is in URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  
  const [requestSent, setRequestSent] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // Form for requesting password reset
  const requestForm = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      email: '',
    },
  });
  
  // Form for resetting password with token
  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      senha: '',
      confirmarSenha: '',
    },
  });
  
  // Handle request for password reset
  const handleRequestReset = async (data: RequestFormData) => {
    try {
      await requestPasswordReset(data.email);
      setRequestSent(true);
      clearError();
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
    }
  };
  
  // Handle password reset with token
  const handleResetPassword = async (data: ResetFormData) => {
    if (!token) return;
    
    try {
      await resetPassword({
        token,
        senha: data.senha,
        confirmarSenha: data.confirmarSenha,
      });
      setResetSuccess(true);
      clearError();
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
    }
  };
  
  // Render request form or reset form based on token presence
  const renderForm = () => {
    if (resetSuccess) {
      return (
        <Alert
          type="success"
          title="Senha redefinida com sucesso!"
          message="Sua senha foi alterada. Você será redirecionado para a página de login."
        />
      );
    }
    
    if (token) {
      return (
        <form onSubmit={resetForm.handleSubmit(handleResetPassword)}>
          {error && (
            <Alert
              type="error"
              message={error}
              className="mb-4"
            />
          )}
          
          <Input
            label="Nova Senha"
            type="password"
            placeholder="Digite sua nova senha"
            leftAddon={<Lock className="h-5 w-5" />}
            helperText="Mínimo de 6 caracteres"
            {...resetForm.register('senha')}
            error={resetForm.formState.errors.senha?.message}
          />
          
          <Input
            label="Confirmar Nova Senha"
            type="password"
            placeholder="Confirme sua nova senha"
            leftAddon={<Lock className="h-5 w-5" />}
            {...resetForm.register('confirmarSenha')}
            error={resetForm.formState.errors.confirmarSenha?.message}
          />
          
          <div className="mt-6">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Redefinir Senha
            </Button>
          </div>
        </form>
      );
    }
    
    return (
      <form onSubmit={requestForm.handleSubmit(handleRequestReset)}>
        {requestSent ? (
          <Alert
            type="success"
            title="Solicitação enviada!"
            message="Se o email fornecido estiver cadastrado, você receberá um link para redefinir sua senha. Verifique sua caixa de entrada."
          />
        ) : (
          <>
            {error && (
              <Alert
                type="error"
                message={error}
                className="mb-4"
              />
            )}
            
            <Input
              label="Email"
              type="email"
              placeholder="Digite seu email"
              {...requestForm.register('email')}
              error={requestForm.formState.errors.email?.message}
            />
            
            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Solicitar Redefinição
              </Button>
            </div>
          </>
        )}
      </form>
    );
  };
  
  return (
    <div className="container-tight py-8">
      <div className="text-center mb-8">
        <div className="flex justify-center">
          <FileText className="h-12 w-12 text-primary-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">
          {token ? 'Redefinir Senha' : 'Recuperar Senha'}
        </h1>
        <p className="mt-2 text-neutral-600">
          {token
            ? 'Digite sua nova senha para continuar'
            : 'Digite seu email para receber um link de redefinição de senha'}
        </p>
      </div>
      
      <Card>
        {renderForm()}
      </Card>
      
      <div className="mt-6 text-center">
        <p className="text-neutral-600">
          Lembrou sua senha?{' '}
          <a href="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Voltar para o login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;