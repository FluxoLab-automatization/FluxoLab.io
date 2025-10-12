<script setup lang="ts">
import { computed } from 'vue';
import type { OnboardingBlock, Project } from '../../types/api';

const props = defineProps<{
  projects: Project[];
  onboarding: OnboardingBlock[];
}>();

const hasProjects = computed(() => props.projects.length > 0);
const checklist = computed(() => props.onboarding[0] ?? null);
</script>

<template>
  <section class="rounded-3xl border border-slate-200 bg-white shadow-sm">
    <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
      <div>
        <h2 class="text-base font-semibold text-slate-800">Projetos recentes</h2>
        <p class="text-xs text-slate-500">Fluxos criados pelos seus times.</p>
      </div>
      <button
        type="button"
        class="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
      >
        Criar novo fluxo
      </button>
    </header>

    <div v-if="hasProjects" class="grid gap-4 px-6 py-6 lg:grid-cols-2">
      <article
        v-for="project in projects"
        :key="project.id"
        class="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-sm font-semibold text-slate-800">
              {{ project.title }}
            </h3>
            <p class="text-xs uppercase tracking-wide text-slate-400">
              {{ project.status }}
            </p>
          </div>
          <span class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">
            {{ new Date(project.updatedAt).toLocaleDateString('pt-BR') }}
          </span>
        </div>
        <p
          v-if="project.metadata && 'description' in project.metadata"
          class="mt-3 text-sm text-slate-600"
        >
          {{ project.metadata.description as string }}
        </p>
        <div
          v-if="project.metadata && 'tags' in project.metadata"
          class="mt-4 flex flex-wrap gap-2"
        >
          <span
            v-for="tag in (project.metadata.tags as string[] | undefined) ?? []"
            :key="tag"
            class="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
          >
            {{ tag }}
          </span>
        </div>
      </article>
    </div>

    <div v-else class="px-6 py-8 text-center">
      <p class="text-sm text-slate-600">
        Nenhum fluxo criado ainda. Use a checklist abaixo como referência.
      </p>

      <div
        v-if="checklist"
        class="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 px-6 py-5 text-left shadow-sm"
      >
        <h3 class="text-sm font-semibold text-indigo-700">
          {{ checklist.title }}
        </h3>
        <ul class="mt-3 space-y-2 text-sm text-indigo-800">
          <li
            v-for="(step, index) in checklist.steps"
            :key="step"
            class="flex items-start gap-2"
          >
            <span class="mt-0.5 h-2.5 w-2.5 rounded-full bg-indigo-500" />
            <span>{{ index + 1 }}. {{ step }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
