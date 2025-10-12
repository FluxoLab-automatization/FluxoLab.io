<script setup lang="ts">
import {
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  type ComponentPublicInstance,
} from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const sections = [
  { id: 'inicio', label: 'Início' },
  { id: 'solucoes', label: 'Soluções' },
  { id: 'beneficios', label: 'Benefícios' },
  { id: 'sobre', label: 'Quem somos' },
  { id: 'contato', label: 'Contato' },
] as const;

const solutions = [
  {
    emoji: '🤖',
    title: 'Automação de Processos (RPA)',
    description:
      'Mapeamos e automatizamos tarefas repetitivas para sua equipe focar no que gera valor.',
  },
  {
    emoji: '🔗',
    title: 'Integração de Sistemas (API)',
    description:
      'Conectamos CRMs, ERPs e plataformas proprietárias para manter dados sempre sincronizados.',
  },
  {
    emoji: '📊',
    title: 'Insights e Relatórios',
    description:
      'Transforme dados em decisões com painéis interativos e relatórios automáticos.',
  },
] as const;

const benefits = [
  { emoji: '⚡', label: 'Produtividade exponencial' },
  { emoji: '🛡️', label: 'Redução de erros operacionais' },
  { emoji: '📈', label: 'Tomada de decisão orientada a dados' },
  { emoji: '✅', label: 'Governança e conformidade' },
] as const;

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://instagram.com',
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/fluxolab',
  },
] as const;

const revealElements = reactive<Array<Element | ComponentPublicInstance | null>>([]);
let observer: IntersectionObserver | null = null;
const currentYear = new Date().getFullYear();

function resolveElement(el: Element | ComponentPublicInstance | null): HTMLElement | null {
  if (!el) return null;
  if (el instanceof HTMLElement) return el;
  const component = el as ComponentPublicInstance;
  const element = component.$el;
  return element instanceof HTMLElement ? element : null;
}

function registerRevealRef(el: Element | ComponentPublicInstance | null) {
  const element = resolveElement(el);
  if (element && !revealElements.includes(element)) {
    revealElements.push(element);
  }
}

function setupObserver() {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 },
  );

  revealElements.forEach((el) => {
    const element = resolveElement(el);
    if (element) observer?.observe(element);
  });
}

onMounted(() => {
  setupObserver();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});

