import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthForm from '../../components/auth/AuthForm';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { FileText } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/prontuarios';
  
  const [sessionExpired, setSessionExpired] = useState(false);
  
  // Check if session expired from query param
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('session') === 'expired') {
      setSessionExpired(true);
    }
  }, [location]);
  
  const handleLogin = async (data: { email: string; senha: string }) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };
  
  const dismissSessionAlert = () => {
    setSessionExpired(false);
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };
  
  return (
    <div className="container-tight py-8">
      {sessionExpired && (
        <Alert
          type="warning"
          title="Sessão expirada"
          message="Sua sessão expirou. Por favor, faça login novamente."
          className="mb-6"
          onClose={dismissSessionAlert}
        />
      )}
      
      <div className="text-center mb-8">
        <div className="flex justify-center">
          <FileText className="h-12 w-12 text-primary-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">Acesse sua conta</h1>
        <p className="mt-2 text-neutral-600">
          Entre para acessar o sistema de prontuários da HM Psicoterapia
        </p>
      </div>
      
      <Card>
        <AuthForm
          type="login"
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={error}
        />
      </Card>
      
      <div className="mt-6 text-center">
        <p className="text-neutral-600">
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="font-medium text-primary-600 hover:text-primary-700">
            Cadastre-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;