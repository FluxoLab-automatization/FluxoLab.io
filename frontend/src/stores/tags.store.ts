import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Tag } from '../types/api';
import {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  searchTags,
  fetchPopularTags,
  validateTagName,
  type CreateTagPayload,
  type UpdateTagPayload,
} from '../services/tags.service';

export const useTagsStore = defineStore('tags', () => {
  // State
  const tags = ref<Tag[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref({
    page: 1,
    limit: 20,
    search: '',
    sortBy: 'usageCount' as 'name' | 'usageCount' | 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const total = ref(0);
  const selectedTag = ref<Tag | null>(null);
  const popularTags = ref<Tag[]>([]);

  // Getters
  const tagsByColor = computed(() => {
    const colorMap = new Map<string, Tag[]>();
    tags.value.forEach(tag => {
      if (!colorMap.has(tag.color)) {
        colorMap.set(tag.color, []);
      }
      colorMap.get(tag.color)!.push(tag);
    });
    return colorMap;
  });

  const mostUsedTags = computed(() => {
    return [...tags.value].sort((a, b) => b.usageCount - a.usageCount).slice(0, 10);
  });

  const recentlyCreatedTags = computed(() => {
    return [...tags.value].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 10);
  });

  const searchResults = computed(() => {
    if (!filters.value.search) return tags.value;
    return tags.value.filter(tag =>
      tag.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      tag.description?.toLowerCase().includes(filters.value.search.toLowerCase())
    );
  });

  const hasMorePages = computed(() => {
    return tags.value.length < total.value;
  });

  const availableColors = computed(() => {
    const usedColors = new Set(tags.value.map(tag => tag.color));
    const defaultColors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e', '#6b7280', '#374151', '#111827'
    ];
    return defaultColors.filter(color => !usedColors.has(color));
  });

  // Actions
  async function fetchTagsList(token: string, reset = false) {
    if (reset) {
      tags.value = [];
      filters.value.page = 1;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await fetchTags(token, {
        page: filters.value.page,
        limit: filters.value.limit,
        search: filters.value.search,
        sortBy: filters.value.sortBy,
        sortOrder: filters.value.sortOrder,
      });

      if (reset) {
        tags.value = response.tags;
      } else {
        tags.value.push(...response.tags);
      }

      total.value = response.total;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar tags';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loadMoreTags(token: string) {
    if (loading.value || !hasMorePages.value) return;

    filters.value.page += 1;
    await fetchTagsList(token, false);
  }

  async function refreshTags(token: string) {
    await fetchTagsList(token, true);
  }

  async function searchTagsList(token: string, query: string) {
    filters.value.search = query;
    filters.value.page = 1;
    await fetchTagsList(token, true);
  }

  async function sortTags(token: string, sortBy: 'name' | 'usageCount' | 'createdAt', sortOrder: 'asc' | 'desc') {
    filters.value.sortBy = sortBy;
    filters.value.sortOrder = sortOrder;
    filters.value.page = 1;
    await fetchTagsList(token, true);
  }

  async function createNewTag(token: string, payload: CreateTagPayload) {
    loading.value = true;
    error.value = null;

    try {
      const response = await createTag(token, payload);
      tags.value.unshift(response.tag);
      total.value += 1;
      return response.tag;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar tag';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateExistingTag(token: string, tagId: string, payload: UpdateTagPayload) {
    loading.value = true;
    error.value = null;

    try {
      const response = await updateTag(token, tagId, payload);
      const index = tags.value.findIndex(t => t.id === tagId);
      if (index !== -1) {
        tags.value[index] = response.tag;
      }
      return response.tag;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar tag';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteExistingTag(token: string, tagId: string) {
    loading.value = true;
    error.value = null;

    try {
      await deleteTag(token, tagId);
      const index = tags.value.findIndex(t => t.id === tagId);
      if (index !== -1) {
        tags.value.splice(index, 1);
        total.value -= 1;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar tag';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function searchTagsByName(token: string, query: string, limit = 10) {
    if (!query.trim()) return [];

    try {
      return await searchTags(token, query, limit);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar tags';
      throw err;
    }
  }

  async function loadPopularTags(token: string, limit = 10) {
    loading.value = true;
    error.value = null;

    try {
      popularTags.value = await fetchPopularTags(token, limit);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar tags populares';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function validateTagNameAvailability(token: string, name: string, excludeId?: string) {
    try {
      return await validateTagName(token, name, excludeId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao validar nome da tag';
      throw err;
    }
  }

  function selectTag(tag: Tag | null) {
    selectedTag.value = tag;
  }

  function getTagById(tagId: string) {
    return tags.value.find(tag => tag.id === tagId);
  }

  function getTagsByIds(tagIds: string[]) {
    return tags.value.filter(tag => tagIds.includes(tag.id));
  }

  function clearError() {
    error.value = null;
  }

  function resetFilters() {
    filters.value = {
      page: 1,
      limit: 20,
      search: '',
      sortBy: 'usageCount',
      sortOrder: 'desc',
    };
  }

  function reset() {
    tags.value = [];
    loading.value = false;
    error.value = null;
    total.value = 0;
    selectedTag.value = null;
    popularTags.value = [];
    resetFilters();
  }

  return {
    // State
    tags,
    loading,
    error,
    filters,
    total,
    selectedTag,
    popularTags,

    // Getters
    tagsByColor,
    mostUsedTags,
    recentlyCreatedTags,
    searchResults,
    hasMorePages,
    availableColors,

    // Actions
    fetchTagsList,
    loadMoreTags,
    refreshTags,
    searchTagsList,
    sortTags,
    createNewTag,
    updateExistingTag,
    deleteExistingTag,
    searchTagsByName,
    loadPopularTags,
    validateTagNameAvailability,
    selectTag,
    getTagById,
    getTagsByIds,
    clearError,
    resetFilters,
    reset,
  };
});
