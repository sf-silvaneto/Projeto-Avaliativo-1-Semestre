import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button'; // Se for usar Button em algum lugar
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { FileText, Users, Stethoscope, LogOut, UserCog } from 'lucide-react'; // Adicionado UserCog

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container-medium py-8">
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

        {/* Link para Atualizar Cadastro - direciona para /perfil com estado */}
        <Link to="/perfil" state={{ defaultTab: "atualizarCadastro" }} className="no-underline">
          <Card className="hover:shadow-medium transition-shadow duration-200 cursor-pointer">
            <div className="flex flex-col items-center text-center p-4">
              <UserCog className="h-12 w-12 text-primary-600 mb-3" />
              <h2 className="text-xl font-semibold text-neutral-800">Atualizar Cadastro</h2>
              <p className="text-neutral-600 text-sm">Altere seu nome ou palavra-chave.</p>
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
        
        <div onClick={handleLogout} className="cursor-pointer md:col-span-2"> {/* Opcional: Fazer o Sair ocupar duas colunas em telas médias */}
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