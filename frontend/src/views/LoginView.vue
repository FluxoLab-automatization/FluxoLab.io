<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '../stores/session.store';
import CompanyLogo from '../assets/logo-empresa.png';
import {
  beginOAuthFlow,
  buildOAuthUrl,
  type OAuthProvider,
} from '../services/auth.service';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();

const mode = ref<'login' | 'register'>('login');
const navOpen = ref(false);
const isScrolled = ref(false);

const email = ref('');
const password = ref('');
const remember = ref(true);

const registerForm = reactive({
  displayName: '',
  email: '',
  password: '',
  avatarColor: '#6366F1',
  accessToken: '',
});

const formError = ref<string | null>(null);
const registerError = ref<string | null>(null);
const registerSuccess = ref<string | null>(null);
const oauthError = ref<string | null>(null);

const oauthLoading = ref<OAuthProvider | null>(null);

const isSubmitting = computed(
  () => session.loading && mode.value === 'login',
);
const isRegistering = computed(
  () => session.loading && mode.value === 'register',
);

const navLinks = [
  { label: 'Recursos', target: '#recursos' },
  { label: 'Planos', target: '#planos' },
  { label: 'Segurança', target: '#seguranca' },
  { label: 'FAQ', target: '#faq' },
] as const;

const heroStats = [
  { value: '+240%', label: 'Velocidade de insights' },
  { value: '99.9%', label: 'Disponibilidade garantida' },
  { value: '-63%', label: 'Redução de custos' },
] as const;

const trustLogos = ['Trace', 'Volume', 'Clues', 'Rise', 'Cloud', 'Nova'] as const;

const featureHighlights = [
  {
    title: 'Orquestração visual',
    description:
      'Construa jornadas com blocos inteligentes, condições e testes A/B com registro completo.',
  },
  {
    title: 'Conectores inteligentes',
    description:
      'Integre WhatsApp, Slack, HubSpot e mais de 120 serviços sem sair do canvas colaborativo.',
  },
  {
    title: 'Observabilidade unificada',
    description:
      'Receba alertas, monitore métricas por projeto e reprocese eventos com um clique.',
  },
] as const;

const securityHighlights = [
  {
    title: 'Segurança operacional',
    description: 'RBAC, dupla camada de auditoria e tokens rotacionáveis por workspace.',
  },
  {
    title: 'Confiabilidade',
    description: 'Failover automático e monitoramento 24/7 com SLO de 99.9%.',
  },
  {
    title: 'Governança de dados',
    description:
      'Criptografia ponta a ponta, retenção configurável e relatórios de conformidade.',
  },
] as const;

const faqPreview = [
  {
    question: 'Como funciona o login com Google ou GitHub?',
    answer:
      'Utilizamos OAuth 2.0. Ao autorizar, sincronizamos seu perfil e vinculamos ao workspace FluxoLab.',
  },
  {
    question: 'Posso combinar login social e senha?',
    answer:
      'Sim, você pode ativar MFA, configurar senha e manter provedores sociais como fallback.',
  },
] as const;

const pipelineStages = [
  {
    title: 'Captura inteligente',
    description: 'Conecte canais e centralize novos contatos automaticamente.',
  },
  {
    title: 'Orquestração visual',
    description: 'Arraste etapas, defina condicionais e simule jornadas complexas.',
  },
  {
    title: 'Bots + time humano',
    description: 'Handover instantâneo para especialistas quando necessário.',
  },
  {
    title: 'Insights em tempo real',
    description: 'Monitore eventos, webhooks e KPIs em um painel único.',
  },
] as const;

const activeStage = ref(0);
let stageInterval: number | undefined;

const defaultRedirect = computed(() => {
  const redirectParam = route.query.redirect;
  if (typeof redirectParam === 'string' && redirectParam.trim().length > 0) {
    return redirectParam;
  }
  return '/dashboard';
});

const baseOAuthProviders = [
  {
    id: 'google' as const,
    label: 'Entrar com Google',
    description: 'Google Workspace ou Gmail corporativo',
    accentClass: 'social-button--google',
    iconLabel: 'G',
  },
  {
    id: 'github' as const,
    label: 'Entrar com GitHub',
    description: 'Ideal para squads de desenvolvimento',
    accentClass: 'social-button--github',
    iconLabel: 'GH',
  },
] as const;

const socialProviderCards = computed(() =>
  baseOAuthProviders.map((provider) => ({
    ...provider,
    href: buildOAuthUrl(provider.id, defaultRedirect.value),
  })),
);

const activeStageLabel = computed(
  () => pipelineStages[activeStage.value]?.title ?? 'FluxoLab',
);

const activeInitials = computed(() =>
  mode.value === 'login'
    ? initialsFromEmail(email.value)
    : registerForm.displayName
        .split(' ')
        .filter(Boolean)
        .map((chunk) => chunk[0]?.toUpperCase() ?? '')
        .slice(0, 2)
        .join('') ||
      initialsFromEmail(registerForm.email),
);

