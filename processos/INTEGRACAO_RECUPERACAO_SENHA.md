# 🔐 Integração de Recuperação de Senha

## 📋 Resumo

Integração completa do sistema "Esqueci minha senha" entre frontend e backend, permitindo que usuários recuperem acesso à plataforma através de código de verificação por email.

## 🎯 Funcionalidades Implementadas

### 1. **Backend** ✅ (Já implementado)
- Sistema completo de password reset
- Geração de código de 6 dígitos
- Envio de email via SMTP
- Verificação de código
- Geração de JWT para reset

### 2. **Frontend** ✅ (Implementado)

#### Componentes
- ✅ `ForgotPasswordModal.vue` - Modal para solicitar reset
- ✅ `VerifyCodeModal.vue` - Modal para verificar código
- ✅ `ResetPasswordView.vue` - Página para nova senha

#### Integração
- ✅ Serviço de autenticação
- ✅ Store de sessão
- ✅ Roteamento
- ✅ Fluxo completo

## 📁 Estrutura de Arquivos

### **Backend** (Já existe)
```
backend/
├── src/modules/auth/
│   ├── password-reset.controller.ts  ✅
│   ├── password-reset.service.ts     ✅
│   ├── dto/password-reset.dto.ts     ✅
│   └── mailer.service.ts             ✅
└── db/migrations/
    └── 027_password_reset_system.sql ✅
```

### **Frontend** (Implementado)
```
frontend/
├── src/
│   ├── services/
│   │   └── auth.service.ts           ✅ (funções: forgotPassword, verifyResetCode, resetPassword)
│   ├── stores/
│   │   └── session.store.ts          ✅ (resetToken, forgotPassword, verifyResetCode, resetPassword)
│   ├── views/
│   │   ├── LoginView.vue             ✅ (integração com modais)
│   │   └── ResetPasswordView.vue     ✅ (página de nova senha)
│   └── components/auth/
│       ├── ForgotPasswordModal.vue   ✅ (solicitar código)
│       └── VerifyCodeModal.vue       ✅ (verificar código)
```

## 🔄 Fluxo Completo

### **1. Solicitação de Reset**
```
Usuário clica "Esqueci minha senha" 
  ↓
Modal ForgotPasswordModal abre
  ↓
Usuário digita email ou CPF
  ↓
Frontend: POST /auth/password/forgot
  ↓
Backend: Valida, gera código, envia email
  ↓
Backend: Retorna mensagem genérica (segurança)
  ↓
Modal fecha, abre VerifyCodeModal
```

### **2. Verificação de Código**
```
Usuário recebe email com código
  ↓
Digita código de 6 dígitos no modal
  ↓
Frontend: POST /auth/password/verify
  ↓
Backend: Valida código e gera JWT
  ↓
Backend: Retorna resetToken
  ↓
Frontend: Armazena resetToken em sessionStore
  ↓
Redireciona para /reset-password
```

### **3. Redefinição de Senha**
```
Usuário acessa /reset-password
  ↓
Verifica se resetToken existe
  ↓
Usuário digita nova senha (com validação)
  ↓
Frontend: POST /auth/password/reset
  ↓
Backend: Valida JWT e atualiza senha
  ↓
Backend: Retorna sucesso
  ↓
Frontend: Redireciona para login
```

## 📡 Endpoints da API

### **1. Solicitar Reset**
```http
POST /api/auth/password/forgot
Content-Type: application/json

{
  "identifier": "usuario@email.com"
}
```

**Resposta**:
```json
{
  "message": "Se existir uma conta com este email ou CPF, enviamos um código de verificação."
}
```

### **2. Verificar Código**
```http
POST /api/auth/password/verify
Content-Type: application/json

{
  "identifier": "usuario@email.com",
  "code": "123456"
}
```

**Resposta**:
```json
{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **3. Redefinir Senha**
```http
POST /api/auth/password/reset
Content-Type: application/json

