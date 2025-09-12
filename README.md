# Servify SaaS Platform

Uma plataforma SaaS whitelabel completa com Next.js, Nest.js e PostgreSQL.

## 🚀 Tecnologias

### Frontend
- **Next.js 14** com App Router
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes UI
- **magic-ui** para animações

### Backend
- **Nest.js** framework
- **PostgreSQL** banco de dados
- **Prisma** ORM
- **JWT** autenticação

### Infraestrutura
- **Docker** para desenvolvimento
- **PostgreSQL** + **pgAdmin**
- **Redis** para cache

## 📁 Estrutura do Projeto

```
servify/
├── apps/
│   ├── backend/          # API Nest.js
│   └── frontend/         # App Next.js
├── docker-compose.yml    # Configuração Docker
├── package.json         # Workspace root
└── README.md
```

## 🛠️ Setup de Desenvolvimento

### Pré-requisitos
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** ([Download](https://git-scm.com/))

### 1. Clone o repositório
```bash
git clone <repository>
cd servify
```

### 2. Setup completo (comando único)
```bash
npm run setup
```

Este comando irá:
- Instalar todas as dependências
- Iniciar os containers Docker
- Configurar o banco de dados
- Executar o seed inicial

### 3. Inicie o desenvolvimento
```bash
npm run dev
```

## 📊 Acesso aos Serviços

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | - |
| **Backend API** | http://localhost:3001/api/v1 | - |
| **pgAdmin** | http://localhost:5050 | admin@servify.com / admin123 |
| **PostgreSQL** | localhost:5432 | servify_user / servify_password |
| **Redis** | localhost:6379 | - |

## 🔑 Credenciais Padrão

Após o seed inicial:
- **Email**: admin@servify.com
- **Senha**: admin123

## 📝 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev                 # Inicia frontend e backend
npm run dev:frontend        # Apenas frontend
npm run dev:backend         # Apenas backend
```

### Docker
```bash
npm run docker:up           # Inicia containers
npm run docker:down         # Para containers
npm run docker:logs         # Visualiza logs
```

### Banco de Dados
```bash
npm run db:generate         # Gera cliente Prisma
npm run db:push             # Aplica schema
npm run db:seed             # Executa seed
npm run db:studio           # Abre Prisma Studio
npm run db:reset            # Reset completo do banco
```

### Build e Deploy
```bash
npm run build               # Build de produção
npm run build:frontend      # Build apenas frontend
npm run build:backend       # Build apenas backend
```

### Utilitários
```bash
npm run install:all         # Instala todas as dependências
npm run clean               # Limpa node_modules e builds
npm run setup               # Setup completo do projeto
```

## 🏗️ Arquitetura

### Backend (Nest.js)
- **Auth Module**: Autenticação JWT
- **Users Module**: Gerenciamento de usuários
- **Companies Module**: Gerenciamento de empresas

### Frontend (Next.js)
- **Landing Page**: Página inicial
- **Dashboard**: `/app` - Área logada
- **Auth**: Login/registro

## 🔧 Configuração

### Variáveis de Ambiente

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://servify_user:servify_password@localhost:5432/servify_db"

# JWT
JWT_SECRET="servify-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# App
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:3000"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```

## 📚 Documentação

- [Nest.js](https://nestjs.com/)
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Docker](https://docs.docker.com/)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
