# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o FluxoLab! Este documento fornece diretrizes e informações sobre como contribuir para o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Testes](#testes)
- [Documentação](#documentação)
- [Pull Requests](#pull-requests)
- [Issues](#issues)

## 📜 Código de Conduta

Este projeto adere ao [Código de Conduta do Contributor Covenant](https://www.contributor-covenant.org/). Ao participar, você concorda em manter este código.

### Nossos Compromissos

- Criar um ambiente acolhedor e inclusivo
- Respeitar diferentes pontos de vista e experiências
- Aceitar críticas construtivas com graça
- Focar no que é melhor para a comunidade
- Demonstrar empatia com outros membros da comunidade

## 🚀 Como Contribuir

### Tipos de Contribuição

1. **🐛 Correção de Bugs**
2. **✨ Novas Funcionalidades**
3. **📚 Documentação**
4. **🧪 Testes**
5. **🎨 Melhorias de UI/UX**
6. **⚡ Otimizações de Performance**
7. **🔒 Melhorias de Segurança**

### Primeiros Passos

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Configure** o ambiente de desenvolvimento
4. **Crie** uma branch para sua contribuição
5. **Faça** suas alterações
6. **Teste** suas alterações
7. **Submeta** um Pull Request

## 🔧 Configuração do Ambiente

### Pré-requisitos

- Node.js 20+
- npm 9+
- PostgreSQL 13+
- Redis 7+
- Docker (opcional)

### Setup Inicial

```bash
# 1. Fork e clone
git clone https://github.com/SEU-USERNAME/fluxolab.git
cd fluxolab

# 2. Instalar dependências
npm install
cd backend && npm install
cd ../frontend && npm install

# 3. Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# 4. Setup do banco
createdb fluxolab_dev
cd backend && npm run migrate

# 5. Iniciar desenvolvimento
npm run dev
```

### Scripts Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia backend e frontend
npm run dev:backend      # Apenas backend
npm run dev:frontend     # Apenas frontend

# Testes
npm run test             # Todos os testes
npm run test:unit        # Testes unitários
npm run test:e2e         # Testes e2e
npm run test:watch       # Testes em modo watch

# Linting e Formatação
npm run lint             # Executa linting
npm run lint:fix         # Corrige problemas de lint
npm run format           # Formata código

# Build
npm run build            # Build completo
npm run build:backend    # Build backend
npm run build:frontend   # Build frontend
```

## 🔄 Processo de Desenvolvimento

### 1. Criação de Branch

```bash
# Criar branch a partir de main
git checkout main
git pull origin main
git checkout -b feature/nova-funcionalidade

# Ou para bugs
git checkout -b bugfix/corrigir-problema
```

### 2. Convenções de Nomenclatura

- **Features**: `feature/descrição-da-funcionalidade`
- **Bugs**: `bugfix/descrição-do-problema`
- **Docs**: `docs/descrição-da-documentação`
- **Refactor**: `refactor/descrição-da-refatoração`
- **Tests**: `test/descrição-dos-testes`

### 3. Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<type>[optional scope]: <description>

# Exemplos
feat(auth): adiciona autenticação com JWT
fix(api): corrige erro de validação
docs(readme): atualiza instruções de instalação
test(workspace): adiciona testes para workspace service
refactor(database): simplifica queries de usuários
```

### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, ponto e vírgula, etc.
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Mudanças em ferramentas, configurações, etc.

## 📏 Padrões de Código

### Backend (NestJS + TypeScript)

#### Estrutura de Arquivos
```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   └── repositories/
│   └── workspace/
├── shared/
│   ├── auth/
│   ├── database/
│   └── security/
└── config/
```

#### Padrões de Código

```typescript
// ✅ Bom: Interface clara e bem documentada
export interface UserCreateDto {
  /** Email do usuário */
  email: string;
  
  /** Nome para exibição */
  displayName: string;
  
  /** Senha (hash) */
  password: string;
}

// ✅ Bom: Service com injeção de dependência
@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async createUser(dto: UserCreateDto): Promise<User> {
    // Implementação
  }
}

// ✅ Bom: Controller com validação
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: UserCreateDto): Promise<User> {
    return this.authService.createUser(dto);
  }
}
```

### Frontend (Vue.js + TypeScript)

#### Estrutura de Componentes
```vue
<template>
  <!-- Template bem estruturado -->
</template>

<script setup lang="ts">
// Script com TypeScript
import { ref, computed, onMounted } from 'vue';

// Props bem tipadas
interface Props {
  title: string;
  items: Array<{ id: string; name: string }>;
}

const props = defineProps<Props>();

// Emits tipados
const emit = defineEmits<{
  select: [item: { id: string; name: string }];
  close: [];
}>();

// Lógica reativa
const selectedItem = ref<string | null>(null);
const filteredItems = computed(() => {
  // Lógica de filtro
});
</script>

<style scoped>
/* Estilos específicos do componente */
</style>
```

### Banco de Dados

#### Migrações
```sql
-- ✅ Bom: Migração bem documentada
-- Adiciona tabela de configurações de usuário
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT NOT NULL DEFAULT 'pt-BR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_settings_theme ON user_settings (theme);
```

## 🧪 Testes

### Estrutura de Testes

```
tests/
├── unit/
│   ├── services/
│   ├── controllers/
│   └── repositories/
├── integration/
│   ├── auth/
│   └── workspace/
└── e2e/
    ├── auth.e2e-spec.ts
    └── workflow.e2e-spec.ts
```

### Exemplos de Testes

#### Teste Unitário (Backend)
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  describe('login', () => {
    it('should return user and token for valid credentials', async () => {
      // Arrange
      const user = { id: '1', email: 'test@example.com', password: 'hashed' };
      jest.spyOn(usersRepository, 'findByEmail').mockResolvedValue(user);

      // Act
      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // Assert
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });
  });
});
```

#### Teste de Componente (Frontend)
```typescript
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import UserProfile from '@/components/UserProfile.vue';

describe('UserProfile', () => {
  it('renders user information correctly', () => {
    const user = {
      id: '1',
      name: 'João Silva',
      email: 'joao@example.com',
    };

    const wrapper = mount(UserProfile, {
      props: { user },
    });

    expect(wrapper.text()).toContain('João Silva');
    expect(wrapper.text()).toContain('joao@example.com');
  });
});
```

### Cobertura de Testes

- **Mínimo**: 80% de cobertura
- **Ideal**: 90%+ de cobertura
- **Crítico**: 95%+ para módulos de segurança

## 📚 Documentação

### Tipos de Documentação

1. **README**: Visão geral e quick start
2. **API Docs**: Documentação da API REST
3. **Code Comments**: Comentários no código
4. **Architecture**: Documentação de arquitetura
5. **User Guide**: Guia do usuário

### Padrões de Documentação

#### Comentários no Código
```typescript
/**
 * Serviço para gerenciamento de autenticação de usuários.
 * 
 * @example
 * ```typescript
 * const authService = new AuthService();
 * const user = await authService.login({ email, password });
 * ```
 */
@Injectable()
export class AuthService {
  /**
   * Autentica um usuário com email e senha.
   * 
   * @param credentials - Credenciais do usuário
   * @returns Token JWT e dados do usuário
   * @throws UnauthorizedException quando credenciais são inválidas
   */
  async login(credentials: LoginDto): Promise<AuthResult> {
    // Implementação
  }
}
```

#### Documentação de API
```typescript
/**
 * @api {post} /auth/login Autenticar usuário
 * @apiName Login
 * @apiGroup Auth
 * 
 * @apiParam {String} email Email do usuário
 * @apiParam {String} password Senha do usuário
 * 
 * @apiSuccess {String} token Token JWT
 * @apiSuccess {Object} user Dados do usuário
 * 
 * @apiError {Object} 401 Credenciais inválidas
 */
```

## 🔀 Pull Requests

### Checklist do PR

- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Linting passa sem erros
- [ ] Testes passam
- [ ] Commit messages seguem o padrão
- [ ] PR tem descrição clara

### Template de PR

```markdown
## 📝 Descrição
Breve descrição das mudanças realizadas.

## 🔗 Tipo de Mudança
- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação (mudança apenas na documentação)

## 🧪 Como Testar
1. Passos para testar as mudanças
2. Casos de teste específicos

## 📸 Screenshots (se aplicável)
Adicione screenshots para mudanças de UI.

## ✅ Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Realizei uma auto-revisão do código
- [ ] Comentei código complexo
- [ ] Minhas mudanças não geram warnings
- [ ] Adicionei testes que provam que minha correção é efetiva
- [ ] Testes novos e existentes passam localmente
- [ ] Qualquer mudança dependente foi mergeada e publicada

## 📚 Documentação
- [ ] Atualizei a documentação se necessário
- [ ] Adicionei comentários no código se necessário

## 🔗 Issues Relacionadas
Closes #123
```

## 🐛 Issues

### Tipos de Issue

1. **🐛 Bug Report**: Problemas no código
2. **✨ Feature Request**: Novas funcionalidades
3. **📚 Documentation**: Melhorias na documentação
4. **🔧 Enhancement**: Melhorias em funcionalidades existentes

### Template de Bug Report

```markdown
## 🐛 Descrição do Bug
Descrição clara e concisa do bug.

## 🔄 Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Role para baixo até '...'
4. Veja o erro

## ✅ Comportamento Esperado
Descrição do que deveria acontecer.

## 📸 Screenshots
Se aplicável, adicione screenshots.

## 🖥️ Ambiente
- OS: [ex: Windows 10, macOS 12]
- Browser: [ex: Chrome 91, Firefox 89]
- Versão: [ex: 1.0.0]

## 📋 Contexto Adicional
Qualquer outro contexto sobre o problema.
```

### Template de Feature Request

```markdown
## ✨ Descrição da Funcionalidade
Descrição clara da funcionalidade desejada.

## 🎯 Problema que Resolve
Qual problema esta funcionalidade resolve?

## 💡 Solução Proposta
Descrição detalhada da solução proposta.

## 🔄 Alternativas Consideradas
Outras soluções que foram consideradas.

## 📋 Contexto Adicional
Qualquer outro contexto sobre a funcionalidade.
```

## 🏷️ Labels

### Labels de Issue
- `bug`: Algo não está funcionando
- `enhancement`: Nova funcionalidade ou melhoria
- `documentation`: Melhorias na documentação
- `good first issue`: Bom para novos contribuidores
- `help wanted`: Precisa de ajuda extra
- `priority: high`: Prioridade alta
- `priority: low`: Prioridade baixa

### Labels de PR
- `ready for review`: Pronto para revisão
- `work in progress`: Em desenvolvimento
- `breaking change`: Mudança que quebra compatibilidade
- `needs tests`: Precisa de testes
- `needs documentation`: Precisa de documentação

## 👥 Processo de Revisão

### Critérios de Aceitação

1. **Funcionalidade**: O código funciona conforme especificado
2. **Qualidade**: Código limpo e bem estruturado
3. **Testes**: Cobertura adequada de testes
4. **Documentação**: Documentação atualizada
5. **Performance**: Sem impactos negativos de performance
6. **Segurança**: Sem vulnerabilidades de segurança

### Revisores

- **Backend**: @backend-team
- **Frontend**: @frontend-team
- **DevOps**: @devops-team
- **Security**: @security-team

## 🎉 Reconhecimento

Contribuidores ativos serão reconhecidos:

- **Mencionados** no README
- **Badges** no perfil do GitHub
- **Acesso** ao canal privado do Slack
- **Convidados** para eventos da comunidade

## 📞 Suporte

### Canais de Comunicação

- **💬 Discord**: [FluxoLab Community](https://discord.gg/fluxolab)
- **📧 Email**: dev@fluxolab.com
- **🐛 Issues**: [GitHub Issues](https://github.com/fluxolab/fluxolab/issues)
- **💬 Discussões**: [GitHub Discussions](https://github.com/fluxolab/fluxolab/discussions)

### Horários de Suporte

- **Segunda a Sexta**: 9h às 18h (BRT)
- **Fim de semana**: Comunidade Discord

---

**Obrigado por contribuir para o FluxoLab! 🚀**