const currentYear = new Date().getFullYear();

function initialsFromEmail(input: string) {
  if (!input) return 'FL';
  const [name] = input.split('@');
  if (!name) return 'FL';
  const parts = name
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2);
  const initials = parts
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return initials || 'FL';
}

function switchMode(next: 'login' | 'register') {
  if (mode.value === next) return;
  mode.value = next;
  formError.value = null;
  registerError.value = null;
  registerSuccess.value = null;
  oauthError.value = null;
  oauthLoading.value = null;
  session.error = null;

  if (next === 'register' && registerForm.email.length === 0) {
    registerForm.email = email.value.trim();
  }
  if (next === 'login' && email.value.length === 0) {
    email.value = registerForm.email.trim();
  }
}

async function handleSubmit() {
  if (!email.value || !password.value) {
    formError.value = 'Informe e-mail e senha.';
    return;
  }

  formError.value = null;
  registerSuccess.value = null;
  oauthError.value = null;

  try {
    await session.login({
      email: email.value.trim(),
      password: password.value,
    });
    await router.push(defaultRedirect.value);
  } catch (err) {
    const fallback =
      err instanceof Error ? err.message : 'Nao foi possivel autenticar.';
    formError.value = fallback;
  }
}

async function handleRegister() {
  if (
    !registerForm.email ||
    !registerForm.password ||
    !registerForm.displayName
  ) {
    registerError.value = 'Preencha e-mail, senha e nome de exibicao.';
    return;
  }

  registerError.value = null;
  formError.value = null;
  oauthError.value = null;

  try {
    await session.register({
      email: registerForm.email.trim(),
      password: registerForm.password,
      displayName: registerForm.displayName.trim(),
      avatarColor: registerForm.avatarColor,
      accessToken: registerForm.accessToken
        ? registerForm.accessToken.trim()
        : undefined,
    });

    registerSuccess.value = 'Cadastro concluido! Redirecionando...';
    await router.push(defaultRedirect.value);
  } catch (err) {
    const fallback =
      err instanceof Error
        ? err.message
        : 'Nao foi possivel concluir o cadastro.';
    registerError.value = fallback;
  }
}

function startOAuth(provider: OAuthProvider) {
  if (oauthLoading.value === provider) {
    return;
  }

  oauthError.value = null;
  formError.value = null;
  registerError.value = null;
  session.error = null;
  oauthLoading.value = provider;

  try {
    beginOAuthFlow(provider, defaultRedirect.value);
  } catch (err) {
    oauthLoading.value = null;
    const message =
      err instanceof Error
        ? err.message
        : 'Nao foi possivel iniciar o login social.';
    oauthError.value = message;
  }
}

function toggleNav() {
  navOpen.value = !navOpen.value;
}

function closeNav() {
  navOpen.value = false;
}

function handleScroll() {
  isScrolled.value = window.scrollY > 10;
}

onMounted(() => {
  stageInterval = window.setInterval(() => {
    activeStage.value = (activeStage.value + 1) % pipelineStages.length;
  }, 3600);

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});

