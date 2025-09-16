# 👨‍⚕️ **Sistema de Profissionais - Servify**

## ✅ **Funcionalidades Implementadas:**

### **1. Cadastro de Profissional:**
- **Email obrigatório:** Usado para login
- **Senha automática:** Gerada automaticamente (8 caracteres)
- **Conta de usuário:** Criada automaticamente
- **Credenciais retornadas:** Email e senha temporária

### **2. Acesso Restrito:**
- **Profissionais só veem:** Seus próprios agendamentos e serviços
- **Dashboard específico:** `/professional-dashboard/*`
- **Isolamento por empresa:** Multi-tenant mantido

## 🔐 **Fluxo de Cadastro:**

### **1. Admin cadastra profissional:**
```bash
POST /api/v1/professionals
{
  "name": "João Silva",
  "email": "joao@empresa1.localhost",
  "phone": "(11) 99999-9999",
  "commission": 15.5
}
```

### **2. Sistema retorna:**
```json
{
  "id": "prof_123",
  "name": "João Silva",
  "email": "joao@empresa1.localhost",
  "phone": "(11) 99999-9999",
  "commission": 15.5,
  "loginCredentials": {
    "email": "joao@empresa1.localhost",
    "password": "Abc123Xy"
  }
}
```

### **3. Profissional faz login:**
- **URL:** `http://empresa1.localhost:3000`
- **Email:** `joao@empresa1.localhost`
- **Senha:** `Abc123Xy` (temporária)

## 🎯 **Endpoints para Profissionais:**

### **Dashboard do Profissional:**
```bash
# Meus agendamentos
GET /api/v1/professional-dashboard/my-appointments

# Minha agenda (com filtro de data)
GET /api/v1/professional-dashboard/my-schedule?startDate=2025-01-01&endDate=2025-01-31

# Serviços disponíveis da empresa
GET /api/v1/professional-dashboard/available-services
```

### **Gestão (Admin):**
```bash
# Listar profissionais
GET /api/v1/professionals

# Criar profissional
POST /api/v1/professionals

# Atualizar profissional
PATCH /api/v1/professionals/:id

# Deletar profissional
DELETE /api/v1/professionals/:id

# Horários disponíveis
GET /api/v1/professionals/:id/available-slots?date=2025-01-15
```

## 🔒 **Segurança e Isolamento:**

### **1. Multi-tenant:**
- Profissional só acessa dados da sua empresa
- Login bloqueado em empresas erradas
- Dados isolados por subdomínio

### **2. Acesso Restrito:**
- Profissional só vê seus próprios agendamentos
- Não pode ver dados de outros profissionais
- Não pode acessar gestão administrativa

### **3. Validações:**
- Email único por empresa
- Senha temporária segura
- Validação de permissões

## 📋 **Estrutura de Dados:**

### **Professional:**
```json
{
  "id": "prof_123",
  "name": "João Silva",
  "email": "joao@empresa1.localhost",
  "phone": "(11) 99999-9999",
  "commission": 15.5,
  "isActive": true,
  "companyId": "company_123"
}
```

### **User (criado automaticamente):**
```json
{
  "id": "user_456",
  "email": "joao@empresa1.localhost",
  "firstName": "João",
  "lastName": "Silva",
  "role": "USER",
  "companyId": "company_123"
}
```

## 🧪 **Como Testar:**

### **1. Cadastrar Profissional:**
```bash
curl -X POST http://empresa1.localhost:3001/api/v1/professionals \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@empresa1.localhost",
    "phone": "(11) 88888-8888",
    "commission": 20.0
  }'
```

### **2. Login do Profissional:**
```bash
curl -X POST http://empresa1.localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@empresa1.localhost",
    "password": "SENHA_TEMPORARIA"
  }'
```

### **3. Acessar Dashboard:**
```bash
curl -X GET http://empresa1.localhost:3001/api/v1/professional-dashboard/my-appointments \
  -H "Authorization: Bearer PROFESSIONAL_TOKEN"
```

## 🎉 **Resultado:**

✅ **Cadastro automático de login**  
✅ **Acesso restrito aos próprios dados**  
✅ **Multi-tenancy mantido**  
✅ **Segurança implementada**  
✅ **Dashboard específico para profissionais**  

**Profissionais agora têm acesso controlado apenas aos seus agendamentos!** 👨‍⚕️
