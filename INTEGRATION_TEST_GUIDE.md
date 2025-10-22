# Guia de Teste - Integração Frontend-Backend

## ✅ Status da Integração

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
- Adicionado logs de debug para rastrear navegação
- Configurado redirecionamento automático para login em rotas protegidas
- Configurado redirecionamento para dashboard quando usuário autenticado acessa home/login

### 2. Session Store
- Adicionado logs de debug para rastrear estado da sessão
- Inicialização correta do store
- Verificação de token e usuário no localStorage

### 3. Rotas Configuradas
- `/` - Home (Landing page - acesso público)
- `/login` - Login (acesso público)
- `/dashboard` - Dashboard (requer autenticação)
- `/workflows` - Workflows (requer autenticação)
- `/docs` - Documentação (requer autenticação)
- `/settings` - Configurações (requer autenticação)

## 🧪 Como Testar no Navegador

### 1. Acesse a Landing Page
```
http://localhost:5173/fluxo_lab_automatizacao/
```
**Resultado Esperado:** Deve exibir a página inicial (HomeView) com informações sobre o FluxoLab

### 2. Acesse a Página de Login
```
http://localhost:5173/fluxo_lab_automatizacao/login
```
**Resultado Esperado:** Deve exibir a página de login com formulário e opções de login social

### 3. Tente Acessar o Dashboard (sem autenticação)
```
http://localhost:5173/fluxo_lab_automatizacao/dashboard
```
**Resultado Esperado:** Deve redirecionar automaticamente para `/login` com query parameter `?redirect=/dashboard`

### 4. Verifique os Logs no Console do Navegador
Abra o Console (F12) e você verá logs como:
```
Router guard: navigating to dashboard /fluxo_lab_automatizacao/dashboard
Session not initialized, initializing...
Initializing session store...
Stored session data: { hasToken: false, hasUser: false }
No stored session found
Session store initialized
Session state: { isAuthenticated: false, hasToken: false, hasUser: false }
Redirecting to login - requires auth but not authenticated
```

### 5. Teste o Login
1. Na página de login, preencha:
   - Email: `test@example.com`
   - Senha: `password`
2. Clique em "Acessar plataforma"

**Resultado Esperado:** 
- Se o usuário não existir no banco: Mensagem "Credenciais invalidas"
- Se o usuário existir: Redirecionar para dashboard

### 6. Crie um Usuário de Teste
Na página de login, clique em "Cadastrar usuário" e preencha:
- Nome de exibição: `Teste Usuario`
- Email corporativo: `teste@fluxolab.com`
- Senha: `senha123`
- Cor do avatar: (escolha uma cor)

**Resultado Esperado:** 
- Criar conta
- Fazer login automaticamente
- Redirecionar para dashboard

## 🔍 Verificações Importantes

### Verificar Integração do Proxy
1. Abra o Network tab (F12)
2. Tente fazer login
3. Verifique se a requisição vai para `/api/auth/login`
4. Verifique se o proxy redireciona para `http://localhost:3002/api/auth/login`

### Verificar Estado da Sessão
1. Após fazer login com sucesso
2. Abra o Console (F12)
3. Digite: `localStorage.getItem('fluxolab.token')`
4. Deve retornar o token JWT

### Verificar Redirecionamento Automático
1. Faça logout (se estiver logado)
2. Tente acessar: `http://localhost:5173/fluxo_lab_automatizacao/workflows`
3. Deve redirecionar para login

## 🐛 Problemas Conhecidos

### Problema 1: Base Path
O Vite está configurado com base path `/fluxo_lab_automatizacao/`. 

**Para remover em produção:**
Edite `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  base: '/',  // Alterar de '/fluxo_lab_automatizacao/' para '/'
  // ...
})
```

### Problema 2: Logs de Debug
Os logs de debug estão ativos para facilitar o desenvolvimento.

**Para remover em produção:**
1. Remover console.log do `router/index.ts`
2. Remover console.log do `stores/session.store.ts`

## 📝 Próximos Passos

1. ✅ Testar login no navegador
2. ✅ Verificar redirecionamento automático
3. ✅ Testar criação de usuário
4. ✅ Verificar persistência de sessão (refresh da página)
5. ⏳ Conectar APIs do dashboard
6. ⏳ Conectar APIs de workflows
7. ⏳ Implementar logout
8. ⏳ Implementar refresh de token

## 🎯 URLs Principais

- **Frontend Dev:** http://localhost:5173/fluxo_lab_automatizacao/
- **Backend API:** http://localhost:3002/api/
- **Health Check:** http://localhost:3002/api/monitoring/health
- **Swagger (se habilitado):** http://localhost:3002/api/docs

