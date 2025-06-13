# Sistema de Controle de Ponto

Sistema completo para controle de ponto dos colaboradores, desenvolvido com React (SPA frontend) e Node.js (backend), utilizando PostgreSQL como banco de dados.

## 🚀 Funcionalidades

- Registro e login de colaboradores com autenticação JWT
- Dashboard responsivo (SPA) com timer de turno circular em tempo real
- Histórico de pontos do usuário autenticado, mostrando apenas os últimos 7 dias com registros reais
- Timer sincronizado com o backend: ao pausar, exibe o tempo total do dia até aquele momento
- Cada usuário vê apenas seus próprios registros
- Logout seguro
- Nome do colaborador exibido no dashboard
- Integração frontend-backend via API RESTful
- Testes automatizados (Jest)
- Docker para backend e banco de dados
- Código limpo, semântico e responsivo
- Padrão SOLID e boas práticas de arquitetura
- Feedback visual de erro/conexão no dashboard
- Botão para baixar relatório CSV bonito, com nome e e-mail do usuário

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** + **TypeScript**
- **Express**
- **PostgreSQL**
- **JWT** (jsonwebtoken)
- **bcryptjs** (hash de senha)
- **Jest** (testes)
- **ESLint & Prettier**
- **Docker**

### Frontend
- **React 18** + **TypeScript** (SPA)
- **Vite**
- **Tailwind CSS**
- **React Router**
- **Radix UI**
- **React Hook Form**
- **Zod**

Prototipagem: https://app.uizard.io/p/2187af7a

## 📋 Como funciona o fluxo do sistema

1. **Registro:**
   - O colaborador preenche nome, email e senha.
   - O frontend envia para `/api/auth/registro`.
   - O backend cria o usuário, retorna um token JWT e o frontend salva no localStorage.
   - O usuário é redirecionado para o dashboard.

2. **Login:**
   - O colaborador faz login com email e senha.
   - O backend valida, retorna o token JWT e o frontend salva no localStorage.
   - O usuário é redirecionado para o dashboard.

3. **Dashboard:**
   - Mostra o nome do colaborador e botão de logout.
   - Mostra o timer de turno circular (iniciar/parar), sincronizado em tempo real com o backend.
   - Mostra o histórico dos últimos 7 dias com registros reais do usuário autenticado.
   - Ao clicar em iniciar/parar turno, o frontend faz POST em `/api/ponto/registrar`.
   - O backend registra entrada/saída e calcula as horas trabalhadas.
   - O histórico é atualizado automaticamente a cada 10 segundos.
   - O timer exibe o tempo real do turno em andamento e, ao pausar, mostra o tempo total do dia.
   - Botão laranja permite baixar o relatório CSV do usuário.

4. **Logout:**
   - O botão de logout remove o token do localStorage e redireciona para a tela inicial.

## 🔒 Autenticação e Segurança
- Todas as rotas de ponto exigem token JWT no header `Authorization`.
- O backend valida o token e só retorna dados do usuário autenticado.
- O frontend protege as rotas do dashboard, redirecionando para login se não houver token.

## 🧩 Estrutura de Pastas e Arquivos Principais

```
ilumeo/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações globais e .env
│   │   ├── controllers/     # Lógica das rotas (AuthController, TimeRecordController)
│   │   ├── database/        # Conexão, migrações e seed do banco
│   │   ├── middleware/      # Middlewares (auth, validação)
│   │   ├── repositories/    # Camada de dados (UserRepository, TimeRecordRepository)
│   │   ├── routes/          # Definição das rotas (authRoutes, timeRecordRoutes, index)
│   │   ├── services/        # Lógica de negócio (AuthService, TimeRecordService)
│   │   ├── tests/           # Testes automatizados
│   │   ├── types/           # Tipos TypeScript compartilhados
│   │   └── server.ts        # Servidor principal Express
│   ├── package.json
│   ├── Dockerfile
│   └── docker-compose.yml
└── frontend/
    ├── src/
    │   ├── components/      # Componentes React reutilizáveis
    │   ├── pages/           # Páginas principais (Login, Register, Dashboard)
    │   ├── hooks/           # Hooks customizados
    │   └── lib/             # Utilitários
    ├── package.json
    └── vite.config.ts
```

