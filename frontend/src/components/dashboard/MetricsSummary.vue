<script setup lang="ts">
import type { WorkspaceMetrics } from '../../types/api';

const props = defineProps<{
  metrics: WorkspaceMetrics;
}>();

const cards = [
  {
    key: 'totalProjects',
    label: 'Projetos ativos',
    description: 'Fluxos criados pelos times.',
    accent: 'from-emerald-400 to-emerald-500',
  },
  {
    key: 'totalWebhooks',
    label: 'Webhooks configurados',
    description: 'Tokens conectados a provedores externos.',
    accent: 'from-indigo-400 to-indigo-500',
  },
  {
    key: 'totalEvents',
    label: 'Eventos recebidos',
    description: 'Mensagens armazenadas nas últimas 24h.',
    accent: 'from-sky-400 to-sky-500',
  },
];
</script>

<template>
  <section class="grid gap-4 md:grid-cols-3">
    <article
      v-for="card in cards"
      :key="card.key"
      class="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {{ card.label }}
      </p>
      <p class="mt-3 text-3xl font-bold text-slate-900">
        {{ props.metrics[card.key as keyof WorkspaceMetrics] ?? 0 }}
      </p>
      <p class="mt-2 text-sm text-slate-500">
        {{ card.description }}
      </p>
      <div
        class="mt-4 flex h-1.5 w-20 rounded-full bg-gradient-to-r"
        :class="card.accent"
        aria-hidden="true"
      />
    </article>
  </section>
</template>
