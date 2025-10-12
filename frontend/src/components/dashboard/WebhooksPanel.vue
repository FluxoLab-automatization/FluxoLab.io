<script setup lang="ts">
import type { WebhookEvent } from '../../types/api';

const props = defineProps<{
  events: WebhookEvent[];
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
      <h2 class="text-base font-semibold text-slate-800">Eventos de Webhook</h2>
      <p class="text-xs text-slate-500">Últimos payloads recebidos e validados.</p>
    </header>

    <ul class="px-6 py-5 space-y-3">
      <li
        v-for="event in props.events"
        :key="event.id"
        class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="font-medium text-slate-800">
            {{ event.type }}
          </p>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            :class="[
              event.status === 'processed'
                ? 'bg-emerald-100 text-emerald-700'
                : event.status === 'error'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-slate-200 text-slate-600',
            ]"
          >
            {{ event.status }}
          </span>
        </div>
        <p class="mt-2 text-xs text-slate-500">
          {{ formatDate(event.receivedAt) }} · Assinatura
          <strong>{{ event.signatureValid ? 'válida' : 'inválida' }}</strong>
        </p>
      </li>
    </ul>

    <p v-if="!props.events.length" class="px-6 pb-6 text-sm text-slate-500">
      Nenhum evento recebido até o momento.
    </p>
  </section>
</template>