### Explicação dos arquivos principais
- **server.ts:** Inicializa o Express, aplica middlewares, rotas e executa migrações/seed.
- **controllers/**: Recebem as requisições, validam dados e chamam os services.
- **services/**: Implementam a lógica de negócio (ex: autenticação, registro de ponto).
- **repositories/**: Isolam o acesso ao banco de dados (CRUD, queries).
- **middleware/**: Funções intermediárias para autenticação e validação de dados.
- **routes/**: Definem os endpoints da API e conectam controllers.
- **types/**: Tipos TypeScript para padronizar dados entre camadas.
- **frontend/pages/**: Telas principais do app React (Login, Register, Dashboard).

## 🧠 Padrões de Projeto e SOLID

### SOLID
- **S**: Single Responsibility Principle (cada service, controller, repository tem uma única responsabilidade)
- **O**: Open/Closed Principle (as classes podem ser estendidas sem modificar o código existente)
- **L**: Liskov Substitution Principle (os services/repositories podem ser substituídos por mocks em testes)
- **I**: Interface Segregation Principle (interfaces separadas para cada responsabilidade)
- **D**: Dependency Inversion Principle (services recebem repositories por injeção de dependência)

### Outros padrões usados
- **Repository Pattern:** Isola o acesso ao banco de dados, facilitando manutenção e testes.
- **Service Layer:** Centraliza a lógica de negócio, separando do controller e do acesso a dados.
- **Middleware Pattern:** Permite adicionar autenticação, validação e tratamento de erros de forma reutilizável.
- **DTOs e Tipos:** Uso de TypeScript para garantir contratos de dados entre camadas.
- **Componentização no Frontend:** Componentes reutilizáveis e páginas separadas.

## 🧪 Testes Automatizados
- Testes unitários para services e controllers usando Jest.
- Mock de dependências (ex: UserRepository, jwt, bcryptjs) para isolar lógica de negócio.
- Para rodar os testes:
  ```bash
  cd backend
  npm test
  ```

## 🐳 Docker
- O backend e o banco PostgreSQL podem ser executados via Docker Compose:
  ```bash
  cd backend
  docker-compose up -d
  ```

## 🚀 Como rodar o projeto

### Backend
```bash
cd backend
npm install
npm run db:migrate # cria as tabelas
npm run dev        # inicia o servidor
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Acesse o frontend em `http://localhost:5173` ou `http://localhost:8080` (conforme porta do Vite).

## 🔗 Endpoints principais
- `POST /api/auth/registro` — Registro de usuário
- `POST /api/auth/login` — Login de usuário
- `POST /api/ponto/registrar` — Iniciar/parar turno
- `GET /api/ponto/historico` — Histórico do usuário autenticado (últimos 7 dias)
- `GET /api/ponto/status` — Status atual do turno
- `GET /api/ponto/relatorio` — Baixar relatório CSV do usuário autenticado

## 👤 Fluxo do usuário
1. Acessa a tela inicial, escolhe registrar ou logar.
2. Após login/registro, é redirecionado ao dashboard.
3. No dashboard, vê seu nome, botão de logout, timer e histórico dos últimos 7 dias.
4. Inicia ou para o turno, que é registrado no backend.
5. O histórico mostra apenas os registros do usuário logado.
6. O timer mostra o tempo real do turno e, ao pausar, exibe o tempo total do dia.
7. Pode baixar o relatório CSV personalizado.
8. Ao clicar em sair, é deslogado e volta para a tela inicial.

## 📄 Exemplo de relatório CSV

```
Relatório de Ponto
Usuário: Nome do Usuário (email@exemplo.com)

Data,Entrada,Saída,Horas Totais
12-06-2025,08:00,17:00,9.0
13-06-2025,08:10,17:05,9.0
...
```

## 📚 Dicas de uso
- O token JWT é salvo no localStorage e enviado em todas as requisições autenticadas.
- O backend só retorna dados do usuário autenticado.
- O frontend protege o dashboard, redirecionando para login se não houver token.
- O dashboard é responsivo e atualizado automaticamente.

## 📝 Licença
MIT

---
Desenvolvido para o desafio técnico Ilumeo seguindo as melhores práticas de arquitetura, segurança e código limpo.
