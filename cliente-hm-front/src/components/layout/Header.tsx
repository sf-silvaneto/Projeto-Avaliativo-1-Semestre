import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, User, FileText } from 'lucide-react';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-soft">
      <div className="container-wide py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-semibold text-neutral-900">HM Psicoterapia</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/prontuarios" className="text-neutral-700 hover:text-primary-600">
                  Prontuários
                </Link>
                <div className="relative group">
                  <button className="flex items-center text-neutral-700 hover:text-primary-600">
                    <span className="mr-1">{user?.nome}</span>
                    <User className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block animate-fade-in">
                    <Link
                      to="/perfil"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      Meu Perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-neutral-700 hover:text-primary-600">
                  Entrar
                </Link>
                <Link to="/cadastro">
                  <Button variant="primary" size="sm">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-neutral-700 hover:text-primary-600"
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 py-3 border-t border-neutral-200 animate-slide-down">
            {isAuthenticated ? (
              <>
                <Link
                  to="/prontuarios"
                  className="block py-2 text-neutral-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Prontuários
                </Link>
                <Link
                  to="/perfil"
                  className="block py-2 text-neutral-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Meu Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full py-2 text-neutral-700 hover:text-primary-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-neutral-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="block py-2 text-neutral-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cadastrar
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;