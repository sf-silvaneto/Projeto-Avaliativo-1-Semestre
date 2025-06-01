// src/pages/prontuario/ProntuarioEditPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input'; // Usaremos inputs básicos
import Select from '../../components/ui/Select'; // Para selecionar médico/status
import { ArrowLeft, Save } from 'lucide-react';
import { buscarProntuarioPorId, atualizarDadosBasicosProntuario } from '../../services/prontuarioService';
import { Prontuario, StatusProntuario, Medico } from '../../types/prontuario';
import { buscarMedicos } from '../../services/medicoService'; // Para listar médicos
import { StatusMedico } from '../../types/medico'; // Para filtrar médicos ativos
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '../../components/ui/Card';

// Schema para edição básica do prontuário
const prontuarioEditSchema = z.object({
  medicoResponsavelId: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().positive("Médico responsável é obrigatório.").optional()
  ),
  status: z.nativeEnum(StatusProntuario, {errorMap: () => ({ message: "Selecione um status válido."})}).optional(),
  dataAltaAdministrativa: z.string().optional().nullable()
    .refine(val => !val || !isNaN(Date.parse(val)), { message: "Data de alta administrativa inválida." }),
  // Adicionar outros campos básicos que podem ser editados aqui
});

type ProntuarioEditFormData = z.infer<typeof prontuarioEditSchema>;

const ProntuarioEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [prontuario, setProntuario] = useState<Prontuario | null>(null);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProntuarioEditFormData>({
    resolver: zodResolver(prontuarioEditSchema),
  });
  
  useEffect(() => {
    const fetchDados = async () => {
      if (!id) {
        setError("ID do prontuário não fornecido.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const [prontuarioData, medicosData] = await Promise.all([
            buscarProntuarioPorId(id),
            buscarMedicos({ status: StatusMedico.ATIVO, tamanho: 200, pagina: 0 })
        ]);
        setProntuario(prontuarioData);
        setMedicos(medicosData.content);
        reset({
            medicoResponsavelId: prontuarioData.medicoResponsavel?.id,
            status: prontuarioData.status,
            dataAltaAdministrativa: prontuarioData.dataAltaAdministrativa ? prontuarioData.dataAltaAdministrativa.split('T')[0] : null,
        });
      } catch (err: any) {
        console.error('Erro ao buscar dados para edição:', err);
        setError(
          err.response?.data?.message || 'Erro ao buscar dados. Tente novamente.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDados();
  }, [id, reset]);
  
  const handleUpdateProntuario = async (data: ProntuarioEditFormData) => {
    if (!id || !prontuario) return;
    
    setIsSaving(true);
    setError(null);
    
    const payload: Partial<Pick<Prontuario, 'medicoResponsavel' | 'status' | 'dataAltaAdministrativa'>> = {};
    if (data.medicoResponsavelId) {
        const medicoSelecionado = medicos.find(m => m.id === data.medicoResponsavelId);
        if (medicoSelecionado) payload.medicoResponsavel = medicoSelecionado;
    }
    if (data.status) payload.status = data.status;
    if (data.dataAltaAdministrativa) payload.dataAltaAdministrativa = data.dataAltaAdministrativa;
    else if (data.dataAltaAdministrativa === '') payload.dataAltaAdministrativa = undefined; // Para limpar a data

    try {
      await atualizarDadosBasicosProntuario(id, payload);
      navigate(`/prontuarios/${id}`);
    } catch (err: any) {
      console.error('Erro ao atualizar prontuário:', err);
      setError(
        err.response?.data?.mensagem || 'Erro ao atualizar prontuário. Tente novamente.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const medicoOptions = medicos.map(m => ({ value: m.id.toString(), label: `${m.nomeCompleto} (CRM: ${m.crm})` }));
  const statusOptions = [
    // Apenas status que podem ser definidos administrativamente, se houver.
    // O status INTERNADO é definido pela internação, ARQUIVADO pela alta ou fim de outros eventos.
    // Talvez aqui só possa mudar para ARQUIVADO (alta administrativa) ou EM_ELABORACAO (se aplicável).
    // Vamos permitir a alteração para ARQUIVADO e EM_ELABORACAO por enquanto.
    { value: StatusProntuario.EM_ELABORACAO, label: "Em Elaboração" },
    { value: StatusProntuario.ARQUIVADO, label: "Arquivado (Administrativo)" },
    // Status INTERNADO não deve ser definido manualmente aqui.
  ];
  
  if (isLoading) { /* ... (loader como antes) ... */ }
  if (error && !prontuario) { /* ... (alert de erro como antes) ... */ }
  if (!prontuario) { /* ... (alert de não encontrado como antes) ... */ }
  
  return (
    <div className="container-medium py-8">
      <div className="flex items-center mb-6">
        <Link to={prontuario ? `/prontuarios/${prontuario.id}` : '/prontuarios'} className="text-neutral-500 hover:text-neutral-700 mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">
          Editar Prontuário #{prontuario?.numeroProntuario}
        </h1>
      </div>
      
      {error && (
        <Alert type="error" message={error} className="mb-6" onClose={() => setError(null)} />
      )}
      
      <Card>
        {prontuario ? (
            <form onSubmit={handleSubmit(handleUpdateProntuario)} className="space-y-6">
                <Controller
                    name="medicoResponsavelId"
                    control={control}
                    render={({ field }) => (
                        <Select
                        label="Médico Responsável Principal"
                        options={[{ value: "", label: "Selecione um médico"}, ...medicoOptions]}
                        value={String(field.value || "")}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        error={errors.medicoResponsavelId?.message}
                        />
                    )}
                />

                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Select
                        label="Status Administrativo do Prontuário"
                        options={[{ value: "", label: "Manter status atual"}, ...statusOptions.filter(s => s.value !== StatusProntuario.INTERNADO)]} // Não permitir setar INTERNADO manualmente
                        value={field.value || ""}
                        onChange={e => field.onChange(e.target.value as StatusProntuario || undefined)}
                        error={errors.status?.message}
                        helperText="Define um status administrativo. 'Internado' é automático."
                        />
                    )}
                />
                
                <Controller
                    name="dataAltaAdministrativa"
                    control={control}
                    render={({ field }) => (
                         <Input
                            label="Data de Arquivamento/Alta Administrativa (Opcional)"
                            type="date"
                            value={field.value || ''}
                            onChange={field.onChange}
                            error={errors.dataAltaAdministrativa?.message}
                        />
                    )}
                />

                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={() => navigate(prontuario ? `/prontuarios/${prontuario.id}` : '/prontuarios')} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isSaving} leftIcon={<Save size={18}/>}>
                        Salvar Alterações
                    </Button>
                </div>
            </form>
        ) : (
            <p>Carregando dados do prontuário...</p>
        )}
      </Card>
    </div>
  );
};

export default ProntuarioEditPage;