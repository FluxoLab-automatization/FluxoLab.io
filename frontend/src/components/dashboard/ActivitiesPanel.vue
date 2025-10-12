<script setup lang="ts">
import type { Activity } from '../../types/api';

const props = defineProps<{
  activities: Activity[];
}>();

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
</script>

<template>
  <section class="rounded-3xl border border-slate-200 bg-white shadow-sm">
    <header class="border-b border-slate-200 px-6 py-4">
      <h2 class="text-base font-semibold text-slate-800">Atividades recentes</h2>
      <p class="text-xs text-slate-500">Histórico das últimas ações registradas.</p>
    </header>

    <div class="max-h-96 overflow-y-auto px-6 py-5 space-y-4">
      <article
        v-for="activity in props.activities"
        :key="activity.id"
        class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
      >
        <div class="flex-shrink-0 rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-600 uppercase">
          {{ activity.entityType }}
        </div>
        <div class="space-y-1">
          <p class="font-medium text-slate-800">
            {{ activity.action }}
          </p>
          <p class="text-xs text-slate-500">
            {{ formatDate(activity.createdAt) }}
          </p>
        </div>
      </article>

      <p v-if="!props.activities.length" class="text-center text-sm text-slate-500">
        Nenhuma atividade encontrada. Os eventos aparecerão aqui.
      </p>
    </div>
  </section>
</template>
