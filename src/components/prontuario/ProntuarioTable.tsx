import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye, Edit, FileText } from 'lucide-react';
import Button from '../ui/Button';
import { Prontuario } from '../../types/prontuario';

interface ProntuarioTableProps {
  prontuarios: Prontuario[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const ProntuarioTable: React.FC<ProntuarioTableProps> = ({
  prontuarios,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  isLoading = false,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const formatDate = (dataString?: string) => {
    if (!dataString) return '-';
     const dateToParse = /^\d{4}-\d{2}-\d{2}$/.test(dataString) ? `${dataString}T00:00:00Z` : dataString;
    const data = new Date(dateToParse);
    if (isNaN(data.getTime())) return '-';
    return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const formatDateTime = (dataString?: string) => {
    if (!dataString) return '-';
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return '-';
    return data.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Prontuário Nº
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Paciente
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Criado em
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Últ. Atualização
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-4 text-center text-neutral-500">Carregando...</td></tr>
            ) : prontuarios.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-4 text-center text-neutral-500">Nenhum prontuário encontrado.</td></tr>
            ) : (
              prontuarios.map((prontuario) => (
                <tr key={prontuario.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-neutral-400 mr-2 flex-shrink-0" />
                      <span className="text-neutral-900 font-medium">
                        {prontuario.numeroProntuario}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">{prontuario.paciente.nome}</div>
                    <div className="text-xs text-neutral-500">CPF: {prontuario.paciente.cpf}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                    {formatDate(prontuario.createdAt)} {/* ALTERADO DE prontuario.dataInicio */}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                    {formatDateTime(prontuario.dataUltimaAtualizacao)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/prontuarios/${prontuario.id}`}>
                        <Button variant="secondary" size="sm" leftIcon={<Eye className="h-4 w-4" />}>Ver</Button>
                      </Link>
                      <Link to={`/prontuarios/${prontuario.id}/editar`}>
                        <Button variant="primary" size="sm" leftIcon={<Edit className="h-4 w-4" />}>Editar</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-neutral-200 sm:px-6">
           <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{' '}
                de <span className="font-medium">{totalItems}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginação">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ChevronLeft className="h-5 w-5" /> <span className="sr-only">Voltar</span>
                </button>
                {Array.from({ length: totalPages > 5 ? 5 : totalPages }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                        pageNumber = i + 1;
                    } else {
                        if (currentPage <= 3) {
                            pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                        } else {
                            pageNumber = currentPage - 2 + i;
                        }
                    }
                    if (pageNumber > 0 && pageNumber <= totalPages) {
                         return (
                            <button
                              key={pageNumber}
                              onClick={() => onPageChange(pageNumber)}
                              aria-current={pageNumber === currentPage ? 'page' : undefined}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNumber === currentPage
                                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                  : 'bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                         );
                    }
                    return null;
                })}
                 {totalPages > 5 && currentPage < totalPages - 2 && <span className="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-700">...</span>}
                 {totalPages > 5 && currentPage < totalPages - 2 && (
                    <button onClick={() => onPageChange(totalPages)} className="relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50">{totalPages}</button>
                 )}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 disabled:pointer-events-none"
                >
                 <span className="sr-only">Próxima</span> <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProntuarioTable;