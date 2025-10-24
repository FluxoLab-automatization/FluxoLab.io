# Plano de Implementação - Componentes e Views Frontend

## 🎯 Objetivo
Implementar todos os componentes Vue e views necessários para integrar com os serviços backend já criados.

## 📋 Estrutura de Implementação

### 1. Stores Pinia (Gerenciamento de Estado)

#### 1.1 Variables Store
```typescript
// stores/variables.store.ts
- state: variables[], loading, error, filters
- actions: fetchVariables, createVariable, updateVariable, deleteVariable
- getters: variablesByEnvironment, secretVariables
```

#### 1.2 Tags Store
```typescript
// stores/tags.store.ts
- state: tags[], loading, error, filters
- actions: fetchTags, createTag, updateTag, deleteTag, searchTags
- getters: popularTags, tagsByColor
```

#### 1.3 Engine Store
```typescript
// stores/engine.store.ts
- state: runs[], stats, loading, error, filters
- actions: triggerWorkflow, fetchRuns, cancelRun, retryRun, fetchStats
- getters: runsByStatus, activeRuns, failedRuns
```

#### 1.4 Connectors Store
```typescript
// stores/connectors.store.ts
- state: connectors[], connections[], categories[], loading, error
- actions: fetchConnectors, createConnection, testConnection, oauthFlow
- getters: connectorsByCategory, activeConnections
```

#### 1.5 Templates Store
```typescript
// stores/templates.store.ts
- state: templates[], installations[], reviews[], loading, error
- actions: fetchTemplates, installTemplate, createReview, fetchReviews
- getters: templatesByVertical, installedTemplates, popularTemplates
```

#### 1.6 AI Chat Store
```typescript
// stores/ai-chat.store.ts
- state: conversations[], messages[], capabilities, loading, error
- actions: fetchConversations, sendMessage, createConversation, fetchCapabilities
- getters: activeConversations, recentMessages
```

#### 1.7 Support Store
```typescript
// stores/support.store.ts
- state: tickets[], categories[], messages[], stats, loading, error
- actions: fetchTickets, createTicket, sendMessage, uploadAttachment, fetchStats
- getters: ticketsByStatus, ticketsByPriority, openTickets
```

### 2. Componentes Vue

#### 2.1 Variables Components
```
components/variables/
├── VariablesList.vue          # Lista de variáveis
├── VariableForm.vue           # Formulário de criação/edição
├── VariableCard.vue           # Card individual da variável
├── VariableEnvironmentTabs.vue # Tabs por ambiente
└── VariableSecretToggle.vue   # Toggle para variáveis secretas
```

#### 2.2 Tags Components
```
components/tags/
├── TagsList.vue               # Lista de tags
├── TagForm.vue                # Formulário de criação/edição
├── TagCard.vue                # Card individual da tag
├── TagColorPicker.vue         # Seletor de cor
└── TagAutocomplete.vue        # Autocomplete para tags
```

#### 2.3 Engine Components
```
components/engine/
├── WorkflowRunsList.vue       # Lista de execuções
├── WorkflowRunCard.vue        # Card individual da execução
├── WorkflowRunDetails.vue     # Detalhes da execução
├── WorkflowRunLogs.vue        # Logs da execução
├── EngineStats.vue            # Estatísticas do engine
└── WorkflowTrigger.vue        # Disparar workflow
```

#### 2.4 Connectors Components
```
components/connectors/
├── ConnectorsGallery.vue      # Galeria de conectores
├── ConnectorCard.vue          # Card individual do conector
├── ConnectorDetails.vue       # Detalhes do conector
├── ConnectionsList.vue        # Lista de conexões
├── ConnectionForm.vue         # Formulário de conexão
├── ConnectionTest.vue         # Teste de conexão
└── OAuthFlow.vue              # Fluxo OAuth
```

#### 2.5 Templates Components
```
components/templates/
├── TemplatesMarketplace.vue   # Marketplace de templates
├── TemplateCard.vue           # Card individual do template
├── TemplateDetails.vue        # Detalhes do template
├── TemplateInstallWizard.vue  # Wizard de instalação
├── TemplateReviews.vue        # Reviews do template
├── TemplateSearch.vue         # Busca de templates
└── TemplateCategories.vue     # Categorias de templates
```

#### 2.6 AI Chat Components
```
components/ai-chat/
├── ChatInterface.vue          # Interface principal do chat
├── ConversationList.vue       # Lista de conversas
├── ConversationCard.vue       # Card individual da conversa
├── MessageList.vue            # Lista de mensagens
├── MessageBubble.vue          # Bubble individual da mensagem
├── MessageInput.vue           # Input para enviar mensagem
├── ChatAttachments.vue        # Anexos do chat
└── ChatSuggestions.vue        # Sugestões de contexto
```

#### 2.7 Support Components
```
components/support/
├── SupportTicketsList.vue     # Lista de tickets
├── TicketCard.vue             # Card individual do ticket
├── TicketDetails.vue          # Detalhes do ticket
├── TicketForm.vue             # Formulário de ticket
├── TicketMessages.vue         # Mensagens do ticket
├── MessageForm.vue            # Formulário de mensagem
├── SupportCategories.vue      # Categorias de suporte
└── SupportStats.vue           # Estatísticas de suporte
```

