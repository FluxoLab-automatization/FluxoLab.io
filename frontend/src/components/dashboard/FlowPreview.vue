<script setup lang="ts">
import { computed } from 'vue';
import type { FlowDefinition, FlowEdge, FlowNode } from '../../constants/flow';

const props = defineProps<{
  definition: FlowDefinition;
}>();

const nodeMap = computed(() => {
  const map = new Map<string, FlowNode>();
  props.definition.nodes.forEach((node) => {
    map.set(node.id, node);
  });
  return map;
});

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function anchorPosition(node: FlowNode, anchor?: FlowEdge['fromAnchor']) {
  const offset = 6;
  switch (anchor) {
    case 'left':
      return { x: clamp(node.x - offset, 0, 100), y: node.y };
    case 'right':
      return { x: clamp(node.x + offset, 0, 100), y: node.y };
    case 'top':
      return { x: node.x, y: clamp(node.y - offset, 0, 100) };
    case 'bottom':
      return { x: node.x, y: clamp(node.y + offset, 0, 100) };
    default:
      return { x: node.x, y: node.y };
  }
}

const connectors = computed(() =>
  props.definition.edges
    .map((edge) => {
      const from = nodeMap.value.get(edge.from);
      const to = nodeMap.value.get(edge.to);
      if (!from || !to) {
        return null;
      }
      const start = anchorPosition(from, edge.fromAnchor);
      const end = anchorPosition(to, edge.toAnchor);
      return {
        id: `${edge.from}-${edge.to}`,
        ...edge,
        start,
        end,
      };
    })
    .filter(Boolean) as Array<
      FlowEdge & {
        id: string;
        start: { x: number; y: number };
        end: { x: number; y: number };
      }
    >,
);

function nodeClasses(node: FlowNode) {
  const base =
    'flow-node absolute flex min-w-[180px] max-w-[240px] -translate-x-1/2 -translate-y-1/2 gap-3 rounded-2xl border border-indigo-200/40 bg-slate-900/80 px-4 py-3 text-left shadow-lg backdrop-blur';
  const variants: Record<FlowNode['type'], string> = {
    trigger: 'border-cyan-400/40',
    agent: 'border-indigo-200/50',
    decision: 'border-sky-300/50',
    action:
      'border-amber-200/60 shadow-[0_20px_30px_-20px_rgba(251,191,36,0.45)]',
    integration: 'border-slate-500/40 border-dashed opacity-90',
  };
  return `${base} ${variants[node.type] ?? ''}`;
}
</script>

<template>
  <section
    class="relative overflow-hidden rounded-3xl border border-indigo-500/40 bg-slate-900 text-slate-200 shadow-inner"
  >
    <div
      class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),_transparent_65%)]"
    />
    <div class="relative space-y-6 p-6">
      <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-lg font-semibold">Mapa do fluxo atual</h2>
          <p class="text-sm text-slate-400">
            Visualize como cada etapa compartilha dados com a próxima fase.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-indigo-500/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Simular execução
        </button>
      </header>

      <div class="relative h-[460px] rounded-2xl border border-indigo-500/40 bg-slate-900/70">
        <svg class="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
          <g v-for="connector in connectors" :key="connector.id">
            <line
              :x1="connector.start.x"
              :y1="connector.start.y"
              :x2="connector.end.x"
              :y2="connector.end.y"
              :stroke="connector.style === 'dashed' ? 'rgba(129,140,248,0.45)' : 'rgba(199,210,254,0.75)'"
              :stroke-width="2.2"
              :stroke-dasharray="connector.style === 'dashed' ? '6 6' : undefined"
            />
            <text
              :x="(connector.start.x + connector.end.x) / 2"
              :y="(connector.start.y + connector.end.y) / 2 - 1"
              class="fill-indigo-100 text-[1.6px]"
              text-anchor="middle"
            >
              {{ connector.label }}
            </text>
          </g>
        </svg>

        <div
          v-for="node in props.definition.nodes"
          :key="node.id"
          :style="{ left: `${node.x}%`, top: `${node.y}%` }"
          :class="nodeClasses(node)"
        >
          <div
            class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border text-xs font-semibold uppercase"
            :style="{ borderColor: node.accent, color: node.accent }"
            aria-hidden="true"
          >
            {{ node.icon }}
          </div>
          <div class="space-y-1">
            <p class="text-sm font-semibold text-slate-100">{{ node.title }}</p>
            <p class="text-xs text-slate-300">{{ node.subtitle }}</p>
            <div v-if="node.badges?.length" class="flex flex-wrap gap-1 pt-1">
              <span
                v-for="badge in node.badges"
                :key="badge"
                class="rounded-full bg-indigo-400/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-indigo-100"
              >
                {{ badge }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <footer class="grid gap-4 md:grid-cols-2">
        <article
          v-for="(step, index) in props.definition.steps"
          :key="step.title"
          class="flex items-start gap-4 rounded-2xl border border-indigo-500/30 bg-slate-900/60 px-4 py-3"
        >
          <span
            class="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-sm font-semibold text-indigo-100"
          >
            {{ index + 1 }}
          </span>
          <div class="space-y-1 text-sm">
            <p class="font-semibold text-slate-100">{{ step.title }}</p>
            <p class="text-slate-300">{{ step.description }}</p>
            <ul class="mt-2 list-disc pl-4 text-xs text-slate-400">
              <li v-for="output in step.outputs" :key="output">{{ output }}</li>
            </ul>
          </div>
        </article>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.flow-node {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.flow-node:hover {
  transform: translate(-50%, -50%) translateY(-4px);
}
</style>
