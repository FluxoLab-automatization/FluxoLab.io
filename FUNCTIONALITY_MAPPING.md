# Mapeamento Completo de Funcionalidades - FluxoLab

## Visão Geral

Este documento mapeia todas as funcionalidades da aplicação FluxoLab, suas necessidades de banco de dados e endpoints correspondentes.

## Funcionalidades Mapeadas

### 1. **Variáveis** 
**Descrição**: Sistema de variáveis globais e de workspace para workflows
**Status**: ❌ Não implementado

**Tabelas Necessárias**:
- `variables` - Armazenar variáveis do sistema
- `workspace_variables` - Variáveis específicas do workspace

**Endpoints Necessários**:
- `GET /api/variables` - Listar variáveis
- `POST /api/variables` - Criar variável
- `PUT /api/variables/:id` - Atualizar variável
- `DELETE /api/variables/:id` - Deletar variável
- `GET /api/variables/workspace` - Variáveis do workspace
- `POST /api/variables/workspace` - Criar variável do workspace

### 2. **Insights**
**Descrição**: Dashboard de analytics e métricas avançadas
**Status**: ❌ Não implementado

**Tabelas Necessárias**:
- `insights_queries` - Consultas salvas de insights
- `insights_dashboards` - Dashboards personalizados
- `insights_widgets` - Widgets de métricas

**Endpoints Necessários**:
- `GET /api/insights/overview` - Visão geral de insights
- `GET /api/insights/metrics` - Métricas específicas
- `GET /api/insights/dashboards` - Listar dashboards
- `POST /api/insights/dashboards` - Criar dashboard
- `GET /api/insights/queries` - Consultas salvas
- `POST /api/insights/queries` - Salvar consulta

### 3. **Help**
**Descrição**: Sistema de ajuda e documentação
**Status**: ❌ Não implementado

**Tabelas Necessárias**:
- `help_articles` - Artigos de ajuda
- `help_categories` - Categorias de ajuda
- `help_feedback` - Feedback dos usuários

**Endpoints Necessários**:
- `GET /api/help/articles` - Listar artigos
- `GET /api/help/articles/:id` - Artigo específico
- `GET /api/help/categories` - Categorias
- `POST /api/help/feedback` - Enviar feedback
- `GET /api/help/search` - Buscar na ajuda

### 4. **Atualizações**
**Descrição**: Sistema de notificações de atualizações e changelog
**Status**: ❌ Não implementado

**Tabelas Necessárias**:
- `system_updates` - Atualizações do sistema
- `user_update_reads` - Controle de leitura de atualizações

**Endpoints Necessários**:
- `GET /api/updates` - Listar atualizações
- `GET /api/updates/unread` - Atualizações não lidas
- `POST /api/updates/:id/read` - Marcar como lida
- `GET /api/updates/changelog` - Changelog público

### 5. **Configurações**
**Descrição**: Sistema completo de configurações da aplicação
**Status**: ✅ Parcialmente implementado

#### 5.1. **Configurações Pessoais**
**Tabelas**: `user_settings` (✅ existente)
**Endpoints**: 
- `GET /api/settings/personal` ✅
- `PUT /api/settings/personal` ✅

#### 5.2. **Usuários**
**Tabelas**: `users`, `workspace_members` (✅ existentes)
**Endpoints**:
- `GET /api/settings/users` ✅
- `POST /api/settings/users` ✅
- `PUT /api/settings/users/:id` ✅
- `DELETE /api/settings/users/:id` ✅

#### 5.3. **Ambientes**
**Tabelas**: `workspace_environments` (✅ existente)
**Endpoints**:
- `GET /api/settings/environments` ✅
- `POST /api/settings/environments` ✅
- `PUT /api/settings/environments/:id` ✅
- `DELETE /api/settings/environments/:id` ✅

#### 5.4. **SSO**
**Tabelas**: `workspace_sso_configs` (✅ existente)
**Endpoints**:
- `GET /api/settings/sso` ✅
- `POST /api/settings/sso` ✅
- `PUT /api/settings/sso/:id` ✅
- `DELETE /api/settings/sso/:id` ✅

#### 5.5. **LDAP**
**Tabelas**: `workspace_ldap_configs` (✅ existente)
**Endpoints**:
- `GET /api/settings/ldap` ✅
- `POST /api/settings/ldap` ✅
- `PUT /api/settings/ldap/:id` ✅
- `DELETE /api/settings/ldap/:id` ✅

### 6. **Painel de Admin**
**Descrição**: Painel administrativo para gestão da plataforma
**Status**: ❌ Não implementado

