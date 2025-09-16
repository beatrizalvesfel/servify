# 🚀 Configuração de Desenvolvimento - Servify Multi-tenant

## ✅ Configurações Realizadas

### 1. Arquivo `.env` criado
- ✅ Arquivo `apps/backend/.env` criado com `ROOT_DOMAIN=servify.com.br`
- ✅ Configurações de banco, JWT e outras variáveis definidas

### 2. Middleware Multi-tenant implementado
- ✅ Middleware `TenantMiddleware` criado em `apps/backend/src/common/middleware/tenant.middleware.ts`
- ✅ Registrado globalmente no `AppModule`
- ✅ Extrai subdomínio do host e resolve empresa no banco de dados
- ✅ Anexa `req.tenant = { id, slug }` à requisição

### 3. Banco de dados populado
- ✅ 5 empresas de exemplo criadas com subdomínios:
  - `empresa1.servify.com.br` → Empresa Demo 1
  - `empresa2.servify.com.br` → Empresa Demo 2  
  - `empresa3.servify.com.br` → Empresa Demo 3
  - `demo.servify.com.br` → Demo Company
  - `test.servify.com.br` → Test Company
- ✅ 10 usuários criados (2 por empresa: 1 admin + 1 user)

## 🔧 Próximos Passos

### 1. Configurar Hosts File (Execute como Administrador)

Execute o script PowerShell como administrador:

```powershell
# Navegue até a pasta do projeto
cd E:\servify

# Execute o script de configuração
.\setup-dev-hosts.ps1
```

**OU** configure manualmente o arquivo `C:\Windows\System32\drivers\etc\hosts`:

```
# Servify Development - Multi-tenant subdomains
127.0.0.1 servify.com.br
127.0.0.1 empresa1.servify.com.br
127.0.0.1 empresa2.servify.com.br
127.0.0.1 empresa3.servify.com.br
127.0.0.1 demo.servify.com.br
127.0.0.1 test.servify.com.br
```

### 2. Iniciar o Backend

```bash
cd apps/backend
npm run start:dev
```

### 3. Testar Multi-tenancy

#### URLs de Teste:
- `http://empresa1.servify.com.br:3001/api/v1/companies`
- `http://empresa2.servify.com.br:3001/api/v1/companies`
- `http://demo.servify.com.br:3001/api/v1/companies`

#### Credenciais de Login:
```
Empresa 1:
  Admin: admin1@servify.com.br / admin123
  User:  user1@servify.com.br / admin123

Empresa 2:
  Admin: admin2@servify.com.br / admin123
  User:  user2@servify.com.br / admin123

Demo:
  Admin: admin4@servify.com.br / admin123
  User:  user4@servify.com.br / admin123
```

## 🧪 Como Testar

### 1. Teste de Autenticação
```bash
# Login como admin da empresa 1
curl -X POST http://empresa1.servify.com.br:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin1@servify.com.br", "password": "admin123"}'
```

### 2. Teste de Multi-tenancy
```bash
# Listar empresas (deve retornar apenas a empresa do subdomínio)
curl -X GET http://empresa1.servify.com.br:3001/api/v1/companies \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

### 3. Verificar Middleware
O middleware automaticamente:
- Extrai `empresa1` de `empresa1.servify.com.br`
- Busca empresa com `slug = "empresa1"` no banco
- Anexa `req.tenant = { id: "company_id", slug: "empresa1" }` à requisição

## 📋 Endpoints Disponíveis

### Companies CRUD
- `POST /api/v1/companies` - Criar empresa
- `GET /api/v1/companies` - Listar empresas
- `GET /api/v1/companies/:id` - Buscar empresa por ID
- `GET /api/v1/companies/slug/:slug` - Buscar empresa por slug
- `PATCH /api/v1/companies/:id` - Atualizar empresa
- `DELETE /api/v1/companies/:id` - Deletar empresa

### Users CRUD
- `POST /api/v1/users` - Criar usuário
- `GET /api/v1/users` - Listar usuários (scoped por empresa)
- `GET /api/v1/users/:id` - Buscar usuário por ID
- `PATCH /api/v1/users/:id` - Atualizar usuário
- `DELETE /api/v1/users/:id` - Deletar usuário

## 🔍 Estrutura Multi-tenant

### Schema do Banco
```prisma
model Company {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique    // usado para subdomínio
  domain      String?  @unique    // domínio completo
  // ...
  users       User[]
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  // ...
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
}
```

### Middleware Flow
1. Request chega em `empresa1.servify.com.br:3001/api/v1/companies`
2. Middleware extrai `empresa1` do host
3. Busca empresa com `slug = "empresa1"` no banco
4. Anexa `req.tenant = { id, slug }` à requisição
5. Controllers podem usar `req.tenant` para filtrar dados

## 🚨 Troubleshooting

### Erro: "ROOT_DOMAIN is not configured"
- Verifique se o arquivo `.env` existe e tem `ROOT_DOMAIN=servify.com.br`

### Erro: "Empresa não encontrada para o subdomínio"
- Verifique se a empresa existe no banco com o slug correto
- Execute `npx prisma db seed` para recriar os dados

### Subdomínios não funcionam
- Verifique se o hosts file foi configurado corretamente
- Execute o PowerShell como administrador
- Reinicie o navegador após alterar o hosts file

### Banco de dados não conecta
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Execute `npx prisma db push` para sincronizar o schema
