import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { User, Mail, Key, CheckCircle } from 'lucide-react';
import * as authService from '../../services/authService';

// Validador de CPF
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

// Schema de validação de dados do perfil
const profileSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().refine(validarCPF, { message: 'CPF inválido' }),
});

// Schema de validação para alteração de senha
const passwordSchema = z.object({
  senhaAtual: z.string().min(1, 'A senha atual é obrigatória'),
  novaSenha: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string().min(6, 'A confirmação de senha deve ter pelo menos 6 caracteres'),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateProfile, isLoading, error, clearError } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'perfil' | 'senha'>('perfil');
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState<string | null>(null);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  
  // Form para dados do perfil
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: user?.nome || '',
      email: user?.email || '',
      cpf: user?.cpf || '',
    },
  });
  
  // Form para alteração de senha
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: '',
    },
  });
  
  // Atualiza o form quando o usuário é carregado
  React.useEffect(() => {
    if (user) {
      profileForm.reset({
        nome: user.nome,
        email: user.email,
        cpf: user.cpf,
      });
    }
  }, [user, profileForm]);
  
  // Handle profile update
  const handleUpdateProfile = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      setProfileUpdateSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setProfileUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };
  
  // Handle password change
  const handleChangePassword = async (data: PasswordFormData) => {
    try {
      await authService.changePassword(data.senhaAtual, data.novaSenha);
      setPasswordUpdateSuccess(true);
      setPasswordUpdateError(null);
      passwordForm.reset();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setPasswordUpdateSuccess(false);
      }, 3000);
    } catch (error: any) {
      setPasswordUpdateError(
        error.response?.data?.message || 'Erro ao alterar senha'
      );
    }
  };
  
  return (
    <div className="container-medium">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Meu Perfil</h1>
      
      <div className="mb-6">
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex space-x-6">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'perfil'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
              onClick={() => setActiveTab('perfil')}
            >
              Dados Pessoais
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'senha'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
              onClick={() => setActiveTab('senha')}
            >
              Alterar Senha
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'perfil' && (
        <Card>
          {profileUpdateSuccess && (
            <Alert
              type="success"
              title="Perfil atualizado!"
              message="Seus dados foram atualizados com sucesso."
              className="mb-4"
            />
          )}
          
          {error && (
            <Alert
              type="error"
              message={error}
              className="mb-4"
              onClose={clearError}
            />
          )}
          
          <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)}>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Nome Completo"
                placeholder="Nome completo"
                leftAddon={<User className="h-5 w-5" />}
                {...profileForm.register('nome')}
                error={profileForm.formState.errors.nome?.message}
              />
              
              <Input
                label="Email"
                type="email"
                placeholder="email@exemplo.com"
                leftAddon={<Mail className="h-5 w-5" />}
                {...profileForm.register('email')}
                error={profileForm.formState.errors.email?.message}
              />
              
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                helperText="Digite apenas os números"
                {...profileForm.register('cpf')}
                error={profileForm.formState.errors.cpf?.message}
              />
            </div>
            
            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={<CheckCircle className="h-4 w-4" />}
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {activeTab === 'senha' && (
        <Card>
          {passwordUpdateSuccess && (
            <Alert
              type="success"
              title="Senha alterada!"
              message="Sua senha foi alterada com sucesso."
              className="mb-4"
            />
          )}
          
          {passwordUpdateError && (
            <Alert
              type="error"
              message={passwordUpdateError}
              className="mb-4"
              onClose={() => setPasswordUpdateError(null)}
            />
          )}
          
          <form onSubmit={passwordForm.handleSubmit(handleChangePassword)}>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Senha Atual"
                type="password"
                placeholder="Digite sua senha atual"
                leftAddon={<Key className="h-5 w-5" />}
                {...passwordForm.register('senhaAtual')}
                error={passwordForm.formState.errors.senhaAtual?.message}
              />
              
              <Input
                label="Nova Senha"
                type="password"
                placeholder="Digite sua nova senha"
                leftAddon={<Key className="h-5 w-5" />}
                helperText="Mínimo de 6 caracteres"
                {...passwordForm.register('novaSenha')}
                error={passwordForm.formState.errors.novaSenha?.message}
              />
              
              <Input
                label="Confirmar Nova Senha"
                type="password"
                placeholder="Confirme sua nova senha"
                leftAddon={<Key className="h-5 w-5" />}
                {...passwordForm.register('confirmarSenha')}
                error={passwordForm.formState.errors.confirmarSenha?.message}
              />
            </div>
            
            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={<Key className="h-4 w-4" />}
              >
                Alterar Senha
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;