onBeforeUnmount(() => {
  if (stageInterval !== undefined) {
    window.clearInterval(stageInterval);
  }
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="login-shell">
    <div class="login-shell__glow" aria-hidden="true" />
    <div class="login-shell__glimmer" aria-hidden="true" />

    <header :class="['login-header', { 'login-header--scrolled': isScrolled }]">
      <div class="login-header__inner">
        <a href="#hero" class="login-brand" @click="closeNav">
          <img :src="CompanyLogo" alt="FluxoLab logo" class="login-brand__logo" />
          <span class="login-brand__label">FluxoLab</span>
        </a>

        <nav class="login-nav">
          <a
            v-for="link in navLinks"
            :key="link.target"
            :href="link.target"
            class="login-nav__link"
            @click="closeNav"
          >
            {{ link.label }}
          </a>
        </nav>

        <div class="login-header__actions">
          <a class="login-demo" href="#planos">Agendar demo</a>
          <button
            class="login-menu"
            type="button"
            :aria-expanded="navOpen"
            aria-controls="mobile-nav"
            @click="toggleNav"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <transition name="fade">
        <nav
          v-if="navOpen"
          id="mobile-nav"
          class="login-nav--mobile"
        >
          <a
            v-for="link in navLinks"
            :key="'mobile-' + link.target"
            :href="link.target"
            class="login-nav__link"
            @click="closeNav"
          >
            {{ link.label }}
          </a>
          <a href="#planos" class="login-demo login-demo--mobile" @click="closeNav">
            Agendar demo
          </a>
        </nav>
      </transition>
    </header>

    <main class="login-main" id="hero">
      <section class="login-hero">
        <div class="login-hero__content">
          <div class="login-chip">
            <span class="login-chip__dot" />
            Plataforma de automação inteligente
          </div>
          <h1>
            Desenhe fluxos orquestrados
            <span class="login-hero__highlight">com IA assistiva</span>
          </h1>
          <p>
            Combine bots, integrações e o seu time humano em jornadas automatizadas,
            com visibilidade de ponta a ponta e acionamento seguro.
          </p>

          <div class="login-hero__actions">
            <a href="#entrar" class="login-cta">Entrar agora</a>
            <a href="#recursos" class="login-cta login-cta--secondary">Explorar recursos</a>
          </div>

          <div class="login-hero__stats">
            <div
              v-for="stat in heroStats"
              :key="stat.label"
              class="login-hero__stat"
            >
              <span class="login-hero__stat-value">{{ stat.value }}</span>
              <span class="login-hero__stat-label">{{ stat.label }}</span>
            </div>
          </div>
        </div>

        <div class="login-hero__marquee" aria-hidden="true">
          <div class="marquee-track">
            <div v-for="logo in trustLogos" :key="'marquee-a-' + logo" class="marquee-item">
              {{ logo }}
            </div>
            <div v-for="logo in trustLogos" :key="'marquee-b-' + logo" class="marquee-item">
              {{ logo }}
            </div>
          </div>
          <p class="marquee-caption">Mais de 4.000 equipes crescem com FluxoLab</p>
        </div>
      </section>

      <section class="login-card-wrapper" id="entrar">
        <div class="login-card">
          <section class="login-card__left">
            <header class="login-card__left-header">
              <span class="login-card__badge">Blueprint em ação</span>
              <h2>
                {{ activeStageLabel }}
              </h2>
              <p>
                Acompanhe um pipeline vivo enquanto configura seu workspace e habilita logins sociais com um clique.
              </p>
            </header>

            <div class="pipeline-track">
              <article
                v-for="(stage, index) in pipelineStages"
                :key="stage.title"
                :class="['pipeline-stage', { active: index === activeStage }]"
              >
                <div class="indicator" />
                <div class="pipeline-stage__copy">
                  <h3>{{ stage.title }}</h3>
                  <p>{{ stage.description }}</p>
                </div>
              </article>
            </div>

            <div class="login-card__glow" aria-hidden="true" />
          </section>

          <section class="login-card__right">
            <div class="login-card__right-headline">
              <div>
                <p class="login-card__eyebrow">Acesso seguro</p>
                <h2>Entre com sua conta FluxoLab</h2>
                <p>Ative Google ou GitHub para acelerar onboarding sem perder governança.</p>
              </div>
              <div class="login-card__avatar">
                {{ activeInitials }}
              </div>
            </div>

            <div class="social-card">
              <div class="social-card__header">
                <div>
                  <p class="social-card__eyebrow">Login acelerado</p>
                  <h3>Conecte com um provedor confiável</h3>
                </div>
                <div class="social-card__stat">
                  <span class="social-card__stat-value">4k+</span>
                  <span class="social-card__stat-label">automações ativas</span>
                </div>
              </div>

              <div class="social-card__buttons">
                <button
                  v-for="provider in socialProviderCards"
                  :key="provider.id"
                  type="button"
                  :class="[
                    'social-button',
                    provider.accentClass,
                    { loading: oauthLoading === provider.id },
                  ]"
                  :aria-label="provider.label"
                  :title="provider.label"
                  :data-oauth-target="provider.href"
                  :disabled="oauthLoading === provider.id"
                  @click="startOAuth(provider.id)"
                >
                  <span class="social-button__icon" :data-provider="provider.id" aria-hidden="true">
                    {{ provider.iconLabel }}
                  </span>
                  <span class="social-button__copy">
                    <span class="social-button__label">
                      {{
                        oauthLoading === provider.id
                          ? 'Conectando...'
                          : provider.label
                      }}
                    </span>
                    <span class="social-button__description">
                      {{
                        oauthLoading === provider.id
                          ? 'Redirecionando para autorização segura'
                          : provider.description
                      }}
                    </span>
                  </span>
                  <svg class="social-button__chevron" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M7.5 5l5 5-5 5"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <p class="social-card__footnote">
                FluxoLab utiliza OAuth 2.0 seguro. Nenhum fluxo é acionado sem autorização explícita.
              </p>

              <p v-if="oauthError" class="social-card__error">
                {{ oauthError }}
              </p>
            </div>

            <nav class="login-switch">
              <button
                type="button"
                :class="[
                  'login-switch__item',
                  mode === 'login' && 'login-switch__item--active',
                ]"
                @click="switchMode('login')"
              >
                Entrar
              </button>
              <button
                type="button"
                :class="[
                  'login-switch__item',
                  mode === 'register' && 'login-switch__item--active',
                ]"
                @click="switchMode('register')"
              >
                Cadastrar usuário
              </button>
            </nav>

            <form
              v-if="mode === 'login'"
              class="login-form"
              @submit.prevent="handleSubmit"
            >
              <div class="field">
                <label for="email">E-mail</label>
                <input
                  id="email"
                  v-model.trim="email"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="voce@empresa.com"
                />
              </div>

              <div class="field">
                <label for="password">Senha</label>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  autocomplete="current-password"
                  placeholder="********"
                />
              </div>

              <div class="login-form__row">
                <label class="remember">
                  <input v-model="remember" type="checkbox" />
                  <span>Lembrar acesso</span>
                </label>
                <a class="forgot" href="#">Esqueci minha senha</a>
              </div>

              <div
                v-if="formError || session.error"
                class="form-error"
              >
                {{ formError ?? session.error }}
              </div>

              <button type="submit" :disabled="isSubmitting" class="primary-button">
                <span v-if="!isSubmitting">Acessar plataforma</span>
                <span v-else>Autenticando...</span>
              </button>
            </form>

            <form
              v-else
              class="login-form"
              @submit.prevent="handleRegister"
            >
              <div class="grid md:grid-cols-2 gap-4">
                <div class="field md:col-span-2">
                  <label for="register-display-name">Nome de exibição</label>
                  <input
                    id="register-display-name"
                    v-model.trim="registerForm.displayName"
                    type="text"
                    required
                    placeholder="Nome completo"
                  />
                </div>
                <div class="field">
                  <label for="register-email">E-mail corporativo</label>
                  <input
                    id="register-email"
                    v-model.trim="registerForm.email"
                    type="email"
                    required
                    autocomplete="email"
                    placeholder="novo@fluxo.com"
                  />
                </div>
                <div class="field">
                  <label for="register-password">Senha</label>
                  <input
                    id="register-password"
                    v-model="registerForm.password"
                    type="password"
                    required
                    autocomplete="new-password"
                    placeholder="Crie uma senha segura"
                  />
                </div>
                <div class="field">
                  <label for="register-avatar">Cor do avatar</label>
                  <input
                    id="register-avatar"
                    v-model="registerForm.avatarColor"
                    type="color"
                    class="color-picker"
                    title="Selecione a cor do avatar"
                  />
                </div>
                <div class="field">
                  <label for="register-access-token">Token de acesso (opcional)</label>
                  <input
                    id="register-access-token"
                    v-model.trim="registerForm.accessToken"
                    type="text"
                    placeholder="Informe se fornecido pelo time FluxoLab"
                  />
                </div>
              </div>

              <div
                v-if="registerError || session.error"
                class="form-error"
              >
                {{ registerError ?? session.error }}
              </div>

              <div
                v-if="registerSuccess"
                class="form-success"
              >
                {{ registerSuccess }}
              </div>

              <button type="submit" :disabled="isRegistering" class="primary-button">
                <span v-if="!isRegistering">Criar conta e acessar</span>
                <span v-else>Configurando workspace...</span>
              </button>
            </form>

            <p class="login-terms">
              Ao continuar você concorda com os
              <a href="#">Termos de Uso</a>
              e a Política de Privacidade.
            </p>
          </section>
        </div>
      </section>

      <section class="info-section" id="recursos">
        <header class="info-section__header">
          <h2>Recursos para operar como N8N, Make ou Zapier — com DNA FluxoLab</h2>
          <p>
            Construa automatizações de ponta a ponta com versionamento, multi-workspace e colaboração em tempo real.
          </p>
        </header>
        <div class="info-grid">
          <article v-for="feature in featureHighlights" :key="feature.title" class="info-card">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </article>
        </div>
      </section>

      <section class="info-section info-section--alt" id="planos">
        <header class="info-section__header">
          <h2>Planos que acompanham o crescimento da sua operação</h2>
          <p>
            Comece grátis, aproveite workspaces compartilhados e evolua para SLAs avançados quando precisar.
          </p>
        </header>
        <div class="plan-grid">
          <div class="plan-card">
            <h3>Starter</h3>
            <p class="plan-price">R$ 0</p>
            <ul>
              <li>Flows ilimitados</li>
              <li>Até 3 usuários</li>
              <li>Webhook monitorados</li>
            </ul>
          </div>
          <div class="plan-card plan-card--highlight">
            <h3>Growth</h3>
            <p class="plan-price">R$ 349</p>
            <ul>
              <li>Workspaces ilimitados</li>
              <li>Integração SSO/SAML</li>
              <li>Suporte prioritário</li>
            </ul>
          </div>
          <div class="plan-card">
            <h3>Enterprise</h3>
            <p class="plan-price">Sob medida</p>
            <ul>
              <li>Provisionamento SCIM</li>
              <li>Governança avançada</li>
              <li>Equipe dedicada</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="info-section" id="seguranca">
        <header class="info-section__header">
          <h2>Segurança e confiabilidade para cada webhook</h2>
          <p>
            Seu workspace conta com logs assinados, rotação automática de tokens e tabelas auditáveis.
          </p>
        </header>
        <div class="info-grid info-grid--security">
          <article
            v-for="security in securityHighlights"
            :key="security.title"
            class="info-card"
          >
            <h3>{{ security.title }}</h3>
            <p>{{ security.description }}</p>
          </article>
        </div>
      </section>

      <section class="faq-preview" id="faq">
        <header class="info-section__header">
          <h2>Dúvidas rápidas</h2>
          <p>Entenda como o login inteligente se integra ao seu fluxo diário.</p>
        </header>
        <div class="faq-grid">
          <article
            v-for="faq in faqPreview"
            :key="faq.question"
            class="faq-card"
          >
            <h3>{{ faq.question }}</h3>
            <p>{{ faq.answer }}</p>
          </article>
        </div>
      </section>
    </main>

    <footer class="login-footer">
      <p>© {{ currentYear }} FluxoLab — Automação sem atrito.</p>
      <div class="login-footer__links">
        <a href="#">Status</a>
        <a href="#">Roadmap</a>
        <a href="#">Central de ajuda</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.login-shell {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(180deg, #070812 0%, #0b1220 50%, #070812 100%);
  color: #e2e8f0;
  overflow-x: hidden;
}

.login-shell__glow,
.login-shell__glimmer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.login-shell__glow {
  background:
    radial-gradient(ellipse at top, rgba(99, 102, 241, 0.28), transparent 60%),
    radial-gradient(circle at 82% 12%, rgba(251, 146, 60, 0.22), transparent 58%),
    radial-gradient(circle at 18% 18%, rgba(56, 189, 248, 0.18), transparent 60%);
  opacity: 0.8;
}

.login-shell__glimmer {
  background:
    linear-gradient(135deg, rgba(148, 163, 184, 0.08), rgba(15, 23, 42, 0.4)),
    radial-gradient(circle at 50% 120%, rgba(251, 146, 60, 0.2), transparent 60%);
  mix-blend-mode: screen;
  opacity: 0.32;
}

.login-header {
  position: fixed;
  top: 0;
  inset-inline: 0;
  z-index: 40;
  transition: backdrop-filter 0.25s ease, background-color 0.25s ease,
    box-shadow 0.25s ease;
}

.login-header--scrolled {
  backdrop-filter: blur(12px);
  background-color: rgba(8, 13, 24, 0.72);
  box-shadow: 0 18px 60px -40px rgba(15, 23, 42, 0.8);
}

.login-header__inner {
  margin: 1rem auto;
  max-width: 1200px;
  border-radius: 1.5rem;
  padding: 0.9rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.08);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04),
    0 20px 60px -40px rgba(15, 23, 42, 0.85);
}

