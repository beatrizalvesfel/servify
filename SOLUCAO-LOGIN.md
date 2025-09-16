# 🔧 **Solução de Problemas - Login Frontend**

## ❌ **Problema: "Failed to fetch" no Login**

### **Causa:**
O frontend não consegue se conectar ao backend devido à configuração de URL incorreta para subdomínios.

### **✅ Solução Implementada:**

1. **API URL Dinâmica:** Modificado `apps/frontend/src/lib/api.ts` para detectar automaticamente o subdomínio
2. **Mapeamento de Subdomínios:** Frontend agora se conecta ao backend correto baseado no subdomínio

### **Como Funciona Agora:**

```
Frontend: http://empresa1.localhost:3000
Backend:  http://empresa1.localhost:3001/api/v1
```

## 🚀 **Passos para Resolver:**

### **1. Iniciar os Serviços:**

```bash
# Terminal 1 - Backend
cd apps/backend
npm run start:dev

# Terminal 2 - Frontend  
cd apps/frontend
npm run dev
```

### **2. Configurar Hosts File (se ainda não feito):**

Execute como **Administrador**:
```powershell
.\setup-localhost-hosts.ps1
```

### **3. Testar Login:**

#### **URLs de Teste:**
- `http://empresa1.localhost:3000` → Login da Empresa 1
- `http://empresa2.localhost:3000` → Login da Empresa 2
- `http://demo.localhost:3000` → Login da Demo

#### **Credenciais:**
```
Empresa 1:
  Email: admin1@servify.com.br
  Senha: admin123

Empresa 2:
  Email: admin2@servify.com.br  
  Senha: admin123

Demo:
  Email: admin4@servify.com.br
  Senha: admin123
```

## 🔍 **Verificação de Status:**

### **Backend (deve estar rodando):**
```bash
curl -X POST http://empresa1.localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin1@servify.com.br", "password": "admin123"}'
```

### **Frontend (deve estar rodando):**
- Acesse: `http://empresa1.localhost:3000`
- Deve carregar a página de login

## 🚨 **Troubleshooting:**

### **❌ Erro: "Failed to fetch"**
- ✅ **Verificar se backend está rodando:** `http://empresa1.localhost:3001/api/v1`
- ✅ **Verificar se frontend está rodando:** `http://empresa1.localhost:3000`
- ✅ **Verificar hosts file:** `ping empresa1.localhost`

### **❌ Erro: "Network error"**
- ✅ **Verificar CORS:** Backend permite `localhost:3000`
- ✅ **Verificar firewall:** Portas 3000 e 3001 liberadas

### **❌ Erro: "Unauthorized"**
- ✅ **Verificar credenciais:** Use as credenciais corretas da empresa
- ✅ **Verificar subdomínio:** Use o subdomínio correto para cada empresa

## 📋 **Fluxo de Login Corrigido:**

1. **Usuário acessa:** `http://empresa1.localhost:3000`
2. **Frontend detecta:** Subdomínio `empresa1`
3. **API URL configurada:** `http://empresa1.localhost:3001/api/v1`
4. **Login enviado para:** Backend correto da empresa
5. **Middleware resolve:** Empresa pelo subdomínio
6. **Token retornado:** Específico da empresa

## 🎯 **Resultado Esperado:**

✅ **Login funcionando em todos os subdomínios**  
✅ **Cada empresa tem sua própria instância**  
✅ **Dados isolados por empresa**  
✅ **Multi-tenancy completo funcionando**  

## 🔧 **Comandos Úteis:**

```bash
# Verificar processos rodando
Get-Process -Name "node"

# Parar todos os processos Node
Get-Process -Name "node" | Stop-Process -Force

# Testar conectividade
ping empresa1.localhost
ping empresa2.localhost

# Verificar portas
netstat -an | findstr ":3000"
netstat -an | findstr ":3001"
```

Agora o login deve funcionar perfeitamente! 🎉
