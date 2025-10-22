# Guia de Teste - Rotas e Login da Aplicação

## ✅ Status Atual

### Backend (Porta 3002)
- ✅ API funcionando
- ✅ Health check: `http://localhost:3002/api/monitoring/health`
- ✅ Autenticação configurada
- ✅ Endpoints protegidos retornando 401 (esperado)

### Frontend (Porta 5173)
- ✅ Aplicação rodando
- ✅ Proxy configurado para `/api` e `/socket.io`
- ✅ Base path: `/fluxo_lab_automatizacao/`

## 🔧 Correções Implementadas

### 1. Router Guard
- ✅ Adicionado logs de debug para rastrear navegação
- ✅ Configurado redirecionamento automático para login em rotas protegidas
- ✅ Configurado redirecionamento para dashboard quando usuário autenticado acessa login
- ✅ Simplificado lógica de inicialização do store de sessão

### 2. Session Store
- ✅ Removido logs excessivos de debug
- ✅ Simplificado lógica de inicialização
- ✅ Mantido verificação de token e usuário no localStorage

### 3. Rotas Configuradas
- ✅ `/` - Home (Landing page - acesso público)
- ✅ `/login` - Login (acesso público)
- ✅ `/dashboard` - Dashboard (requer autenticação)
- ✅ `/workflows/projects` - Builder de workflows (requer autenticação)
- ✅ `/docs` - Documentação (requer autenticação)
- ✅ `/settings/:section?` - Configurações (requer autenticação)

## 🧪 Como Testar

### 1. Acesse a URL Correta
```
http://localhost:5173/fluxo_lab_automatizacao/
```

### 2. Teste de Redirecionamento
1. **Sem autenticação:**
   - Acesse `http://localhost:5173/fluxo_lab_automatizacao/dashboard`
   - Deve redirecionar para `/login`

2. **Com autenticação:**
   - Faça login na aplicação
   - Acesse `http://localhost:5173/fluxo_lab_automatizacao/login`
   - Deve redirecionar para `/dashboard`

### 3. Verificar Console do Navegador
Abra o DevTools (F12) e verifique os logs no console:
- `Router guard: navigating to [route]`
- `Session state: { isAuthenticated: false, hasToken: false, hasUser: false }`
- `Redirecting to login - requires auth but not authenticated`

## 🐛 Problemas Conhecidos

### 1. Base Path
- A aplicação está configurada com base path `/fluxo_lab_automatizacao/`
- Todas as rotas devem incluir este prefixo
- Exemplo: `http://localhost:5173/fluxo_lab_automatizacao/login`

### 2. Redirecionamento
- O redirecionamento acontece no lado do cliente (JavaScript)
- Se o JavaScript estiver desabilitado, o redirecionamento não funcionará
- Verifique se há erros no console do navegador

### 3. Sessão
- A sessão é armazenada no localStorage
- Se o localStorage estiver vazio, o usuário não estará autenticado
- Para testar o login, use as credenciais do backend

## 🔍 Debugging

### 1. Verificar Estado da Sessão
No console do navegador:
```javascript
// Verificar se há token armazenado
localStorage.getItem('fluxolab_token')

// Verificar se há usuário armazenado
localStorage.getItem('fluxolab_user')

// Verificar estado do store
// (disponível no Vue DevTools)
```

### 2. Verificar Rotas
No console do navegador:
```javascript
// Verificar rota atual
window.location.pathname

// Verificar se o router está funcionando
// (disponível no Vue DevTools)
```

### 3. Verificar Proxy
Teste se o proxy está funcionando:
```bash
# Teste direto do backend
curl http://localhost:3002/api/monitoring/health

# Teste através do proxy
curl http://localhost:5173/api/monitoring/health
```

## 📝 Próximos Passos

1. **Testar Login:** Criar usuário de teste no backend
2. **Testar Redirecionamento:** Verificar se as rotas estão funcionando
3. **Testar Integração:** Verificar se o frontend consegue comunicar com o backend
4. **Testar Persistência:** Verificar se a sessão persiste após refresh

## 🚨 Solução de Problemas

### Problema: "Não está acessando o login"
**Solução:** Verifique se está acessando a URL correta com o base path:
- ✅ Correto: `http://localhost:5173/fluxo_lab_automatizacao/login`
- ❌ Incorreto: `http://localhost:5173/login`

### Problema: "Está conectando direto no endpoint"
**Solução:** Isso é normal para SPAs. O redirecionamento acontece no JavaScript:
1. Abra o DevTools (F12)
2. Vá para a aba Console
3. Verifique os logs de redirecionamento
4. Se não houver logs, há um problema no JavaScript

### Problema: "Não passa por login para criar usuário"
**Solução:** O sistema está funcionando corretamente:
1. Usuários não autenticados são redirecionados para login
2. Para criar usuário, use o endpoint de registro do backend
3. Ou configure um usuário de teste no banco de dados