.login-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #f8fafc;
  text-transform: uppercase;
}

.login-brand__logo {
  width: 36px;
  height: 36px;
}

.login-brand__label {
  font-size: 0.95rem;
}

.login-nav {
  display: none;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.85rem;
}

.login-nav__link {
  color: rgba(226, 232, 240, 0.78);
  transition: color 0.18s ease;
}

.login-nav__link:hover {
  color: #f8fafc;
}

.login-header__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.login-demo {
  display: none;
  padding: 0.45rem 1.1rem;
  border-radius: 0.8rem;
  background: linear-gradient(135deg, #fb923c, #f97316);
  color: #0f172a;
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  box-shadow: 0 14px 32px -18px rgba(251, 146, 60, 0.7);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.login-demo:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 42px -20px rgba(251, 146, 60, 0.8);
}

.login-demo--mobile {
  display: block;
  text-align: center;
  margin-top: 0.75rem;
}

.login-menu {
  display: inline-flex;
  flex-direction: column;
  gap: 0.28rem;
  padding: 0.45rem;
  border-radius: 0.8rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.login-menu span {
  width: 22px;
  height: 2px;
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.88);
}

.login-nav--mobile {
  display: grid;
  gap: 0.5rem;
  margin: 0 1rem 1.25rem;
  padding: 1rem;
  border-radius: 1.25rem;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.16);
  font-size: 0.85rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.login-main {
  position: relative;
  z-index: 1;
  padding: 8rem 1.25rem 5rem;
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 5rem;
}

.login-hero {
  display: grid;
  gap: 2.5rem;
}

.login-hero__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  border-radius: 9999px;
  padding: 0.45rem 0.9rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: rgba(226, 232, 240, 0.78);
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.login-chip__dot {
  width: 0.48rem;
  height: 0.48rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #fb923c, #f97316);
  box-shadow: 0 0 16px rgba(251, 146, 60, 0.65);
}

.login-hero h1 {
  font-size: clamp(2.2rem, 5vw, 3.9rem);
  line-height: 1.08;
  font-weight: 700;
  color: #f8fafc;
}

.login-hero__highlight {
  position: relative;
  display: inline-block;
  padding-inline: 0.2em;
}

.login-hero__highlight::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: 0.1em;
  height: 0.5em;
  border-radius: 1em;
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.35), rgba(59, 130, 246, 0.25));
  z-index: -1;
}

