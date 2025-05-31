import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { User as UserIcon, Mail, Key, Edit3, Eye, EyeOff, ShieldCheck, ShieldAlert, Loader2, ArrowLeft } from 'lucide-react'; // ArrowLeft já importado
import * as authService from '../../services/authService';
import { VerifiedProfileUpdateRequest, User } from '../../types/auth';
import { useLocation, useNavigate } from 'react-router-dom';

const verifyKeywordSchema = z.object({
  palavraChaveAtual: z.string().min(1, "Palavra-chave atual é obrigatória."),
});
type VerifyKeywordFormData = z.infer<typeof verifyKeywordSchema>;

const updateDetailsSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.'),
  email: z.string().email('O email fornecido é inválido.'),
  novaPalavraChave: z.string().optional(),
  confirmarNovaPalavraChave: z.string().optional(),
}).superRefine((data, ctx) => {
  const temNovaPalavraChave = data.novaPalavraChave && data.novaPalavraChave.trim() !== '';
  const temConfirmarNovaPalavraChave = data.confirmarNovaPalavraChave && data.confirmarNovaPalavraChave.trim() !== '';

  if (temNovaPalavraChave) {
    if (data.novaPalavraChave.length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nova palavra-chave deve ter no mínimo 4 caracteres.',
        path: ['novaPalavraChave'],
      });
    }
    if (data.novaPalavraChave !== data.confirmarNovaPalavraChave) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'As novas palavras-chave não coincidem.',
        path: ['confirmarNovaPalavraChave'],
      });
    }
  } else if (temConfirmarNovaPalavraChave && !temNovaPalavraChave) {
    ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nova palavra-chave é obrigatória se a confirmação for preenchida.',
        path: ['novaPalavraChave'],
      });
  }
});
type UpdateDetailsFormData = z.infer<typeof updateDetailsSchema>;


