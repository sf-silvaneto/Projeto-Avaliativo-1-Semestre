import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthForm from '../../components/auth/AuthForm';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { FileText } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/prontuarios';
  
  const [sessionExpired, setSessionExpired] = useState(false); // Mantido como booleano
  const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState<string | null>(null);
  const [passwordResetSuccessMessage, setPasswordResetSuccessMessage] = useState<string | null>(null); // NOVO ESTADO

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let stateFromNavigation = location.state as any; // Para acessar o estado da navegação
    let shouldClearState = false;

    if (params.get('session') === 'expired') {
      setSessionExpired(true);
      // Limpa o query param da URL, mas preserva o location.state se existir
      navigate(location.pathname, { replace: true, state: stateFromNavigation || {} }); 
    }

    if (stateFromNavigation?.registrationSuccess) {
      setRegistrationSuccessMessage('Cadastro realizado com sucesso! Por favor, faça o login.');
      shouldClearState = true;
    }
    
    if (stateFromNavigation?.passwordResetSuccess && stateFromNavigation?.message) {
      setPasswordResetSuccessMessage(stateFromNavigation.message);
      shouldClearState = true;
    }

    if (shouldClearState) {
      // Limpa o estado da rota para não mostrar as mensagens novamente
      navigate(location.pathname, { state: {}, replace: true });
    }

  }, [location, navigate]);
  
  const handleLogin = async (data: { email: string; senha: string }) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Falha no componente LoginPage ao tentar fazer login:', err);
    }
  };
  
  const dismissSessionAlert = () => {
    setSessionExpired(false);
  };

  const dismissRegistrationSuccessAlert = () => {
     setRegistrationSuccessMessage(null);
  };

  const dismissPasswordResetSuccessAlert = () => { // Nova função para fechar o alerta
    setPasswordResetSuccessMessage(null);
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

      {registrationSuccessMessage && (
        <Alert
          type="success"
          title="Cadastro Concluído!"
          message={registrationSuccessMessage}
          className="mb-6"
          onClose={dismissRegistrationSuccessAlert}
        />
      )}

      {/* NOVO ALERT para mensagem de sucesso na redefinição de senha */}
      {passwordResetSuccessMessage && (
        <Alert
          type="success"
          title="Senha Redefinida!"
          message={passwordResetSuccessMessage}
          className="mb-6"
          onClose={dismissPasswordResetSuccessAlert} 
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