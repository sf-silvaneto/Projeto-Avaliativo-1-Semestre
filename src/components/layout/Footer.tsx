import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="container-wide py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center">
              <FileText className="h-6 w-6 text-primary-600" />
              <span className="ml-2 text-lg font-semibold text-neutral-900">Clínica HM</span>
            </Link>
            <p className="mt-3 text-sm text-neutral-600">
              Sistema de Prontuários Eletrônicos para profissionais.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              Links Úteis
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/termos" className="text-sm text-neutral-600 hover:text-primary-600">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-sm text-neutral-600 hover:text-primary-600">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              Contato
            </h3>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-neutral-600">
                Email: contato@hm.com
              </li>
              <li className="text-sm text-neutral-600">
                Telefone: (84) 90000-0000
              </li>
              <li className="text-sm text-neutral-600">
                Horário: Segunda a Sexta, 09:00 às 18:00
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-neutral-500">
            &copy; {currentYear} Clínica HM. Todos os direitos reservados.
          </p>
          <p className="mt-2 md:mt-0 text-sm text-neutral-500 flex items-center">
            Feito com <Heart className="h-4 w-4 text-error-500 mx-1" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;