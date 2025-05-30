import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { FileText, Lock, Key as KeyIcon, Mail, Eye, EyeOff } from 'lucide-react';
import { FinalResetPasswordCredentials } from '../../types/auth';

const verifySchema = z.object({
  email: z.string().email('Formato de email inválido.'),
  palavraChave: z.string().min(4, 'A palavra-chave deve ter no mínimo 4 caracteres.'),
});

const strongPasswordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/
);

const resetSchema = z.object({
  novaSenha: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres.')
                .regex(strongPasswordValidation, 'Senha fraca. Use maiúscula, minúscula, número e símbolo.'),
  confirmarNovaSenha: z.string(),
}).refine((data) => data.novaSenha === data.confirmarNovaSenha, {
  message: 'As senhas não coincidem.',
  path: ['confirmarNovaSenha'],
});

type VerifyFormData = z.infer<typeof verifySchema>;
type ResetFormData = z.infer<typeof resetSchema>;

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'verify' | 'reset'>('verify');
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Este successMessage agora é apenas para o sucesso da primeira etapa (verificação)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showPalavraChave, setShowPalavraChave] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarNovaSenha, setShowConfirmarNovaSenha] = useState(false);

  const verifyForm = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    mode: 'onChange',
    defaultValues: { email: '', palavraChave: '' },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { novaSenha: '', confirmarNovaSenha: '' },
  });

  const watchedEmailVerify = verifyForm.watch("email");
  const watchedPalavraChaveVerify = verifyForm.watch("palavraChave");
  const canSubmitVerification = 
    !!watchedEmailVerify && !!watchedPalavraChaveVerify &&
    !verifyForm.formState.errors.email && 
    !verifyForm.formState.errors.palavraChave;

  const handleVerifyKeywordSubmit = async (data: VerifyFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await authService.verifyEmailAndKeyword(data);
      setVerifiedEmail(data.email);
      setStage('reset');
      setSuccessMessage('Verificação bem-sucedida! Agora defina sua nova senha.'); // Mensagem para esta etapa
      verifyForm.reset();
    } catch (err: any) {
      setError(err.response?.data?.mensagem || err.response?.data?.message || 'Email ou Palavra Chave incorretos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (data: ResetFormData) => {
    if (!verifiedEmail) {
      setError('Erro crítico: Email não verificado. Por favor, tente novamente desde o início.');
      setStage('verify');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null); // Limpa a mensagem de sucesso do estágio anterior
    try {
      const payload: FinalResetPasswordCredentials = {
        email: verifiedEmail,
        novaSenha: data.novaSenha,
        confirmarNovaSenha: data.confirmarNovaSenha,
      };
      await authService.resetPasswordAfterVerification(payload);
      
      resetForm.reset();
      // NAVEGA IMEDIATAMENTE para /login e passa o estado para exibir a mensagem lá
      navigate('/login', { 
        state: { 
          passwordResetSuccess: true, // Flag para LoginPage identificar
          message: 'Senha redefinida com sucesso! Por favor, faça o login com sua nova senha.' 
        } 
      });

    } catch (err: any) {
      setError(err.response?.data?.mensagem || err.response?.data?.message || 'Erro ao redefinir senha. Verifique os requisitos da senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-tight py-8">
      <div className="text-center mb-8">
        <div className="flex justify-center">
          <FileText className="h-12 w-12 text-primary-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">
          {stage === 'verify' ? 'Recuperar Senha' : 'Definir Nova Senha'}
        </h1>
        <p className="mt-2 text-neutral-600">
          {stage === 'verify'
            ? 'Informe seu email e palavra-chave para continuar.'
            : `Defina uma nova senha para o email: ${verifiedEmail}.`}
        </p>
      </div>

      <Card>
        {error && <Alert type="error" message={error} className="mb-4" onClose={() => setError(null)} />}
        {/* Este successMessage agora é para a primeira etapa, se desejar */}
        {successMessage && stage === 'verify' && <Alert type="success" message={successMessage} className="mb-4" onClose={() => setSuccessMessage(null)} />} 
        
        {stage === 'verify' && (
          <form onSubmit={verifyForm.handleSubmit(handleVerifyKeywordSubmit)}>
            <Input
              label="Email"
              type="email"
              placeholder="Digite seu email"
              leftAddon={<Mail className="h-5 w-5" />}
              {...verifyForm.register('email')}
              error={verifyForm.formState.errors.email?.message}
            />
            <Input
              label="Palavra Chave"
              type={showPalavraChave ? "text" : "password"}
              placeholder="Digite sua palavra-chave"
              leftAddon={<KeyIcon className="h-5 w-5" />}
              rightAddon={
                <button type="button" onClick={() => setShowPalavraChave(!showPalavraChave)} className="focus:outline-none p-1">
                  {showPalavraChave ? <EyeOff className="h-5 w-5 text-neutral-500" /> : <Eye className="h-5 w-5 text-neutral-500" />}
                </button>
              }
              {...verifyForm.register('palavraChave')}
              error={verifyForm.formState.errors.palavraChave?.message}
            />
            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                disabled={!canSubmitVerification || isLoading} 
              >
                Verificar
              </Button>
            </div>
          </form>
        )}

        {stage === 'reset' && (
          <form onSubmit={resetForm.handleSubmit(handleResetPasswordSubmit)}>
            <Input
              label="Nova Senha"
              type={showNovaSenha ? "text" : "password"}
              placeholder="Digite sua nova senha"
              leftAddon={<Lock className="h-5 w-5" />}
              rightAddon={
                <button type="button" onClick={() => setShowNovaSenha(!showNovaSenha)} className="focus:outline-none p-1">
                  {showNovaSenha ? <EyeOff className="h-5 w-5 text-neutral-500" /> : <Eye className="h-5 w-5 text-neutral-500" />}
                </button>
              }
              helperText="Mín. 6 caracteres, com maiúscula, minúscula, número e símbolo."
              {...resetForm.register('novaSenha')}
              error={resetForm.formState.errors.novaSenha?.message}
            />
            <Input
              label="Confirmar Nova Senha"
              type={showConfirmarNovaSenha ? "text" : "password"}
              placeholder="Confirme sua nova senha"
              leftAddon={<Lock className="h-5 w-5" />}
              rightAddon={ 
                <button type="button" onClick={() => setShowConfirmarNovaSenha(!showConfirmarNovaSenha)} className="focus:outline-none p-1">
                  {showConfirmarNovaSenha ? <EyeOff className="h-5 w-5 text-neutral-500" /> : <Eye className="h-5 w-5 text-neutral-500" />}
                </button>
              }
              {...resetForm.register('confirmarNovaSenha')}
              error={resetForm.formState.errors.confirmarNovaSenha?.message}
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
            <div className="text-center mt-4">
                 <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => {
                        setStage('verify');
                        setError(null);
                        setSuccessMessage(null);
                        resetForm.reset(); 
                    }}
                 >
                    Verificar outro email/palavra-chave
                 </Button>
            </div>
          </form>
        )}
      </Card>

      <div className="mt-6 text-center">
        <p className="text-neutral-600">
          Lembrou sua senha?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;