.login-hero p {
  font-size: clamp(1rem, 1.8vw, 1.15rem);
  color: rgba(226, 232, 240, 0.8);
  max-width: 32rem;
}

.login-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.login-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.4rem;
  border-radius: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  background: linear-gradient(135deg, #6366f1, #4338ca);
  color: #f8fafc;
  box-shadow: 0 18px 48px -26px rgba(79, 70, 229, 0.8);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.login-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 22px 52px -24px rgba(99, 102, 241, 0.86);
}

.login-cta--secondary {
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: rgba(226, 232, 240, 0.85);
  box-shadow: 0 18px 48px -28px rgba(15, 23, 42, 0.7);
}

.login-hero__stats {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  margin-top: 1rem;
}

.login-hero__stat {
  border-radius: 1.1rem;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.login-hero__stat-value {
  display: block;
  font-size: 1.6rem;
  font-weight: 700;
  color: #fb923c;
  margin-bottom: 0.25rem;
}

.login-hero__stat-label {
  font-size: 0.8rem;
  color: rgba(226, 232, 240, 0.7);
}

.login-hero__marquee {
  border-radius: 1.4rem;
  padding: 1.3rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.18);
  overflow: hidden;
  position: relative;
}

.marquee-track {
  display: flex;
  gap: 3.5rem;
  animation: marquee 25s linear infinite;
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(148, 163, 184, 0.55);
}

