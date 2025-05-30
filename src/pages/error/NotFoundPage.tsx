import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { ArrowLeft, FileSearch } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext'; // Importar o hook useAuth

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate(); // Hook para navegação
  const { logout, isAuthenticated } = useAuth(); // Obter a função logout e o estado de autenticação

  const handleVoltarParaLogin = () => {
    if (isAuthenticated) { // Se o usuário estiver logado, deslogue
      logout(); 
    }
    navigate('/login'); // Redirecione para a página de login
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto px-4">
        <FileSearch className="h-16 w-16 text-primary-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Página não encontrada</h1>
        <p className="text-lg text-neutral-600 mb-8">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        {/* O Link foi removido. O Button agora usa onClick. */}
        <Button
          variant="primary"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={handleVoltarParaLogin} // Adicionado onClick para chamar a função
        >
          Ir para Login {/* Texto do botão atualizado */}
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;