import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit2 as EditIcon, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { Paciente, Genero } from '../../types/paciente';

interface PacienteTableProps {
  pacientes: Paciente[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoadingAction: boolean;
  pacienteInAction: string | null;
}

const PacienteTable: React.FC<PacienteTableProps> = ({
  pacientes,
  onEdit,
  onDelete,
  isLoadingAction,
  pacienteInAction,
}) => {
  const formatData = (dataString?: string) => {
    if (!dataString) return '-';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
      const [year, month, day] = dataString.split('-');
      return `${day}/${month}/${year}`;
    }
    const date = new Date(dataString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR');
  };

  const renderGenero = (genero: Genero) => {
    if (!genero) return '-';
    return genero.charAt(0) + genero.slice(1).toLowerCase().replace(/_/g, " ");
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nome</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">CPF</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Data Nasc.</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Telefone</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {pacientes.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-neutral-500">
                Nenhum paciente encontrado.
              </td>
            </tr>
          ) : (
            pacientes.map((paciente) => (
              <tr key={paciente.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-neutral-900">{paciente.nome}</div>
                  <div className="text-xs text-neutral-500">{paciente.email}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">{paciente.cpf}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">{formatData(paciente.dataNascimento)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">{paciente.telefone}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => onEdit(paciente.id.toString())}
                      title="Editar Paciente"
                      className="p-1 text-primary-600 hover:text-primary-800"
                      disabled={isLoadingAction && pacienteInAction === paciente.id.toString()}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
export default PacienteTable;