.marquee-item {
  white-space: nowrap;
}

.marquee-caption {
  margin-top: 1.2rem;
  text-align: center;
  font-size: 0.75rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.55);
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.login-card-wrapper {
  position: relative;
}

.login-card {
  display: grid;
  gap: 0;
  border-radius: 2rem;
  overflow: hidden;
  background: rgba(8, 13, 24, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.24);
  box-shadow:
    0 32px 80px -48px rgba(8, 12, 24, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.login-card__left {
  position: relative;
  padding: 2.2rem 2rem 2.5rem;
  background: linear-gradient(160deg, rgba(30, 41, 59, 0.82), rgba(15, 23, 42, 0.9));
  border-right: 1px solid rgba(148, 163, 184, 0.16);
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.login-card__left-header h2 {
  font-size: 1.35rem;
  font-weight: 600;
  color: #f8fafc;
  margin-top: 0.6rem;
}

.login-card__left-header p {
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.72);
  margin-top: 0.6rem;
}

.login-card__badge {
  display: inline-flex;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.18);
  border: 1px solid rgba(129, 140, 248, 0.4);
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(199, 210, 254, 0.9);
}

.pipeline-track {
  display: grid;
  gap: 0.9rem;
  position: relative;
}

.pipeline-stage {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  border-radius: 1.25rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.6);
  padding: 1rem;
  transition: transform 0.25s ease, border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.pipeline-stage.active {
  border-color: rgba(129, 140, 248, 0.55);
  box-shadow: 0 22px 48px -36px rgba(99, 102, 241, 0.8);
  transform: translateX(6px);
}

.pipeline-stage__copy h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.pipeline-stage__copy p {
  font-size: 0.78rem;
  color: rgba(226, 232, 240, 0.7);
}

.indicator {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  margin-top: 0.1rem;
  background: rgba(148, 163, 184, 0.3);
  box-shadow: 0 0 0 4px rgba(148, 163, 184, 0.1);
}

.pipeline-stage.active .indicator {
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.28);
  animation: pipelinePulse 2.8s ease-in-out infinite;
}

@keyframes pipelinePulse {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.35);
  }
  70% {
    box-shadow: 0 0 0 16px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
}

.login-card__visual {
  position: absolute;
  right: -3rem;
  bottom: -2rem;
  width: 15rem;
  opacity: 0.55;
  pointer-events: none;
}

.login-card__glow {
  position: absolute;
  left: -5rem;
  top: 50%;
  translate: 0 -50%;
  width: 11rem;
  height: 11rem;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.28);
  filter: blur(90px);
}

.login-card__right {
  padding: 2.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  background: rgba(10, 15, 27, 0.92);
}

.login-card__right-headline {
  display: flex;
  gap: 1.2rem;
  align-items: center;
  justify-content: space-between;
}

.login-card__eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.7);
}

.login-card__right-headline h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #f8fafc;
  margin-top: 0.35rem;
}

.login-card__right-headline p {
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.74);
}

.login-card__avatar {
  width: 3.3rem;
  height: 3.3rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.18), rgba(129, 140, 248, 0.32));
  border: 1px solid rgba(129, 140, 248, 0.3);
  color: #818cf8;
  font-weight: 600;
}

