# FluxoLab Front-end (Vue 3)

Aplicação SPA construída com Vue 3 + Vite para consumir a API do FluxoLab. Esta versão substitui o antigo `index.html`/`app.js`, trazendo organização por componentes, Pinia para estado global e integração direta com o backend NestJS.

## Visão Geral
- **Login**: formulário com validação, armazenamento de sessão em `localStorage` e comunicação com `/api/auth/login`.
- **Dashboard**: apresenta métricas, lista de projetos, atividades recentes, eventos de webhook e a visualização do fluxo orquestrado.
- **Integração com API**: serviços (`src/services`) centralizam chamadas HTTP usando `fetch`, com suporte a token JWT.
- **Estado**: `src/stores/session.store.ts` gerencia sessão, persistência, bootstrap e sincronização com `/api/auth/me`.
- **UI**: estilos com Tailwind CSS e componentes reutilizáveis em `src/components/dashboard`.

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Defina a variável de ambiente base (opcional, por padrão aponta para `http://localhost:3000/api`):
   ```bash
   cp .env.example .env
   # edite VITE_API_BASE_URL se necessário
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   O proxy do Vite encaminha chamadas `http://localhost:5173/api` para `http://localhost:3000`.

## Scripts Disponíveis

| Script            | Descrição                                                     |
| ----------------- | ------------------------------------------------------------- |
| `npm run dev`     | Servidor Vite com hot-reload                                   |
| `npm run build`   | Type-check (vue-tsc) + build de produção                       |
| `npm run preview` | Visualizar build gerado                                        |
| `npm run test:unit` | Executar testes com Vitest (a configurar)                   |
| `npm run lint`    | ESLint com ajustes automáticos                                 |
| `npm run format`  | Prettier nos arquivos de `src/`                                |

## Estrutura Principal
```
frontend/
├─ public/                 # assets estáticos
├─ src/
│  ├─ assets/              # CSS global (Tailwind)
│  ├─ components/dashboard # componentes do painel
│  ├─ constants/           # definições reutilizáveis (ex.: flowDefinition)
│  ├─ services/            # wrappers HTTP (auth, workspace)
│  ├─ stores/              # Pinia (sessão)
│  ├─ types/               # Tipos compartilhados com a API
│  └─ views/               # Telas (Login, Dashboard)
└─ vite.config.ts          # proxy /api → backend e plugins Vue
```

## Próximos Passos
- Adicionar testes de componentes com Vitest + Testing Library.
- Conectar demais rotas (`/workspace/projects`, `/workspace/activities`) quando migradas para NestJS.
- Evoluir a visualização do fluxo para suportar edição interativa.

---

> Para rodar o front-end junto ao backend NestJS, utilize dois terminais:
> ```bash
> # backend/
> npm run start:dev
>
> # frontend/
> npm run dev
> ```
