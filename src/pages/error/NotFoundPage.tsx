import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSearch } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();

  const handleVoltarParaLogin = () => {
    if (isAuthenticated) {
      logout(); 
    }
    navigate('/login');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto px-4">
        <FileSearch className="h-16 w-16 text-primary-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Página não encontrada</h1>
        <p className="text-lg text-neutral-600 mb-8">
          Você não tem a permissão necessária para a Página.
        </p>
        <Button
          variant="primary"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={handleVoltarParaLogin} 
        >
          Ir para Login
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;