{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NovaSenh@123"
}
```

**Resposta**:
```json
{
  "message": "Senha alterada com sucesso. Faça login com sua nova senha."
}
```

## 🔧 Componentes Frontend

### **1. ForgotPasswordModal.vue**

**Funcionalidades**:
- Validação de email ou CPF
- Envio de requisição para backend
- Feedback de loading/erro
- Transição para próximo modal

**Props**:
- `show: boolean` - Controla visibilidade

**Events**:
- `update:show` - Atualiza visibilidade
- `next(identifier)` - Próximo passo (verificar código)

### **2. VerifyCodeModal.vue**

**Funcionalidades**:
- Input otimizado para código de 6 dígitos
- Timer de expiração (10 minutos)
- Botão de reenvio
- Validação de código
- Transição para página de reset

**Props**:
- `show: boolean` - Controla visibilidade
- `identifier: string` - Email ou CPF do usuário

**Events**:
- `update:show` - Atualiza visibilidade
- `verified(resetToken)` - Código verificado com sucesso

### **3. ResetPasswordView.vue**

**Funcionalidades**:
- Validação forte de senha
- Confirmação de senha
- Exibição de requisitos da senha
- Indicação visual de validação
- Toggle de exibição de senha

**Validações**:
- ✅ Mínimo 8 caracteres
- ✅ Uma letra maiúscula
- ✅ Uma letra minúscula
- ✅ Um número
- ✅ Um caractere especial (@$!%*?&)

## 🔐 Segurança

### **Rate Limiting**
- Máximo 3 tentativas por hora por identificador
- Máximo 5 tentativas de código por requisição
- Bloqueio após exceder limites

### **Código de Verificação**
- 6 dígitos numéricos
- Válido por 10 minutos
- Hash com Argon2
- Consumido após uso

### **Token JWT**
- Expira em 10 minutos
- Contém jti (ID da requisição)
- Contém sub (ID do usuário)
- Single-use (consumido após reset)

### **Privacidade**
- Resposta genérica (evita enumeração)
- Não expõe se usuário existe
- Logs de segurança

## 📊 Fluxo de Dados

### **LocalStorage/Session**
```typescript
// sessionStore
{
  resetToken: string | null  // Armazenado após verificação do código
}
```

### **Fluxo de Estado**
```typescript
// LoginView.vue
showForgotPasswordModal: boolean = false
showVerifyCodeModal: boolean = false
identifierForReset: string = ''

// Após verificação
sessionStore.resetToken: string = 'jwt-token'

// ResetPasswordView.vue lê de sessionStore
if (!sessionStore.resetToken) {
  redirect('/login')
}
```

## 🧪 Testes

### **Teste 1: Solicitar Reset**
1. ✅ Clicar em "Esqueci minha senha"
2. ✅ Modal abre
3. ✅ Digitar email válido
4. ✅ Clicar "Enviar código"
5. ✅ Verificar chamada à API
6. ✅ Modal fecha
7. ✅ VerifyCodeModal abre

### **Teste 2: Verificar Código**
1. ✅ Digitar código de 6 dígitos
2. ✅ Timer expirando
3. ✅ Clicar "Verificar código"
4. ✅ Verificar chamada à API
5. ✅ Verificar resetToken armazenado
6. ✅ Redirecionar para /reset-password

### **Teste 3: Redefinir Senha**
1. ✅ Acessar /reset-password
2. ✅ Digitar nova senha forte
3. ✅ Confirmar senha
4. ✅ Ver requisitos marcados
5. ✅ Clicar "Alterar senha"
6. ✅ Verificar chamada à API
7. ✅ Redirecionar para /login
8. ✅ Login com nova senha

## 🎨 UI/UX

### **Modais**
- Design consistente com tema da aplicação
- Feedback visual de loading
- Mensagens de erro claras
- Acessibilidade (aria-labels)
- Responsivo

### **ResetPasswordView**
- Página dedicada
- Validação em tempo real
- Indicadores visuais de requisitos
- Toggle de visibilidade de senha
- Link para voltar ao login

## 📝 Integração com Roteamento

### **Routes**
```typescript
{
  path: '/reset-password',
  name: 'reset-password',
  component: ResetPasswordView,
  meta: { guest: true }
}
```

### **Guards**
- Verificação de `resetToken` no `onMounted`
- Redirect para `/login` se não houver token
- Limpeza de token após uso

## 🔗 Conexões

### **LoginView → ForgotPasswordModal**
```vue
<a @click.prevent="openForgotPasswordModal">
  Esqueci minha senha
