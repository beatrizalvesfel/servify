# 🏠 **Guia Multi-tenant com Localhost**

## ✅ **Configuração Completa para Localhost**

### **1. Configure o Hosts File (Execute como Administrador)**

```powershell
# Execute como Administrador
.\setup-localhost-hosts.ps1
```

**OU** configure manualmente o arquivo `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1 empresa1.localhost
127.0.0.1 empresa2.localhost
127.0.0.1 empresa3.localhost
127.0.0.1 demo.localhost
127.0.0.1 test.localhost
```

### **2. Atualize o .env do Backend**

No arquivo `apps/backend/.env`, altere:
```env
ROOT_DOMAIN=localhost
```

### **3. URLs de Teste**

#### **Frontend (Next.js):**
- `http://empresa1.localhost:3000`
- `http://empresa2.localhost:3000`
- `http://demo.localhost:3000`

#### **Backend (NestJS):**
- `http://empresa1.localhost:3001/api/v1/companies`
- `http://empresa2.localhost:3001/api/v1/companies`
- `http://demo.localhost:3001/api/v1/companies`

## 🧪 **Como Testar Multi-tenancy**

### **Teste 1: Login em Diferentes Empresas**

```powershell
# Empresa 1
$token1 = (Invoke-RestMethod -Uri "http://empresa1.localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email": "admin1@servify.com.br", "password": "admin123"}').access_token

# Empresa 2
$token2 = (Invoke-RestMethod -Uri "http://empresa2.localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email": "admin2@servify.com.br", "password": "admin123"}').access_token
```

### **Teste 2: Verificar Isolamento de Dados**

```powershell
# Empresa 1 vê apenas seus dados
$headers1 = @{ "Authorization" = "Bearer $token1" }
$empresa1 = Invoke-RestMethod -Uri "http://empresa1.localhost:3001/api/v1/companies" -Method GET -Headers $headers1
Write-Host "Empresa 1: $($empresa1.name) (slug: $($empresa1.slug))"

# Empresa 2 vê apenas seus dados
$headers2 = @{ "Authorization" = "Bearer $token2" }
$empresa2 = Invoke-RestMethod -Uri "http://empresa2.localhost:3001/api/v1/companies" -Method GET -Headers $headers2
Write-Host "Empresa 2: $($empresa2.name) (slug: $($empresa2.slug))"
```

### **Teste 3: Frontend Multi-tenant**

1. **Inicie o Frontend:**
   ```bash
   cd apps/frontend
   npm run dev
   ```

2. **Acesse no navegador:**
   - `http://empresa1.localhost:3000` → Empresa Demo 1
   - `http://empresa2.localhost:3000` → Empresa Demo 2
   - `http://demo.localhost:3000` → Demo Company

## 🔐 **Credenciais de Teste**

```
Empresa 1 (empresa1.localhost):
  Admin: admin1@servify.com.br / admin123
  User:  user1@servify.com.br / admin123

Empresa 2 (empresa2.localhost):
  Admin: admin2@servify.com.br / admin123
  User:  user2@servify.com.br / admin123

Demo (demo.localhost):
  Admin: admin4@servify.com.br / admin123
  User:  user4@servify.com.br / admin123
```

## 🚀 **Fluxo Completo de Teste**

### **1. Inicie os Serviços:**
```bash
# Terminal 1 - Backend
cd apps/backend
npm run start:dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

### **2. Teste no Navegador:**

#### **Abra 3 abas diferentes:**
- **Aba 1:** `http://empresa1.localhost:3000`
- **Aba 2:** `http://empresa2.localhost:3000`
- **Aba 3:** `http://demo.localhost:3000`

#### **Cada aba deve mostrar:**
- Interface da empresa específica
- Dados isolados por empresa
- Login com credenciais da empresa

### **3. Teste de API:**

```bash
# Login na empresa 1
curl -X POST http://empresa1.localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin1@servify.com.br", "password": "admin123"}'

# Use o token retornado
curl -X GET http://empresa1.localhost:3001/api/v1/companies \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🔍 **Como Funciona o Multi-tenancy**

### **Middleware Flow:**
1. **Request:** `http://empresa1.localhost:3001/api/v1/companies`
2. **Extract:** `empresa1` do host `empresa1.localhost`
3. **Lookup:** Busca empresa com `slug = "empresa1"` no banco
4. **Attach:** `req.tenant = { id: "company_id", slug: "empresa1" }`
5. **Response:** Dados filtrados pela empresa

### **Frontend Flow:**
1. **URL:** `http://empresa1.localhost:3000`
2. **Extract:** `empresa1` do host
3. **API Calls:** Todas as chamadas vão para `empresa1.localhost:3001`
4. **Data:** Interface mostra apenas dados da empresa 1

## 🚨 **Troubleshooting**

### **❌ Erro: "Empresa não encontrada para o subdomínio"**
- Verifique se o hosts file foi configurado
- Execute PowerShell como administrador
- Reinicie o navegador

### **❌ Subdomínios não funcionam**
- Teste: `ping empresa1.localhost` (deve retornar 127.0.0.1)
- Verifique se o arquivo hosts tem as entradas corretas

### **❌ Frontend não carrega**
- Verifique se o frontend está rodando na porta 3000
- Confirme se o backend está rodando na porta 3001
- Verifique se não há conflito de CORS

### **❌ API retorna 401**
- Faça login primeiro para obter o token JWT
- Inclua o token no header `Authorization: Bearer TOKEN`

## 🎯 **Resultado Esperado**

✅ **Cada empresa tem seu próprio subdomínio**  
✅ **Dados isolados por empresa**  
✅ **Frontend personalizado por empresa**  
✅ **API filtrada por tenant**  
✅ **Login específico por empresa**  

Agora você pode testar o multi-tenancy completo no localhost! 🎉
