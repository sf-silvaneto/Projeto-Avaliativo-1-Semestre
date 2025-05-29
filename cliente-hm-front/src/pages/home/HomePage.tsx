import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ListChecks, UserCheck, Lock, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">
              Sistema de Prontuários Eletrônicos HM Psicoterapia
            </h1>
            <p className="text-xl mb-8">
              Gerencie prontuários de pacientes com eficiência, segurança e conformidade com a LGPD.
            </p>
            {isAuthenticated ? (
              <Link to="/prontuarios">
                <Button
                  variant="secondary"
                  size="lg"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Acessar Prontuários
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login">
                  <Button
                    variant="secondary"
                    size="lg"
                  >
                    Fazer Login
                  </Button>
                </Link>
                <Link to="/cadastro">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-white text-primary-700 hover:bg-primary-50"
                  >
                    Criar Conta
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-center mb-12">Recursos do Sistema</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Prontuários Completos</h3>
              <p className="text-neutral-600">
                Registre histórico médico, medicações, exames e anotações em um único lugar, com acesso rápido e intuitivo.
              </p>
            </div>
            
            <div className="p-6 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                <ListChecks className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Busca Avançada</h3>
              <p className="text-neutral-600">
                Encontre rapidamente prontuários com filtros por nome, número, tipo de tratamento e status.
              </p>
            </div>
            
            <div className="p-6 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Segurança e Conformidade</h3>
              <p className="text-neutral-600">
                Dados protegidos com criptografia e controle de acesso em conformidade com a LGPD.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container-medium text-center">
          <h2 className="text-3xl font-bold mb-4">Comece a usar agora</h2>
          <p className="text-lg text-neutral-600 mb-8">
            Simplifique a gestão de prontuários e concentre-se no que realmente importa: seus pacientes.
          </p>
          
          {isAuthenticated ? (
            <Link to="/prontuarios">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Acessar Prontuários
              </Button>
            </Link>
          ) : (
            <Link to="/cadastro">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Criar Conta Gratuita
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;