**Tabelas Necessárias**:
- `admin_audit_logs` - Logs de auditoria administrativa
- `admin_system_metrics` - Métricas do sistema
- `admin_user_actions` - Ações dos usuários

**Endpoints Necessários**:
- `GET /api/admin/overview` - Visão geral do admin
- `GET /api/admin/users` - Gestão de usuários
- `GET /api/admin/workspaces` - Gestão de workspaces
- `GET /api/admin/metrics` - Métricas do sistema
- `GET /api/admin/audit-logs` - Logs de auditoria
- `POST /api/admin/actions` - Ações administrativas

### 7. **Fórum**
**Descrição**: Sistema de fórum da comunidade
**Status**: ❌ Não implementado

**Tabelas Necessárias**:
- `forum_categories` - Categorias do fórum
- `forum_topics` - Tópicos do fórum
- `forum_posts` - Posts do fórum
- `forum_reactions` - Reações aos posts
- `forum_subscriptions` - Inscrições em tópicos

**Endpoints Necessários**:
- `GET /api/forum/categories` - Listar categorias
- `GET /api/forum/topics` - Listar tópicos
- `POST /api/forum/topics` - Criar tópico
- `GET /api/forum/topics/:id` - Tópico específico
- `POST /api/forum/topics/:id/posts` - Responder tópico
- `POST /api/forum/posts/:id/reactions` - Reagir ao post

### 8. **Reportar um Erro**
**Descrição**: Sistema de reporte de bugs e problemas
**Status**: ❌ Não implementado

**Tabelas Necessárias**:
- `bug_reports` - Relatórios de bugs
- `bug_report_attachments` - Anexos dos relatórios
- `bug_report_status` - Status dos relatórios

**Endpoints Necessários**:
- `POST /api/bugs/report` - Reportar bug
- `GET /api/bugs/reports` - Listar relatórios
- `GET /api/bugs/reports/:id` - Relatório específico
- `PUT /api/bugs/reports/:id/status` - Atualizar status
- `POST /api/bugs/reports/:id/attachments` - Anexar arquivo

### 9. **Quickstart**
**Descrição**: Sistema de onboarding e tutoriais
**Status**: ❌ Não implementado

**Tabelas Necessárias**:
- `quickstart_tutorials` - Tutoriais disponíveis
- `user_tutorial_progress` - Progresso dos usuários
- `quickstart_templates` - Templates de início rápido

**Endpoints Necessários**:
- `GET /api/quickstart/tutorials` - Listar tutoriais
- `GET /api/quickstart/progress` - Progresso do usuário
- `POST /api/quickstart/progress` - Atualizar progresso
- `GET /api/quickstart/templates` - Templates disponíveis
- `POST /api/quickstart/start` - Iniciar tutorial

### 10. **Sobre FluxoLab**
**Descrição**: Página institucional e informações da empresa
**Status**: ❌ Não implementado

**Tabelas Necessárias**:
- `company_info` - Informações da empresa
- `team_members` - Membros da equipe
- `company_news` - Notícias da empresa

**Endpoints Necessários**:
- `GET /api/about/company` - Informações da empresa
- `GET /api/about/team` - Equipe
- `GET /api/about/news` - Notícias
- `GET /api/about/version` - Versão da aplicação

### 11. **Chat com IA**
**Descrição**: Assistente de IA para criação de workflows
**Status**: ❌ Não implementado

**Tabelas Necessárias**:
- `ai_conversations` - Conversas com IA
- `ai_messages` - Mensagens da conversa
- `ai_workflow_suggestions` - Sugestões de workflow

**Endpoints Necessários**:
- `POST /api/ai/chat` - Enviar mensagem para IA
- `GET /api/ai/conversations` - Listar conversas
- `GET /api/ai/conversations/:id` - Conversa específica
- `POST /api/ai/suggest-workflow` - Sugerir workflow
- `POST /api/ai/explain-workflow` - Explicar workflow

### 12. **Logs**
**Descrição**: Sistema de logs e monitoramento
**Status**: ✅ Parcialmente implementado

**Tabelas**: `workspace_log_destinations` (✅ existente)
**Endpoints**:
- `GET /api/logs` - Listar logs
- `GET /api/logs/export` - Exportar logs
- `GET /api/logs/destinations` - Destinos de log
- `POST /api/logs/destinations` - Configurar destino

### 13. **Compartilhamento de Projetos**
**Descrição**: Sistema de compartilhamento de workflows e projetos
**Status**: ❌ Não implementado

