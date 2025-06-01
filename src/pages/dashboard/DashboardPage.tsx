import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { useAuth } from '../../context/AuthContext';
import { FileText, Users, Stethoscope, LogOut, UserCog } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.profileUpdateSuccess && location.state?.message) {
      setSuccessMessage(location.state.message);
      navigate(location.pathname, { state: {}, replace: true });
    }
  }, [location, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container-medium py-8">
      {successMessage && (
        <Alert
          type="success"
          title="Operação Realizada!"
          message={successMessage}
          className="mb-6"
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Painel de Controle</h1>
        {user && <p className="text-lg text-neutral-600">Bem-vindo(a), {user.nome}!</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/prontuarios" className="no-underline">
          <Card className="hover:shadow-medium transition-shadow duration-200 cursor-pointer">
            <div className="flex flex-col items-center text-center p-4">
              <FileText className="h-12 w-12 text-primary-600 mb-3" />
              <h2 className="text-xl font-semibold text-neutral-800">Gerenciar Prontuários</h2>
              <p className="text-neutral-600 text-sm">Acesse e gerencie os prontuários dos pacientes.</p>
            </div>
          </Card>
        </Link>

        <Link to="/perfil" className="no-underline flex">
           <Card className="hover:shadow-medium transition-shadow duration-200 cursor-pointer flex flex-col h-full w-full">
           <div className="flex flex-col items-center text-center p-4 flex-grow">
              <UserCog className="h-12 w-12 text-primary-600 mb-3" />
              <h2 className="text-xl font-semibold text-neutral-800">Meu Perfil</h2>
              <p className="text-neutral-600 text-sm">Altere seus dados e palavra-chave.</p>
            </div>
           </Card>
        </Link>

        <Link to="/medicos" className="no-underline">
           <Card className="hover:shadow-medium transition-shadow duration-200 cursor-pointer">
            <div className="flex flex-col items-center text-center p-4">
              <Stethoscope className="h-12 w-12 text-primary-600 mb-3" />
              <h2 className="text-xl font-semibold text-neutral-800">Gerenciar Médicos</h2>
              <p className="text-neutral-600 text-sm">Cadastre e administre os médicos da clínica.</p>
            </div>
          </Card>
        </Link>

        <Link to="/pacientes" className="no-underline">
           <Card className="hover:shadow-medium transition-shadow duration-200 cursor-pointer">
            <div className="flex flex-col items-center text-center p-4">
              <Users className="h-12 w-12 text-primary-600 mb-3" />
              <h2 className="text-xl font-semibold text-neutral-800">Gerenciar Pacientes</h2>
              <p className="text-neutral-600 text-sm">Visualize e gerencie os dados dos pacientes.</p>
            </div>
          </Card>
        </Link>
        
        <div onClick={handleLogout} className="cursor-pointer md:col-span-2">
           <Card className="hover:shadow-medium transition-shadow duration-200 bg-error-50 hover:bg-error-100">
            <div className="flex flex-col items-center text-center p-4">
              <LogOut className="h-12 w-12 text-error-600 mb-3" />
              <h2 className="text-xl font-semibold text-error-700">Sair</h2>
              <p className="text-neutral-600 text-sm">Voltar para a tela de login.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;