### 3. Views/Pages

#### 3.1 Variables View
```vue
<!-- views/VariablesView.vue -->
- Header com título e botão "Nova Variável"
- Tabs por ambiente (Development, Staging, Production)
- Lista de variáveis com filtros
- Modal de criação/edição
- Ações: editar, deletar, duplicar
```

#### 3.2 Tags View
```vue
<!-- views/TagsView.vue -->
- Header com título e botão "Nova Tag"
- Lista de tags com filtros e busca
- Cards coloridos das tags
- Modal de criação/edição
- Ações: editar, deletar, visualizar uso
```

#### 3.3 Engine View
```vue
<!-- views/EngineView.vue -->
- Dashboard com estatísticas
- Lista de execuções com filtros
- Detalhes da execução selecionada
- Logs em tempo real
- Ações: cancelar, retry, visualizar logs
```

#### 3.4 Connectors View
```vue
<!-- views/ConnectorsView.vue -->
- Galeria de conectores por categoria
- Lista de conexões ativas
- Modal de configuração de conexão
- Teste de conexão
- Fluxo OAuth integrado
```

#### 3.5 Templates View
```vue
<!-- views/TemplatesView.vue -->
- Marketplace com filtros por vertical
- Lista de templates instalados
- Detalhes do template selecionado
- Wizard de instalação
- Sistema de reviews
```

#### 3.6 AI Chat View
```vue
<!-- views/AiChatView.vue -->
- Lista de conversas na sidebar
- Interface de chat principal
- Input com anexos e sugestões
- Histórico de mensagens
- Integração com workflows
```

#### 3.7 Support View
```vue
<!-- views/SupportView.vue -->
- Lista de tickets com filtros
- Detalhes do ticket selecionado
- Interface de mensagens
- Upload de anexos
- Estatísticas de suporte
```

### 4. Integração com Dashboard

#### 4.1 Dashboard Atualizado
```vue
<!-- views/DashboardView.vue -->
- Adicionar widgets para novas funcionalidades
- Estatísticas do engine
- Conectores ativos
- Templates recentes
- Tickets de suporte abertos
```

#### 4.2 Sidebar Atualizada
```vue
<!-- components/layout/Sidebar.vue -->
- Adicionar links para novas views
- Ícones para cada funcionalidade
- Contadores de notificações
- Agrupamento por categoria
```

### 5. Roteamento

#### 5.1 Novas Rotas
```typescript
// router/index.ts
const routes = [
  // ... rotas existentes
  {
    path: '/variables',
    name: 'variables',
    component: () => import('../views/VariablesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tags',
    name: 'tags',
    component: () => import('../views/TagsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/engine',
    name: 'engine',
    component: () => import('../views/EngineView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/connectors',
    name: 'connectors',
    component: () => import('../views/ConnectorsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/templates',
    name: 'templates',
    component: () => import('../views/TemplatesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ai-chat',
    name: 'ai-chat',
    component: () => import('../views/AiChatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/support',
    name: 'support',
    component: () => import('../views/SupportView.vue'),
    meta: { requiresAuth: true }
  }
];
```

### 6. Ordem de Implementação

#### Fase 1: Stores (Semana 1)
1. Variables Store
2. Tags Store
3. Engine Store

#### Fase 2: Componentes Base (Semana 2)
1. Variables Components
2. Tags Components
3. Engine Components

#### Fase 3: Views Principais (Semana 3)
1. Variables View
2. Tags View
3. Engine View

#### Fase 4: Funcionalidades Avançadas (Semana 4)
1. Connectors (Store + Components + View)
2. Templates (Store + Components + View)

#### Fase 5: Funcionalidades de Suporte (Semana 5)
1. AI Chat (Store + Components + View)
2. Support (Store + Components + View)

#### Fase 6: Integração (Semana 6)
1. Atualizar Dashboard
2. Atualizar Sidebar
3. Atualizar Roteamento
4. Testes de integração

### 7. Padrões de Implementação

#### 7.1 Componentes
- Usar Composition API
- Props tipadas com TypeScript
- Emits documentados
- Slots para customização
- Responsive design

#### 7.2 Stores
- Actions assíncronas
- Getters computados
- Estado reativo
- Persistência local quando necessário
- Tratamento de erros

#### 7.3 Views
- Layout consistente
- Loading states
- Error handling
- Breadcrumbs
- Ações contextuais

### 8. Testes

#### 8.1 Testes Unitários
- Componentes Vue
- Stores Pinia
- Serviços de API

#### 8.2 Testes de Integração
- Fluxos completos
- Interação entre componentes
- Persistência de estado

#### 8.3 Testes E2E
- Cenários de usuário
- Navegação entre views
- Funcionalidades críticas

## 🚀 Próximos Passos

1. **Implementar Stores Pinia** para gerenciamento de estado
2. **Criar Componentes Base** para cada funcionalidade
3. **Desenvolver Views** principais
4. **Integrar com Dashboard** existente
5. **Atualizar Roteamento** e navegação
6. **Testar Integração** completa

## ✅ Status Atual

**Serviços**: 100% implementados
**Tipos**: 100% atualizados
**Plano**: 100% definido

**Próximo**: Implementar Stores Pinia
