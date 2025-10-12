<script setup lang="ts">
import type { FlowCapability } from '../../constants/flow';

const props = defineProps<{
  capabilities: FlowCapability[];
}>();
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2">
    <article
      v-for="capability in props.capabilities"
      :key="capability.id"
      class="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      :class="capability.highlight ? 'ring-1 ring-indigo-200' : ''"
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-800">
            {{ capability.title }}
          </h3>
          <p class="text-xs text-slate-500">
            {{ capability.description }}
          </p>
        </div>
        <span
          class="flex h-12 w-12 items-center justify-center rounded-2xl border text-xs font-semibold uppercase text-slate-600"
          :style="{ borderColor: capability.accent, color: capability.accent }"
        >
          {{ capability.icon }}
        </span>
      </div>
    </article>
  </section>
</template>