**Tabelas Necessárias**:
- `shared_projects` - Projetos compartilhados
- `shared_project_permissions` - Permissões de compartilhamento
- `shared_project_access_logs` - Logs de acesso

**Endpoints Necessários**:
- `POST /api/projects/:id/share` - Compartilhar projeto
- `GET /api/projects/shared` - Projetos compartilhados
- `GET /api/projects/shared/:token` - Acessar projeto compartilhado
- `PUT /api/projects/shared/:id/permissions` - Atualizar permissões
- `DELETE /api/projects/shared/:id` - Parar compartilhamento

### 14. **Tags**
**Descrição**: Sistema de tags para organização
**Status**: ❌ Não implementado

**Tabelas Necessárias**:
- `tags` - Tags disponíveis
- `workflow_tags` - Tags dos workflows
- `tag_categories` - Categorias de tags

**Endpoints Necessários**:
- `GET /api/tags` - Listar tags
- `POST /api/tags` - Criar tag
- `PUT /api/tags/:id` - Atualizar tag
- `DELETE /api/tags/:id` - Deletar tag
- `GET /api/tags/categories` - Categorias de tags
- `POST /api/workflows/:id/tags` - Adicionar tag ao workflow

### 15. **Período Grátis**
**Descrição**: Sistema de trial e período gratuito
**Status**: ✅ Implementado

**Tabelas**: `workspace_subscriptions` (✅ existente)
**Endpoints**:
- `GET /api/trial/info` ✅
- `POST /api/trial/upgrade` ✅

### 16. **Integrações**
**Descrição**: Sistema de integrações e conectores
**Status**: ✅ Parcialmente implementado

**Tabelas**: `workspace_integrations` (✅ existente)
**Endpoints**:
- `GET /api/integrations` ✅
- `POST /api/integrations` ✅
- `PUT /api/integrations/:id` ✅
- `DELETE /api/integrations/:id` ✅

### 17. **Suporte**
**Descrição**: Sistema de suporte e tickets
**Status**: ❌ Não implementado

**Tabelas Necessárias**:
- `support_tickets` - Tickets de suporte
- `support_ticket_messages` - Mensagens dos tickets
- `support_categories` - Categorias de suporte
- `support_attachments` - Anexos dos tickets

**Endpoints Necessários**:
- `POST /api/support/tickets` - Criar ticket
- `GET /api/support/tickets` - Listar tickets
- `GET /api/support/tickets/:id` - Ticket específico
- `POST /api/support/tickets/:id/messages` - Responder ticket
- `PUT /api/support/tickets/:id/status` - Atualizar status
- `POST /api/support/tickets/:id/attachments` - Anexar arquivo

### 18. **Execuções**
**Descrição**: Sistema de execuções e monitoramento
**Status**: ✅ Implementado

**Tabelas**: `executions`, `execution_steps` (✅ existentes)
**Endpoints**:
- `GET /api/executions` ✅
- `GET /api/executions/:id` ✅
- `POST /api/executions/:id/cancel` ✅
- `GET /api/executions/:id/logs` ✅

### 19. **Credenciais**
**Descrição**: Sistema de gerenciamento de credenciais
**Status**: ✅ Implementado

**Tabelas**: `credentials` (✅ existente)
**Endpoints**:
- `GET /api/credentials` ✅
- `POST /api/credentials` ✅
- `PUT /api/credentials/:id` ✅
- `DELETE /api/credentials/:id` ✅
- `POST /api/credentials/:id/test` ✅

## Resumo de Implementação

### ✅ **Implementado (5 funcionalidades)**
- Configurações (parcial)
- Logs (parcial)
- Período Grátis
- Integrações (parcial)
- Execuções
- Credenciais

### ❌ **Não Implementado (14 funcionalidades)**
- Variáveis
- Insights
- Help
- Atualizações
- Painel de Admin
- Fórum
- Reportar um Erro
- Quickstart
- Sobre FluxoLab
- Chat com IA
- Compartilhamento de Projetos
- Tags
- Suporte

## Próximos Passos

1. **Priorizar funcionalidades** baseado na importância para o usuário
2. **Criar migrações** para as tabelas necessárias
3. **Implementar serviços** do backend
4. **Criar controllers** para os endpoints
5. **Atualizar frontend** para consumir as novas APIs
6. **Testes** e validação

## Estimativa de Esforço

- **Alta Prioridade**: Variáveis, Tags, Chat com IA, Suporte
- **Média Prioridade**: Insights, Help, Quickstart, Compartilhamento
- **Baixa Prioridade**: Fórum, Admin, Sobre, Atualizações

