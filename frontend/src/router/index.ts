import { createRouter, createWebHistory } from 'vue-router';
import { useSessionStore } from '../stores/session.store';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
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
  const session = useSessionStore();

  if (!session.initialized) {
    bootstrapPromise ??= session.initialize();
    await bootstrapPromise;
    bootstrapPromise = null;
  }

  if (to.meta.requiresAuth && !session.isAuthenticated) {
    return {
      name: 'login',
      query: to.fullPath ? { redirect: to.fullPath } : undefined,
    };
  }

  if (to.meta.guest && session.isAuthenticated) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
