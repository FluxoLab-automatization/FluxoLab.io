import { createRouter, createWebHistory } from 'vue-router';
import { useSessionStore } from '../stores/session.store';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/fluxo_lab_automatizacao/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { guest: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue'),
      meta: { guest: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workflows/projects',
      alias: ['/workflows/new'],
      name: 'workflow-builder',
      component: () => import('../views/WorkflowBuilderView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workflows/projects/:id',
      name: 'workflow-edit',
      component: () => import('../views/WorkflowBuilderView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workflows',
      redirect: { name: 'workflow-builder' },
      meta: { requiresAuth: true },
    },
    {
      path: '/docs',
      name: 'docs',
      component: () => import('../views/DocumentationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings/:section?',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

let bootstrapPromise: Promise<void> | null = null;

router.beforeEach(async (to) => {
  console.log('Router guard: navigating to', to.name, to.path);

  const session = useSessionStore();

  if (!session.initialized) {
    console.log('Session not initialized, initializing...');
    bootstrapPromise ??= session.initialize();
    await bootstrapPromise;
    bootstrapPromise = null;
  }

  console.log('Session state:', {
    isAuthenticated: session.isAuthenticated,
    hasToken: Boolean(session.token),
    hasUser: Boolean(session.user)
  });

  // Se não está autenticado e tenta acessar rota protegida, redireciona para login
  if (to.meta.requiresAuth && !session.isAuthenticated) {
    console.log('Redirecting to login - requires auth but not authenticated');
    return {
      name: 'login',
      query: to.fullPath ? { redirect: to.fullPath } : undefined,
    };
  }

  // Se está autenticado e tenta acessar rota de guest (home/login), redireciona para dashboard
  if (to.meta.guest && session.isAuthenticated && to.name !== 'home') {
    console.log('Redirecting to dashboard - authenticated user accessing guest route');
    return { name: 'dashboard' };
  }

  console.log('Allowing navigation to', to.name);
  return true;
});

export default router;