const ProfilePage: React.FC = () => {
  const { user, isLoading: authContextLoading, error: authContextError, clearError, setAuthUserData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isKeywordVerified, setIsKeywordVerified] = useState(false);
  const [isVerifyingKeyword, setIsVerifyingKeyword] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);
  const [detailsUpdateError, setDetailsUpdateError] = useState<string | null>(null);

  const [showPalavraChaveAtual, setShowPalavraChaveAtual] = useState(false);
  const [showNovaPalavraChave, setShowNovaPalavraChave] = useState(false);
  const [showConfirmarNovaPalavraChave, setShowConfirmarNovaPalavraChave] = useState(false);

  const verificationForm = useForm<VerifyKeywordFormData>({
    resolver: zodResolver(verifyKeywordSchema),
    defaultValues: { palavraChaveAtual: '' },
  });

  const updateDetailsForm = useForm<UpdateDetailsFormData>({
    resolver: zodResolver(updateDetailsSchema),
    defaultValues: {
      nome: user?.nome || '',
      email: user?.email || '',
      novaPalavraChave: '',
      confirmarNovaPalavraChave: '',
    },
  });

  useEffect(() => {
    const routeState = location.state as { defaultTab?: string };
    if (routeState?.defaultTab) {
      navigate(location.pathname, { replace: true, state: {} });
    }

    if (user) {
      updateDetailsForm.reset({
        nome: user.nome,
        email: user.email,
        novaPalavraChave: '',
        confirmarNovaPalavraChave: '',
      });
    }
  }, [user, isKeywordVerified, updateDetailsForm, location.state, location.pathname, navigate]);

  const handleKeywordVerification = async (data: VerifyKeywordFormData) => {
    if (!user?.email) {
      setVerificationError("Email do usuário não encontrado. Por favor, recarregue a página.");
      return;
    }
    setIsVerifyingKeyword(true);
    setVerificationError(null);
    clearError();
    try {
      await authService.verifyEmailAndKeyword({ email: user.email, palavraChave: data.palavraChaveAtual });
      setIsKeywordVerified(true);
      setDetailsUpdateError(null);
    } catch (err: any) {
      console.error("Erro na verificação da palavra-chave (Perfil):", err.response?.data || err.message);
      const backendMessage = err.response?.data?.mensagem || err.response?.data?.message;
      if (backendMessage === "Email ou palavra-chave incorretos") {
        setVerificationError("A palavra-chave atual fornecida está incorreta. Verifique e tente novamente.");
      } else {
        setVerificationError(backendMessage || "Ocorreu um erro ao verificar a palavra-chave. Tente novamente.");
      }
      setIsKeywordVerified(false);
    } finally {
      setIsVerifyingKeyword(false);
    }
  };

  const handleDetailsUpdate = async (data: UpdateDetailsFormData) => {
    if (!user) {
      setDetailsUpdateError("Usuário não autenticado. Por favor, faça login novamente.");
      return;
    }

    setIsUpdatingDetails(true);
    setDetailsUpdateError(null);
    clearError();

    const payload: VerifiedProfileUpdateRequest = {};
    let hasChanges = false;

    if (data.nome.trim() !== user.nome) {
      payload.nome = data.nome.trim();
      hasChanges = true;
    }
    if (data.email.trim().toLowerCase() !== user.email.toLowerCase()) {
      payload.email = data.email.trim();
      hasChanges = true;
    }
    if (data.novaPalavraChave && data.novaPalavraChave.trim() !== '') {
      payload.novaPalavraChave = data.novaPalavraChave.trim();
      hasChanges = true;
    }

    if (!hasChanges) {
      setDetailsUpdateError("Nenhuma alteração detectada. Modifique o nome, email ou forneça uma nova palavra-chave.");
      setIsUpdatingDetails(false);
      return;
    }

    try {
      const response = await authService.updateVerifiedProfileDetails(payload);

      if (response && response.adminData) {
        setAuthUserData(response.adminData);
        navigate('/painel-de-controle', {
          state: {
            profileUpdateSuccess: true,
            message: 'Seus dados foram atualizados com sucesso!'
          },
          replace: true
        });
      } else {
          console.error("handleDetailsUpdate: Resposta da API não continha adminData:", response);
        setDetailsUpdateError("Resposta inesperada do servidor ao atualizar.");
      }

    } catch (err: any) {
      console.error("ERRO em handleDetailsUpdate (ProfilePage):", err.response?.data || err.message || err);
      setDetailsUpdateError(err.response?.data?.mensagem || err.response?.data?.message || 'Erro ao atualizar os dados.');
    } finally {
      setIsUpdatingDetails(false);
    }
  };

  const toggleShow = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(prev => !prev);
  };

  if (authContextLoading && !user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
            <div className="text-center">
                <Loader2 className="h-10 w-10 text-primary-600 animate-spin mx-auto" />
                <p className="mt-4 text-neutral-600">Carregando dados do perfil...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="container-medium py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Meu Perfil e Configurações</h1>

      {!isKeywordVerified ? (
        <Card>
          <div className="text-center mb-4">
            <ShieldAlert className="h-12 w-12 text-primary-500 mx-auto mb-2" />
            <h2 className="text-lg font-semibold text-neutral-800">Verificar Identidade</h2>
            <p className="text-neutral-600 text-sm">Para alterar seus dados (nome, email ou palavra-chave), por favor, insira sua palavra-chave atual.</p>
          </div>
          {verificationError && (
            <Alert type="error" message={verificationError} className="mb-4" onClose={() => setVerificationError(null)} />
          )}
          {authContextError && !verificationError && (
             <Alert type="error" message={authContextError} className="mb-4" onClose={clearError} />
          )}
          <form onSubmit={verificationForm.handleSubmit(handleKeywordVerification)}>
            <Input
              label="Palavra-Chave Atual"
              type={showPalavraChaveAtual ? "text" : "password"}
              placeholder="Sua palavra-chave atual"
              leftAddon={<Key className="h-5 w-5" />}
              rightAddon={
                <button type="button" onClick={() => toggleShow(setShowPalavraChaveAtual)} className="focus:outline-none p-1">
                  {showPalavraChaveAtual ? <EyeOff className="h-5 w-5 text-neutral-500" /> : <Eye className="h-5 w-5 text-neutral-500" />}
                </button>
              }
              {...verificationForm.register('palavraChaveAtual')}
              error={verificationForm.formState.errors.palavraChaveAtual?.message}
            />
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                className="w-full sm:w-auto"
                disabled={isVerifyingKeyword || authContextLoading}
              >
                Voltar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isVerifyingKeyword || authContextLoading}
                leftIcon={<ShieldCheck className="h-4 w-4" />}
                className="w-full sm:w-auto"
              >
                Verificar Palavra-Chave
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-semibold text-neutral-800">Atualizar Dados Pessoais e Palavra-Chave</h2>
          </div>
            <div className="p-3 mb-4 bg-success-50 border border-success-200 rounded-md text-success-700 text-sm flex items-center">
            <ShieldCheck className="h-5 w-5 inline mr-2 flex-shrink-0" />
            Identidade verificada. Você pode alterar seus dados abaixo.
          </div>

          {detailsUpdateError && (
            <Alert type="error" message={detailsUpdateError} className="mb-4" onClose={() => setDetailsUpdateError(null)} />
          )}
            {authContextError && !detailsUpdateError && (
             <Alert type="error" message={authContextError} className="mb-4" onClose={clearError} />
            )}

          <form onSubmit={updateDetailsForm.handleSubmit(handleDetailsUpdate)}>
            <div className="space-y-4">
              <h3 className="text-md font-medium text-neutral-700 pt-2">Dados Pessoais</h3>
              <Input
                label="Nome Completo"
                leftAddon={<UserIcon className="h-5 w-5" />}
                {...updateDetailsForm.register('nome')}
                error={updateDetailsForm.formState.errors.nome?.message}
              />
              <Input
                label="Email"
                type="email"
                leftAddon={<Mail className="h-5 w-5" />}
                {...updateDetailsForm.register('email')}
                error={updateDetailsForm.formState.errors.email?.message}
              />

              <h3 className="text-md font-medium text-neutral-700 border-t pt-4 mt-6">Alterar Palavra-Chave (Opcional)</h3>
              <p className="text-xs text-neutral-500 -mt-3 mb-2">Deixe os campos abaixo em branco se não desejar alterar sua palavra-chave de recuperação.</p>

              <Input
                label="Nova Palavra-Chave"
                type={showNovaPalavraChave ? "text" : "password"}
                placeholder="Nova palavra-chave (mín. 4 caracteres)"
                leftAddon={<Key className="h-5 w-5" />}
                rightAddon={
                  <button type="button" onClick={() => toggleShow(setShowNovaPalavraChave)} className="focus:outline-none p-1">
                    {showNovaPalavraChave ? <EyeOff className="h-5 w-5 text-neutral-500" /> : <Eye className="h-5 w-5 text-neutral-500" />}
                  </button>
                }
                {...updateDetailsForm.register('novaPalavraChave')}
                error={updateDetailsForm.formState.errors.novaPalavraChave?.message}
              />
              <Input
                label="Confirmar Nova Palavra-Chave"
                type={showConfirmarNovaPalavraChave ? "text" : "password"}
                placeholder="Confirme se digitou uma nova palavra-chave"
                leftAddon={<Key className="h-5 w-5" />}
                rightAddon={
                  <button type="button" onClick={() => toggleShow(setShowConfirmarNovaPalavraChave)} className="focus:outline-none p-1">
                    {showConfirmarNovaPalavraChave ? <EyeOff className="h-5 w-5 text-neutral-500" /> : <Eye className="h-5 w-5 text-neutral-500" />}
                  </button>
                }
                {...updateDetailsForm.register('confirmarNovaPalavraChave')}
                error={updateDetailsForm.formState.errors.confirmarNovaPalavraChave?.message}
              />
            </div>
            {/* Container dos botões para o formulário de atualização */}
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                className="w-full sm:w-auto"
                disabled={isUpdatingDetails || authContextLoading}
              >
                Voltar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdatingDetails || authContextLoading}
                leftIcon={<Edit3 className="h-4 w-4" />}
                className="w-full sm:w-auto"
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;