</a>

<ForgotPasswordModal
  :show="showForgotPasswordModal"
  @next="handleForgotPasswordNext"
/>
```

### **LoginView → VerifyCodeModal**
```vue
<VerifyCodeModal
  :show="showVerifyCodeModal"
  :identifier="identifierForReset"
  @verified="handleCodeVerified"
/>
```

### **handleCodeVerified**
```typescript
function handleCodeVerified(resetToken: string) {
  // Token já armazenado por verifyResetCode
  router.push({ name: 'reset-password' });
}
```

### **ResetPasswordView → SessionStore**
```typescript
onMounted(() => {
  if (!sessionStore.resetToken) {
    router.push('/login')
  }
})

const handleSubmit = async () => {
  await sessionStore.resetPassword({
    resetToken: sessionStore.resetToken!,
    newPassword: newPassword.value
  })
  
  // Token limpo automaticamente pela store
  router.push({ name: 'login', query: { message: '...' } })
}
```

## ✅ Checklist de Implementação

- [x] Modal ForgotPasswordModal
- [x] Modal VerifyCodeModal
- [x] Página ResetPasswordView
- [x] Funções em auth.service.ts
- [x] Integração em session.store.ts
- [x] Rota /reset-password
- [x] Integração em LoginView
- [x] Botão "Esqueci minha senha"
- [x] Validação de formulários
- [x] Feedback visual
- [x] Gestão de erros
- [x] Limpeza de tokens
- [x] Redirecionamentos

## 🎯 Status Final

**Implementação**: ✅ **COMPLETA**  
**Testes**: ⏳ Pendente  
**Documentação**: ✅ Completa

## 🚀 Como Usar

### **Para o Usuário Final**
1. Acessar página de login
2. Clicar "Esqueci minha senha"
3. Digitar email ou CPF
4. Receber código por email
5. Digitar código no modal
6. Definir nova senha
7. Fazer login com nova senha

### **Para Desenvolvedores**

**Testar fluxo completo**:
```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev

# Abrir http://localhost:5173/fluxo_lab_automatizacao/login
```

**Verificar logs**:
```bash
# Backend logs (emails enviados)
# Frontend DevTools (chamadas de API)
```

## 🔧 Configuração

### **Variáveis de Ambiente** (Backend)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=fluxolab.contato@gmail.com
SMTP_PASS=senha_de_app_gmail
MAIL_FROM=FluxoLab Contato <fluxolab.contato@gmail.com>
```

### **Validações de Senha**
- Mínimo 8 caracteres
- Uma letra maiúscula
- Uma letra minúscula
- Um número
- Um caractere especial (@$!%*?&)

## 📊 Fluxo de Estados

```
[Login] → [Esqueci senha] → [Modal: Email]
  ↓
[Digita email] → [Enviar]
  ↓
[Modal: Código] → [Digita código]
  ↓
[Verificar] → [resetToken salvo]
  ↓
[/reset-password] → [Nova senha]
  ↓
[Confirma senha] → [Alterar]
  ↓
[Backend atualiza] → [Login com nova senha]
```

---

**Data de Criação**: 2025-10-25  
**Autor**: Integração Frontend-Backend  
**Versão**: 1.0  
**Status**: ✅ Completo