function smoothScroll(id: (typeof sections)[number]['id']) {
  const element = document.getElementById(id);
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goToContact() {
  smoothScroll('contato');
}

function goToLogin() {
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="page">
    <header class="header">
      <nav class="header__nav container">
        <a class="logo" href="#" @click.prevent="smoothScroll('inicio')">FluxoLab</a>
        <ul class="nav-menu">
          <li v-for="section in sections" :key="section.id">
            <button type="button" @click="smoothScroll(section.id)">
              {{ section.label }}
            </button>
          </li>
        </ul>
        <div class="header__actions">
          <button type="button" class="header__login" @click="goToLogin">Entrar</button>
          <button type="button" class="cta-button" @click="goToContact">
            Agendar demonstração
          </button>
        </div>
      </nav>
    </header>

    <main>
      <section id="inicio" class="hero-section container">
        <div class="hero-card animate-on-scroll" :ref="registerRevealRef">
          <p class="hero-eyebrow">AUTOMAÇÃO INTELIGENTE</p>
          <h1>
            FluxoLab acelera a transformação digital com experiências controladas ponta a ponta.
          </h1>
          <p class="hero-subtitle">
            Orquestre bots, dados e pessoas em fluxos visuais com integrações prontas para uso.
            Menos fricção, mais performance.
          </p>
          <div class="hero-actions">
            <button type="button" class="cta-button cta-button--solid" @click="goToLogin">
              Acessar plataforma
            </button>
            <button type="button" class="cta-button cta-button--ghost" @click="goToContact">
              Falar com especialista
            </button>
          </div>
        </div>
        <div class="hero-visual animate-on-scroll" :ref="registerRevealRef">
          <div class="hero-visual__orb" aria-hidden="true" />
          <div class="hero-visual__content">
            <span>Pipeline ativo</span>
            <strong>+184 eventos processados</strong>
            <p>Orquestrações monitoradas em tempo real</p>
          </div>
        </div>
      </section>

      <section id="solucoes" class="solutions-section container">
        <header class="section-header animate-on-scroll" :ref="registerRevealRef">
          <h2>Tudo o que você precisa para automação omnichannel</h2>
          <p>
            Da descoberta à operação contínua: FluxoLab conecta histórias de bots com times humanos,
            APIs e dados inteligentes.
          </p>
        </header>

        <div class="solutions-grid">
          <article
            v-for="solution in solutions"
            :key="solution.title"
            class="solutions-card animate-on-scroll"
            :ref="registerRevealRef"
          >
            <span class="solutions-card__emoji" aria-hidden="true">
              {{ solution.emoji }}
            </span>
            <h3>{{ solution.title }}</h3>
            <p>{{ solution.description }}</p>
          </article>
        </div>
      </section>

      <section id="beneficios" class="benefits-section container">
        <header class="section-header animate-on-scroll" :ref="registerRevealRef">
          <h2>Dores solucionadas com FluxoLab</h2>
          <p>
            Mais eficiência operacional, visibilidade de ponta a ponta e times focados no que faz
            diferença.
          </p>
        </header>

        <div class="benefits-grid">
          <div
            v-for="benefit in benefits"
            :key="benefit.label"
            class="benefit-card animate-on-scroll"
            :ref="registerRevealRef"
          >
            <span class="benefit-card__emoji" aria-hidden="true">{{ benefit.emoji }}</span>
            <span>{{ benefit.label }}</span>
          </div>
        </div>
      </section>

      <section id="sobre" class="about-section container">
        <div class="about-grid">
          <article class="about-content animate-on-scroll" :ref="registerRevealRef">
            <h2>Quem somos</h2>
            <p>
              Unimos especialistas em CX, tecnologia e ciência de dados para construir experiências
              automatizadas com cara de conversa humana. Nascemos para simplificar operações complexas
              e gerar valor contínuo para times de atendimento, marketing e produto.
            </p>
            <p>
              Nossa plataforma permite prototipar, lançar e evoluir fluxos conversacionais com governança,
              segurança e integrações pré-configuradas. Tudo em um só lugar — do webhook ao insight.
            </p>
          </article>
          <aside class="about-highlight animate-on-scroll" :ref="registerRevealRef">
            <h3>Nossa cultura</h3>
            <ul>
              <li><strong>Co-criação:</strong> entregamos junto com o cliente.</li>
              <li><strong>Escalabilidade:</strong> arquitetura preparada para crescer.</li>
              <li><strong>Dados em ação:</strong> decisões com base em telemetria.</li>
            </ul>
            <button type="button" class="cta-button cta-button--ghost" @click="goToContact">
              Fale com o time FluxoLab
            </button>
          </aside>
        </div>
      </section>

      <section id="contato" class="contact-section container">
        <header class="section-header animate-on-scroll" :ref="registerRevealRef">
          <h2>Vamos construir seu próximo fluxo?</h2>
          <p>
            Responda algumas perguntas e organizamos uma demonstração personalizada com um especialista FluxoLab.
          </p>
        </header>
        <form class="contact-form animate-on-scroll" :ref="registerRevealRef">
          <div class="form-row">
            <label>
              <span>Nome completo</span>
              <input type="text" name="name" placeholder="Seu nome" required />
            </label>
            <label>
              <span>E-mail corporativo</span>
              <input type="email" name="email" placeholder="voce@empresa.com" required />
            </label>
          </div>
          <label>
            <span>Como podemos ajudar?</span>
            <textarea
              name="message"
              rows="4"
              placeholder="Conte um pouco sobre os desafios do seu time."
              required
            />
          </label>
          <button type="button" class="cta-button cta-button--solid" @click="goToContact">
            Enviar interesse
          </button>
        </form>
      </section>
    </main>

    <footer class="footer">
      <div class="container footer__content">
        <div>
          <span class="logo">FluxoLab</span>
          <p>Automação inteligente para experiências humanas.</p>
          <small>© {{ currentYear }} FluxoLab. Todos os direitos reservados.</small>
        </div>
        <div class="footer__links">
          <h4>Redes sociais</h4>
          <ul>
            <li v-for="social in socialLinks" :key="social.label">
              <a :href="social.href" target="_blank" rel="noopener noreferrer">
                {{ social.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
:global(:root) {
  --landing-bg: #0a192f;
  --landing-surface: #112240;
  --landing-surface-soft: rgba(17, 34, 64, 0.6);
  --landing-primary: #64ffda;
  --landing-primary-soft: rgba(100, 255, 218, 0.12);
  --landing-foreground: #e2e8f0;
  --landing-muted: #8892b0;
  --landing-font-heading: 'Poppins', system-ui, sans-serif;
  --landing-font-body: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.page {
  min-height: 100vh;
  background: radial-gradient(circle at top left, rgba(100, 255, 218, 0.08), transparent 45%),
    radial-gradient(circle at bottom right, rgba(99, 102, 241, 0.1), transparent 50%),
    var(--landing-bg);
  color: var(--landing-foreground);
  font-family: var(--landing-font-body);
}

.container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.header {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(14px);
  background: rgba(10, 25, 47, 0.82);
  border-bottom: 1px solid rgba(100, 255, 218, 0.12);
}

.header__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  gap: 1.5rem;
}

.logo {
  font-family: var(--landing-font-heading);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--landing-primary);
  text-decoration: none;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  list-style: none;
}

.nav-menu button {
  background: transparent;
  border: none;
  color: var(--landing-foreground);
  font-size: 0.95rem;
  padding: 0.35rem 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.nav-menu button:hover {
  color: var(--landing-primary);
}

.header__actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.header__login {
  border: none;
  background: rgba(148, 163, 184, 0.15);
  color: var(--landing-foreground);
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease, color 0.2s ease;
}

.header__login:hover {
  background: rgba(148, 163, 184, 0.3);
}

.cta-button {
  border-radius: 999px;
  border: 1px solid var(--landing-primary);
  background: transparent;
  color: var(--landing-primary);
  padding: 0.65rem 1.6rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.cta-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px -16px rgba(100, 255, 218, 0.6);
  background: var(--landing-primary-soft);
}

.cta-button--solid {
  background: var(--landing-primary);
  color: var(--landing-bg);
  border-color: transparent;
}

.cta-button--solid:hover {
  background: #5aeac9;
}

.cta-button--ghost {
  border-color: rgba(148, 163, 184, 0.35);
  color: var(--landing-foreground);
}

.hero-section {
  padding-top: 10rem;
  padding-bottom: 6rem;
  display: grid;
  gap: 3rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: center;
}

.hero-card {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(100, 255, 218, 0.18);
  border-radius: 28px;
  padding: 2.5rem;
  box-shadow: 0 34px 60px -60px rgba(100, 255, 218, 0.8);
  backdrop-filter: blur(18px);
}

.hero-eyebrow {
  letter-spacing: 0.38em;
  color: rgba(100, 255, 218, 0.7);
  font-size: 0.7rem;
  text-transform: uppercase;
}

.hero-card h1 {
  font-family: var(--landing-font-heading);
  font-size: clamp(2.8rem, 4vw, 3.8rem);
  line-height: 1.1;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  color: var(--landing-muted);
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.hero-visual {
  position: relative;
  padding: 3rem;
  border-radius: 28px;
  background: var(--landing-surface);
  border: 1px solid rgba(148, 163, 184, 0.18);
  overflow: hidden;
}

.hero-visual__orb {
  position: absolute;
  inset: -35% auto auto -10%;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(100, 255, 218, 0.4), transparent 60%);
  filter: blur(20px);
}

.hero-visual__content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--landing-foreground);
}

.hero-visual__content span {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: rgba(148, 163, 184, 0.8);
}

.hero-visual__content strong {
  font-size: 1.6rem;
  font-weight: 600;
}

.section-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 3rem;
}

.section-header h2 {
  font-family: var(--landing-font-heading);
  font-size: clamp(2rem, 3vw, 2.8rem);
  margin-bottom: 1rem;
}

.section-header p {
  color: var(--landing-muted);
  line-height: 1.6;
}

.solutions-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.solutions-card {
  border-radius: 20px;
  padding: 2rem;
  background: rgba(17, 34, 64, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.18);
  transition: transform 0.25s ease, box-shadow 0.3s ease;
  min-height: 220px;
}

.solutions-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 26px 50px -40px rgba(100, 255, 218, 0.8);
}