.social-card {
  position: relative;
  border-radius: 1.75rem;
  padding: 1.75rem;
  background:
    radial-gradient(
      120% 120% at 100% -10%,
      rgba(251, 146, 60, 0.28),
      rgba(15, 23, 42, 0) 55%
    ),
    linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.88));
  border: 1px solid rgba(251, 146, 60, 0.24);
  box-shadow: 0 42px 80px -48px rgba(15, 23, 42, 0.75);
  overflow: hidden;
}

.social-card::before,
.social-card::after {
  content: '';
  position: absolute;
  border-radius: 9999px;
  filter: blur(68px);
  pointer-events: none;
}

.social-card::before {
  width: 180px;
  height: 180px;
  right: -60px;
  top: -90px;
  background: rgba(251, 146, 60, 0.4);
}

.social-card::after {
  width: 220px;
  height: 220px;
  left: -100px;
  bottom: -120px;
  background: rgba(14, 116, 144, 0.25);
}

.social-card__header {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
  margin-bottom: 1.4rem;
  color: #f8fafc;
}

.social-card__eyebrow {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: rgba(248, 250, 252, 0.6);
}

.social-card__header h3 {
  margin-top: 0.4rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #f8fafc;
}

.social-card__stat {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
}

.social-card__stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fb923c;
  text-shadow: 0 12px 24px rgba(251, 146, 60, 0.35);
}

.social-card__stat-label {
  font-size: 0.75rem;
  color: rgba(248, 250, 252, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.social-card__buttons {
  position: relative;
  display: grid;
  gap: 0.9rem;
  z-index: 1;
}

@media (min-width: 768px) {
  .social-card__buttons {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.social-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border-radius: 1.3rem;
  padding: 0.95rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.75);
  color: #f8fafc;
  text-align: left;
  transition: transform 0.18s ease, box-shadow 0.18s ease,
    border-color 0.18s ease, opacity 0.18s ease;
  box-shadow: 0 26px 38px -36px rgba(15, 23, 42, 0.9);
}

.social-button:hover:not(:disabled) {
  transform: translateY(-1.5px);
  box-shadow: 0 32px 52px -32px rgba(251, 146, 60, 0.35);
}

.social-button:disabled {
  opacity: 0.82;
  cursor: wait;
}

.social-button.loading .social-button__chevron {
  opacity: 0.4;
}

.social-button__icon {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  font-weight: 700;
  letter-spacing: 0.02em;
  font-size: 0.95rem;
  color: #0f172a;
  background: rgba(248, 250, 252, 0.9);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.4),
    0 10px 24px -12px rgba(248, 250, 252, 0.6);
}

.social-button__copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.social-button__label {
  font-size: 0.95rem;
  font-weight: 600;
  color: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.social-button__description {
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.7);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.social-button__chevron {
  width: 18px;
  height: 18px;
  color: rgba(248, 250, 252, 0.65);
  transition: transform 0.18s ease;
}

.social-button:hover:not(:disabled) .social-button__chevron {
  transform: translateX(1px);
}

.social-button--google {
  background: linear-gradient(
      135deg,
      rgba(251, 146, 60, 0.32),
      rgba(248, 250, 252, 0) 68%
    ),
    rgba(15, 23, 42, 0.8);
  border-color: rgba(251, 146, 60, 0.45);
}

.social-button--google .social-button__icon {
  background: linear-gradient(135deg, #fde68a, #fb923c);
  color: #111827;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.2),
    0 14px 28px -16px rgba(251, 146, 60, 0.8);
}

.social-button--github {
  background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.22),
      rgba(15, 23, 42, 0) 60%
    ),
    rgba(15, 23, 42, 0.85);
  border-color: rgba(96, 165, 250, 0.32);
}

.social-button--github .social-button__icon {
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: #f8fafc;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.25),
    0 14px 32px -18px rgba(59, 130, 246, 0.7);
}

.social-card__footnote {
  position: relative;
  margin-top: 1.3rem;
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.76);
}

.social-card__error {
  margin-top: 0.8rem;
  border-radius: 0.95rem;
  border: 1px solid rgba(248, 113, 113, 0.35);
  background: rgba(248, 113, 113, 0.1);
  padding: 0.55rem 0.9rem;
  font-size: 0.78rem;
  color: #fecaca;
}

.login-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 0.35rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.login-switch__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.8rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.72);
  transition: background-color 0.18s ease, color 0.18s ease,
    box-shadow 0.18s ease;
}

.login-switch__item--active {
  background: rgba(248, 250, 252, 0.08);
  color: #f8fafc;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field label {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.86);
}

.field input {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.55);
  padding: 0.85rem 1rem;
  font-size: 0.88rem;
  color: #f8fafc;
  transition: border-color 0.18s ease, box-shadow 0.18s ease,
    background 0.18s ease;
}

