import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LogOut, 
  Menu, 
  User, 
  FileText, 
  Users,
  Stethoscope,
  ClipboardList
} from 'lucide-react';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setProfileMenuOpen(false); 
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
    setMobileMenuOpen(false); 
  };

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const menuItems = [
    { label: 'Meu Perfil', path: '/perfil', icon: <User className="h-4 w-4 mr-2" /> },
    { label: 'Gerenciar Prontuários', path: '/prontuarios', icon: <ClipboardList className="h-4 w-4 mr-2" /> },
    { label: 'Gerenciar Médicos', path: '/medicos', icon: <Stethoscope className="h-4 w-4 mr-2" /> },
    { label: 'Gerenciar Pacientes', path: '/pacientes', icon: <Users className="h-4 w-4 mr-2" /> },
  ];

  return (
    <header className="bg-white shadow-soft sticky top-0 z-50">
      <div className="container-wide py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-semibold text-neutral-900">Clínica HM</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>

                <div className="relative" ref={profileMenuRef}>
                  <button 
                    onClick={toggleProfileMenu}
                    className="flex items-center text-neutral-700 hover:text-primary-600 focus:outline-none"
                    aria-expanded={profileMenuOpen}
                    aria-haspopup="true"
                    id="user-menu-button"
                  >
                    <span className="mr-1">{user?.nome}</span>
                    <User className="h-4 w-4" />
                  </button>
                  {profileMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-20 animate-fade-in"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      {menuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-primary-600"
                          role="menuitem"
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      ))}
                      <hr className="my-1 border-neutral-200" /> {}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-primary-600"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </button>
                    </div>
                  )}
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

          <button
            className="md:hidden text-neutral-700 hover:text-primary-600 focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Menu Principal"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 py-3 border-t border-neutral-200 animate-slide-down">
            {isAuthenticated ? (
              <>
                {menuItems.map((item) => (
                  <Link
                    key={`mobile-${item.path}`}
                    to={item.path}
                    className="flex items-center py-2 text-neutral-700 hover:text-primary-600"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                <hr className="my-1 border-neutral-200" />
                <button
                  onClick={() => {
                    handleLogout(); 
                    setMobileMenuOpen(false);
                  }}
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