.solutions-card__emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(100, 255, 218, 0.12);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.solutions-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  font-family: var(--landing-font-heading);
}

.solutions-card p {
  color: var(--landing-muted);
  line-height: 1.5;
}

.benefits-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.benefit-card {
  border-radius: 18px;
  padding: 1.5rem;
  background: rgba(17, 34, 64, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: flex-start;
  min-height: 150px;
}

.benefit-card__emoji {
  font-size: 1.4rem;
}

.about-section {
  padding-top: 6rem;
  padding-bottom: 6rem;
}

.about-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  align-items: start;
}

.about-content {
 	padding: 2.5rem;
  background: rgba(15, 23, 42, 0.72);
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  line-height: 1.7;
  color: var(--landing-muted);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.about-content h2 {
  color: var(--landing-foreground);
  font-family: var(--landing-font-heading);
  font-size: 2rem;
}

.about-highlight {
  padding: 2rem;
  background: rgba(100, 255, 218, 0.08);
  border-radius: 24px;
  border: 1px solid rgba(100, 255, 218, 0.18);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  color: var(--landing-foreground);
}

.about-highlight ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: var(--landing-muted);
}

.contact-section {
  padding-top: 6rem;
  padding-bottom: 6rem;
}

.contact-form {
  border-radius: 28px;
  background: rgba(17, 34, 64, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.18);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

label span {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--landing-foreground);
}

input,
textarea {
  width: 100%;
  background: rgba(10, 25, 47, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 16px;
  padding: 0.9rem 1rem;
  color: var(--landing-foreground);
  font-size: 0.95rem;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

textarea {
  resize: vertical;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--landing-primary);
  box-shadow: 0 0 0 3px rgba(100, 255, 218, 0.2);
}

.footer {
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(10, 25, 47, 0.9);
  padding: 2.5rem 0;
  margin-top: 4rem;
}

.footer__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.footer__content p {
  margin-top: 0.5rem;
  color: var(--landing-muted);
}

.footer__links h4 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.footer__links ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer__links a {
  color: var(--landing-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer__links a:hover {
  color: var(--landing-primary);
}

.animate-on-scroll {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 960px) {
  .nav-menu {
    display: none;
  }

  .header__nav {
    justify-content: space-between;
  }

  .hero-section {
    grid-template-columns: 1fr;
    padding-top: 8rem;
  }
}

@media (max-width: 640px) {
  .header__actions {
    display: none;
  }

  .hero-card,
  .hero-visual {
    padding: 2rem;
  }

  .contact-form {
    padding: 2rem;
  }
}
</style>
