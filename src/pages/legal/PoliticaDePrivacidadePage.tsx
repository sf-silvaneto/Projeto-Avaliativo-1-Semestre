import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PoliticaDePrivacidadePage: React.FC = () => {
  return (
    <div className="container-medium py-8">
      <Card>
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">Política de Privacidade</h1>
        <p className="text-sm text-neutral-500 mb-6"><strong>Última atualização:</strong> 30 de maio de 2025</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">1. Introdução</h2>
          <p className="mb-3 text-neutral-700">
            Esta Política de Privacidade descreve como a Clínica HM coleta, usa, armazena, compartilha e protege as informações pessoais de Profissionais de Saúde que utilizam nosso sistema de prontuários eletrônicos, bem como os dados de pacientes inseridos no Sistema. Estamos comprometidos em proteger a privacidade e garantir a conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e outras legislações aplicáveis.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">2. Definições Chave (LGPD)</h2>
          <ul className="list-disc list-inside ml-4 space-y-1 text-neutral-700">
            <li><strong>Dados Pessoais:</strong> Informação relacionada a pessoa natural identificada ou identificável.</li>
            <li><strong>Dados Pessoais Sensíveis:</strong> Dado pessoal sobre origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização de caráter religioso, filosófico ou político, dado referente à saúde ou à vida sexual, dado genético ou biométrico, quando vinculado a uma pessoa natural.</li>
            <li><strong>Controlador:</strong> Pessoa natural ou jurídica, de direito público ou privado, a quem competem as decisões referentes ao tratamento de dados pessoais. No contexto dos dados dos pacientes, o Usuário (profissional de saúde) é o Controlador.</li>
            <li><strong>Operador:</strong> Pessoa natural ou jurídica, de direito público ou privado, que realiza o tratamento de dados pessoais em nome do controlador. A HM Psicoterapia atua como Operadora em relação aos dados dos pacientes inseridos pelos Usuários.</li>
            <li><strong>Tratamento:</strong> Toda operação realizada com dados pessoais, como as que se referem a coleta, produção, recepção, classificação, utilização, acesso, reprodução, etc.</li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">3. Informações que Coletamos</h2>
          <p className="mb-2 text-neutral-700"><strong>3.1. Dos Usuários (Profissionais de Saúde):</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-neutral-700 mb-3">
            <li>Informações de Identificação e Contato: Nome completo, CPF, endereço de e-mail, número de telefone, registro profissional (CRP, CRM, etc.), endereço profissional.</li>
            <li>Informações de Acesso: Nome de usuário (email), senha (criptografada), palavra-chave de recuperação.</li>
            <li>Informações de Pagamento (se aplicável): Detalhes para processamento de assinaturas ou pagamentos pelo uso do Sistema.</li>
            <li>Logs de Uso: Endereço IP, tipo de navegador, sistema operacional, datas e horários de acesso, atividades realizadas no Sistema.</li>
          </ul>
          <p className="mb-2 text-neutral-700"><strong>3.2. Dos Pacientes (Inseridas pelos Usuários):</strong></p>
          <p className="mb-3 text-neutral-700">A Clínica HM, como Operadora, processa os dados pessoais e dados pessoais sensíveis dos pacientes que os Usuários (Controladores) inserem no Sistema. Isso pode incluir, mas não se limita a:</p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-neutral-700">
            <li>Dados de Identificação: Nome completo, data de nascimento, CPF, gênero, informações de contato (telefone, email), endereço.</li>
            <li>Dados de Saúde e Prontuário: Histórico médico, diagnósticos, planos de tratamento, anotações de sessões terapêuticas, medicações prescritas, resultados de exames, e qualquer outra informação relevante para o acompanhamento psicoterapêutico.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">4. Bases Legais e Finalidades do Tratamento</h2>
          <p className="mb-2 text-neutral-700"><strong>4.1. Para os Usuários (Profissionais de Saúde):</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-neutral-700">
            <li>Execução de Contrato: Para fornecer e gerenciar o acesso ao Sistema, processar registros e pagamentos (Art. 7º, V, LGPD).</li>
            <li>Cumprimento de Obrigação Legal ou Regulatória (Art. 7º, II, LGPD).</li>
            <li>Legítimo Interesse: Para melhorar o Sistema, segurança, comunicação sobre o serviço (Art. 7º, IX, LGPD).</li>
          </ul>
          <p className="mb-2 mt-3 text-neutral-700"><strong>4.2. Para os Pacientes (Dados inseridos pelos Usuários):</strong></p>
          <p className="mb-3 text-neutral-700">
            A Clínica HM trata os dados dos pacientes como Operadora, sob as instruções dos Usuários (Controladores). As bases legais para o tratamento dos dados dos pacientes são de responsabilidade do Usuário e geralmente incluem:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-neutral-700">
            <li>Consentimento do Titular (paciente ou responsável legal) (Art. 7º, I e Art. 11, I, LGPD).</li>
            <li>Tutela da Saúde, exclusivamente, em procedimento realizado por profissionais de saúde, serviços de saúde ou autoridade sanitária (Art. 7º, VIII e Art. 11, II, f, LGPD).</li>
          </ul>
          <p className="mt-2 mb-3 text-neutral-700">
            A finalidade do tratamento dos dados dos pacientes é exclusivamente permitir que o Usuário realize a gestão de prontuários eletrônicos para fins de acompanhamento terapêutico.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">5. Compartilhamento de Dados Pessoais</h2>
          <p className="mb-3 text-neutral-700">
            Não vendemos dados pessoais. Podemos compartilhar informações com:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-neutral-700">
            <li>Provedores de Serviços Terceirizados (Operadores): Empresas que nos auxiliam na operação do Sistema (ex: hospedagem em nuvem, processamento de pagamentos), sob estritas obrigações contratuais de confidencialidade e segurança.</li>
            <li>Autoridades Legais: Se exigido por lei, ordem judicial ou para proteger nossos direitos.</li>
            <li>Em caso de Transações Societárias: Em fusões, aquisições ou venda de ativos, com a devida notificação.</li>
          </ul>
          <p className="mt-2 mb-3 text-neutral-700">
            Os Usuários são responsáveis por qualquer compartilhamento de dados de pacientes que realizem fora do Sistema.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">6. Segurança dos Dados</h2>
          <p className="mb-3 text-neutral-700">
            Empregamos medidas técnicas e administrativas para proteger os dados pessoais e dados sensíveis contra acessos não autorizados, perda, alteração, comunicação ou qualquer forma de tratamento inadequado ou ilícito. Isso inclui criptografia de dados em trânsito e em repouso, controles de acesso rigorosos, backups regulares e outras práticas de segurança.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">7. Direitos dos Titulares (LGPD)</h2>
          <p className="mb-3 text-neutral-700">
            Garantimos aos titulares dos dados (Usuários e seus Pacientes) o exercício de seus direitos previstos na LGPD.
          </p>
          <p className="mb-2 text-neutral-700"><strong>Para Usuários do Sistema:</strong> Você pode acessar, corrigir ou solicitar a exclusão de seus dados de conta entrando em contato conosco.</p>
          <p className="mb-3 text-neutral-700"><strong>Para Pacientes:</strong> Os pacientes devem direcionar suas solicitações de direitos (acesso, correção, exclusão, etc.) diretamente ao profissional de saúde (Usuário do Sistema) que é o Controlador de seus dados. Auxiliaremos os Usuários a responderem a tais solicitações, conforme nossas obrigações como Operadora.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">8. Retenção de Dados</h2>
          <p className="mb-3 text-neutral-700">
            Os dados pessoais dos Usuários serão mantidos enquanto a conta estiver ativa e conforme necessário para cumprir nossas obrigações legais. Os dados dos pacientes serão mantidos no Sistema conforme as instruções e políticas de retenção do Usuário (Controlador), respeitando os prazos legais e regulatórios aplicáveis à guarda de prontuários.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">9. Cookies</h2>
          <p className="mb-3 text-neutral-700">
            Podemos usar cookies essenciais para o funcionamento do Sistema (ex: gerenciamento de sessão). Não utilizamos cookies para rastreamento publicitário.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">10. Alterações nesta Política</h2>
          <p className="mb-3 text-neutral-700">
            Podemos atualizar esta Política de Privacidade periodicamente. Publicaremos quaisquer alterações nesta página com uma nova data de "última atualização".
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">11. Encarregado de Proteção de Dados (DPO)</h2>
          <p className="mb-3 text-neutral-700">
            Para questões relacionadas a esta Política de Privacidade ou ao tratamento de seus dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do email: contato@hm.com
          </p>
        </section>

        <div className="mt-8 pt-6 border-t border-neutral-200">
          <Link to="/">
            <Button variant="secondary">Voltar para a Tela Inicial</Button>
          </Link>
        </div>

        <p className="mt-8 text-xs text-neutral-500 italic">
          Este documento é um modelo e deve ser revisado e adaptado por um profissional jurídico para atender às necessidades específicas da Clínica HM e estar em conformidade com todas as leis e regulamentos aplicáveis, especialmente a LGPD.
        </p>
      </Card>
    </div>
  );
};

export default PoliticaDePrivacidadePage;