.field input:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.65);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
  background: rgba(15, 23, 42, 0.75);
}

.color-picker {
  height: 2.8rem;
  padding: 0.2rem;
  cursor: pointer;
}

.login-form__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.65);
}

.remember {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.remember input {
  width: auto;
  border-radius: 0.6rem;
  cursor: pointer;
}

.forgot {
  color: #818cf8;
}

.form-error,
.form-success {
  border-radius: 0.9rem;
  padding: 0.6rem 0.9rem;
  font-size: 0.78rem;
  border: 1px solid transparent;
}

.form-error {
  border-color: rgba(248, 113, 113, 0.3);
  background: rgba(248, 113, 113, 0.12);
  color: #fecaca;
}

.form-success {
  border-color: rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.12);
  color: #bbf7d0;
}

.primary-button {
  width: 100%;
  border: none;
  border-radius: 1rem;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  padding: 0.95rem 1.4rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  box-shadow: 0 24px 40px -28px rgba(99, 102, 241, 0.7);
  transition: transform 0.18s ease, box-shadow 0.18s ease,
    opacity 0.18s ease;
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 32px 48px -28px rgba(79, 70, 229, 0.55);
}

.primary-button:disabled {
  opacity: 0.8;
  cursor: not-allowed;
  box-shadow: 0 16px 26px -24px rgba(99, 102, 241, 0.4);
}

.login-terms {
  font-size: 0.72rem;
  color: rgba(148, 163, 184, 0.7);
  text-align: center;
}

.login-terms a {
  color: #818cf8;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section--alt {
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 2rem;
  padding: 2.5rem;
}

.info-section__header {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  text-align: left;
}

.info-section__header h2 {
  font-size: clamp(1.6rem, 3.2vw, 2.2rem);
  font-weight: 600;
  color: #f8fafc;
}

.info-section__header p {
  max-width: 46rem;
  color: rgba(226, 232, 240, 0.7);
  font-size: 0.95rem;
}

.info-grid {
  display: grid;
  gap: 1.4rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.info-grid--security {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.info-card {
  border-radius: 1.4rem;
  padding: 1.4rem;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-height: 160px;
}

.info-card h3 {
  font-size: 1.05rem;
  font-weight: 600;
  color: #f8fafc;
}

.info-card p {
  font-size: 0.88rem;
  color: rgba(226, 232, 240, 0.68);
}

.plan-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.plan-card {
  border-radius: 1.5rem;
  padding: 1.6rem;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.plan-card--highlight {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.18), rgba(15, 23, 42, 0.6));
  border-color: rgba(251, 146, 60, 0.35);
  box-shadow: 0 32px 80px -48px rgba(251, 146, 60, 0.35);
}

.plan-card h3 {
  font-size: 1.05rem;
  font-weight: 600;
  color: #f8fafc;
}

.plan-price {
  font-size: 2rem;
  font-weight: 700;
  color: #fb923c;
}

.plan-card ul {
  display: grid;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.7);
}

.faq-preview {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.faq-grid {
  display: grid;
  gap: 1.3rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.faq-card {
  border-radius: 1.4rem;
  padding: 1.6rem;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.faq-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
}

.faq-card p {
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.68);
}

.login-footer {
  position: relative;
  z-index: 1;
  margin: 4rem auto 2.5rem;
  max-width: 1180px;
  padding: 1.6rem 1.2rem;
  border-radius: 1.5rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  text-align: center;
  font-size: 0.8rem;
  color: rgba(226, 232, 240, 0.6);
}

.login-footer__links {
  display: inline-flex;
  gap: 1.2rem;
}

.login-footer__links a {
  color: rgba(226, 232, 240, 0.7);
}

@media (min-width: 768px) {
  .login-nav {
    display: flex;
  }

  .login-demo {
    display: inline-flex;
  }

  .login-menu {
    display: none;
  }

  .login-hero {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    align-items: center;
  }
}

@media (max-width: 1023px) {
  .login-card {
    grid-template-columns: minmax(0, 1fr);
  }

  .login-card__left {
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  }

  .login-card__visual {
    position: static;
    width: 12rem;
    align-self: flex-end;
    margin-top: 1.2rem;
  }

  .login-card__glow {
    display: none;
  }
}

@media (max-width: 640px) {
  .login-header__inner {
    padding: 0.8rem 1.1rem;
    gap: 0.75rem;
  }

  .login-brand__label {
    font-size: 0.82rem;
  }

  .login-main {
    padding-top: 7rem;
    gap: 4rem;
  }

  .login-card__right {
    padding: 1.6rem 1.4rem;
  }

  .login-card__right-headline {
    flex-direction: column;
    align-items: flex-start;
  }

  .login-card__avatar {
    align-self: flex-end;
  }

  .social-card {
    padding: 1.35rem;
  }

  .login-switch {
    padding: 0.25rem;
  }
}
</style>
