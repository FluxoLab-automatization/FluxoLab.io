# Plano de Migração do Front-end para Vue.js

## Objetivos
- ✅ Substituir o `index.html`/`app.js` por uma SPA Vue 3 organizada em módulos.
- ✅ Reaproveitar lógica existente (autenticação, overview, fluxo) com componentes e serviços tipados.
- ✅ Preparar o front-end para consumir a API NestJS via `/api`.

## Stack e Ferramentas
- Vite + Vue 3 + TypeScript
- Vue Router para rotas (`/login`, `/dashboard`)
- Pinia para sessão/estado global
- Tailwind CSS para os estilos
- Fetch API encapsulada em `src/services`

## Estrutura Atual
```
frontend/
└─ src/
   ├─ assets/               # Tailwind e estilos globais
   ├─ components/dashboard/ # cards de métricas, projetos, atividades, etc.
   ├─ constants/            # flowDefinition
   ├─ services/             # api.ts, auth.service.ts, workspace.service.ts
   ├─ stores/               # session.store.ts
   ├─ types/                # contratos com a API
   └─ views/                # LoginView.vue, DashboardView.vue
```

## Etapas de Migração
1. **Bootstrap** – ✅ Projeto criado com Vite, Tailwind configurado, proxy `/api`.
2. **Autenticação** – ✅ Formulário de login, Pinia com persistência, `/auth/me`.
3. **Dashboard** – ✅ Componentes para métricas, projetos, atividades, webhooks e fluxo.
4. **Flow Visualization** – ✅ Canvas reativo com nós, conectores e passos do fluxo.
5. **Integrações Futuras** – ☐ Adicionar testes (Vitest + Testing Library).  
   ☐ Mapear rotas adicionais conforme módulos NestJS migrarem.
6. **Remoção do Legado** – ☐ Eliminar `index.html`/`app.js` após cut-over definitivo.

## Próximos Passos
- Cobrir componentes críticos com testes.
- Sincronizar rotas adicionais (`/workspace/projects`, etc.) quando migradas.
- Evoluir visualização do fluxo para edição interativa (drag/drop).
