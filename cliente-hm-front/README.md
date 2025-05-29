# HM Psicoterapia - Sistema de Prontuários Eletrônicos

Sistema completo para gerenciamento de prontuários eletrônicos para a clínica HM Psicoterapia, com foco em segurança, usabilidade e conformidade com a LGPD.

## Tecnologias Utilizadas

- **Frontend**: React 18.3.1 com TypeScript
- **Estilização**: Tailwind CSS 3.4.1
- **Gerenciamento de Estado**: Context API
- **Roteamento**: React Router 6.22.0
- **Validação de Formulários**: React Hook Form + Zod
- **Requisições HTTP**: Axios 1.6.2
- **Icons**: Lucide React 0.344.0

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
│   ├── auth/       # Componentes de autenticação
│   ├── layout/     # Componentes de layout (Header, Footer, etc)
│   ├── prontuario/ # Componentes relacionados a prontuários
│   └── ui/         # Componentes de UI base (Button, Input, etc)
├── context/        # Contextos React
├── pages/          # Componentes de páginas
│   ├── auth/       # Páginas de autenticação
│   ├── error/      # Páginas de erro
│   ├── home/       # Página inicial
│   ├── profile/    # Página de perfil
│   └── prontuario/ # Páginas de prontuários
├── routes/         # Componentes de roteamento (ProtectedRoute, PublicRoute)
├── services/       # Serviços de API
├── types/          # Tipos TypeScript
└── utils/          # Funções utilitárias
```

## Funcionalidades

### Autenticação
- Registro de usuário administrador (UC01)
- Login com autenticação JWT (UC02)
- Recuperação de senha
- Proteção de rotas

### Prontuários
- Busca avançada de prontuários com múltiplos filtros (UC03)
- Criação de prontuários com validação (UC04)
- Visualização detalhada de prontuários (UC05)
- Edição de prontuários (UC06)

### Administrador
- Atualização de dados cadastrais (UC07)
- Alteração de senha (UC08)

## Requisitos Não-Funcionais Implementados

- **Interface responsiva**: Design adaptativo para todas as telas (mobile, tablet, desktop)
- **Acessibilidade**: Seguindo padrões WCAG
- **Segurança**: Armazenamento seguro de tokens, proteção contra ataques XSS
- **Performance**: Carregamento rápido e otimizado
- **Usabilidade**: Interface intuitiva com feedback visual para ações

## Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/hm-psicoterapia-frontend.git
cd hm-psicoterapia-frontend
```

2. Instale as dependências
```bash
npm install
# ou
yarn
```

3. Crie um arquivo `.env` na raiz do projeto
```
VITE_API_URL=http://localhost:8080/api
```

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

5. Acesse o aplicativo em `http://localhost:5173`

## Exemplos de Requisições à API

### Login
```typescript
// POST /api/auth/login
const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

### Buscar Prontuários
```typescript
// GET /api/prontuarios
const buscarProntuarios = async (params: BuscaProntuarioParams) => {
  try {
    const response = await api.get('/prontuarios', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

### Criar Prontuário
```typescript
// POST /api/prontuarios
const criarProntuario = async (dados: NovoProntuarioRequest) => {
  try {
    const response = await api.post('/prontuarios', dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

## Convenções de Código

- **Nomenclatura**: camelCase para variáveis e funções; PascalCase para componentes e interfaces
- **Indentação**: 2 espaços
- **Componentes**: Um componente por arquivo
- **Tipos**: Interfaces TypeScript para todos os objetos
- **Estilização**: Classes Tailwind para estilização
- **Formulários**: React Hook Form com Zod para validação

## Próximos Passos

- Implementação de testes unitários e de integração
- Adição de funcionalidade de exportação de prontuários para PDF
- Implementação de sistema de notificações
- Suporte a múltiplos idiomas