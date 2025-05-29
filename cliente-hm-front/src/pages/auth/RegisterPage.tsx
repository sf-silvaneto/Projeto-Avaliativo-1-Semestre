import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthForm from '../../components/auth/AuthForm';
import Card from '../../components/ui/Card';
import { FileText, Lock } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  
  const handleRegister = async (data: {
    nome: string;
    email: string;
    cpf: string;
    senha: string;
    confirmarSenha: string;
  }) => {
    try {
      await register(data);
      navigate('/prontuarios');
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
    }
  };
  
  return (
    <div className="container-tight py-8">
      <div className="text-center mb-8">
        <div className="flex justify-center">
          <FileText className="h-12 w-12 text-primary-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">Crie sua conta</h1>
        <p className="mt-2 text-neutral-600">
          Cadastre-se para acessar o sistema de prontuários da HM Psicoterapia
        </p>
      </div>
      
      <Card>
        <AuthForm
          type="cadastro"
          onSubmit={handleRegister}
          isLoading={isLoading}
          error={error}
        />
      </Card>
      
      <div className="mt-6">
        <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <Lock className="h-5 w-5 text-primary-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-neutral-800">Privacidade e Segurança</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Seus dados pessoais estão protegidos de acordo com a Lei Geral de Proteção de Dados (LGPD).
                Utilizamos criptografia e medidas de segurança avançadas para proteger suas informações.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-neutral-600">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Faça login aqui
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;