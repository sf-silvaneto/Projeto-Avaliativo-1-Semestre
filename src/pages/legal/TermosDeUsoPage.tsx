import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const TermosDeUsoPage: React.FC = () => {
  return (
    <div className="container-medium py-8">
      <Card>
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">Termos e Condições de Uso</h1>
        <p className="text-sm text-neutral-500 mb-6"><strong>Última atualização:</strong> 30 de maio de 2025</p>

        <section className="mb-6">
          <p className="mb-3">
            Por favor, leia estes Termos e Condições de Uso cuidadosamente antes de usar o sistema de prontuários eletrônicos operado pela Clínica HM.
          </p>
          <p className="mb-3">
            Seu acesso e uso do Serviço estão condicionados à sua aceitação e conformidade com estes Termos. Estes Termos se aplicam a todos os colaboradores e outros que acessam ou usam o Serviço. Ao acessar ou usar o Serviço, você concorda em ficar vinculado por estes Termos. Se você discordar de qualquer parte dos termos, então você não pode acessar o Serviço.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">1. Definições</h2>
          <ul className="list-disc list-inside ml-4 space-y-1 text-neutral-700">
            <li><strong>Sistema/Serviço:</strong> Refere-se à plataforma de prontuários eletrônicos Clínica HM.</li>
            <li><strong>Usuário:</strong> Refere-se ao profissional de saúde (psicólogo, terapeuta, médico) autorizado a utilizar o Sistema.</li>
            <li><strong>Dados do Paciente:</strong> Informações pessoais e de saúde de pacientes inseridas no Sistema.</li>
            <li><strong>Conteúdo:</strong> Todo o software, texto, imagens, áudio, vídeo, dados ou outras informações no Sistema.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">2. Elegibilidade e Registro de Conta</h2>
          <p className="mb-3 text-neutral-700">
            Para usar o Serviço, você deve ser um profissional devidamente licenciado e em situação regular com seu respectivo conselho profissional. Ao se registrar, você concorda em fornecer informações verdadeiras, precisas, atuais e completas. Você é responsável por manter a confidencialidade de sua senha e conta, e é totalmente responsável por todas as atividades que ocorrem sob sua senha ou conta.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">3. Licença de Uso</h2>
          <p className="mb-3 text-neutral-700">
            Concedemos a você uma licença limitada, não exclusiva, intransferível e revogável para usar o Sistema estritamente de acordo com estes Termos e para os fins pretendidos de gerenciamento de prontuários eletrônicos. Você concorda em não usar o Sistema para qualquer outra finalidade.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">4. Responsabilidades do Usuário</h2>
           <ul className="list-disc list-inside ml-4 space-y-2 text-neutral-700">
            <li>Garantir a precisão e legalidade de todos os Dados do Paciente inseridos no Sistema.</li>
            <li>Obter todos os consentimentos necessários de seus pacientes para a coleta, uso e armazenamento de seus dados no Sistema, em conformidade com a LGPD e outras leis aplicáveis.</li>
            <li>Manter a segurança de suas credenciais de acesso.</li>
            <li>Usar o Sistema em conformidade com todas as leis, regulamentos e códigos de ética profissional aplicáveis.</li>
            <li>Não introduzir vírus, malware ou qualquer outro código malicioso no Sistema.</li>
            <li>Não tentar obter acesso não autorizado a partes do Sistema ou a dados de outros usuários.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">5. Confidencialidade e Segurança dos Dados do Paciente</h2>
          <p className="mb-3 text-neutral-700">
            Você reconhece que os Dados do Paciente são altamente confidenciais. A Clínica HM implementa medidas de segurança para proteger os dados (conforme detalhado em nossa Política de Privacidade), mas você, como Colaborador e controlador dos dados dos pacientes, é o principal responsável pela proteção e pelo uso ético e legal dessas informações dentro do Sistema.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">6. Propriedade Intelectual</h2>
          <p className="mb-3 text-neutral-700">
            O Serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão propriedade exclusiva da Clínica HM e seus licenciadores. O Serviço é protegido por direitos autorais, marcas registradas e outras leis do Brasil e de países estrangeiros.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">7. Suspensão e Rescisão</h2>
          <p className="mb-3 text-neutral-700">
            Podemos rescindir ou suspender seu acesso ao nosso Serviço imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos. Todas as disposições dos Termos que, por sua natureza, devam sobreviver à rescisão, sobreviverão à rescisão, incluindo, sem limitação, disposições de propriedade, isenções de garantia, indenização e limitações de responsabilidade.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">8. Isenção de Garantias e Limitação de Responsabilidade</h2>
          <p className="mb-3 text-neutral-700">
            O Serviço é fornecido "COMO ESTÁ" e "CONFORME DISPONÍVEL". O uso do Serviço é por sua conta e risco. Na máxima extensão permitida pela lei aplicável, a Clínica HM, suas afiliadas, diretores, funcionários, agentes, fornecedores ou licenciadores não serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, ágio, ou outras perdas intangíveis.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">9. Modificações dos Termos</h2>
          <p className="mb-3 text-neutral-700">
            Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes que quaisquer novos termos entrem em vigor. O que constitui uma alteração material será determinado a nosso exclusivo critério.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">10. Lei Aplicável e Foro</h2>
          <p className="mb-3 text-neutral-700">
            Estes Termos serão regidos e interpretados de acordo com as leis da República Federativa do Brasil. Fica eleito o foro da comarca de Mossoró-RN, Brasil, para dirimir quaisquer controvérsias decorrentes destes Termos.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">11. Contato</h2>
          <p className="mb-3 text-neutral-700">
            Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco: contato@hm.com
          </p>
        </section>

        <div className="mt-8 pt-6 border-t border-neutral-200">
          <Link to="/">
            <Button variant="secondary">Voltar para a Tela Inicial</Button>
          </Link>
        </div>
        
        <p className="mt-8 text-xs text-neutral-500 italic">
          Este documento é um modelo e deve ser revisado e adaptado por um profissional jurídico para atender às necessidades específicas da HM Psicoterapia e estar em conformidade com todas as leis e regulamentos aplicáveis.
        </p>
      </Card>
    </div>
  );
};

export default TermosDeUsoPage;