import { apiFetch } from './api';
import type {
  WorkspaceOverviewResponse,
  WorkspaceOverview,
} from '../types/api';

export async function fetchWorkspaceOverview(
  token: string,
  params: { limit?: number } = {},
): Promise<WorkspaceOverview> {
  const searchParams = new URLSearchParams();
  if (params.limit) {
    searchParams.set('limit', String(params.limit));
  }

  const query = searchParams.toString();
  const url = `/workspace/overview${query ? `?${query}` : ''}`;

  const { overview } = await apiFetch<WorkspaceOverviewResponse>(url, {
    method: 'GET',
    token,
  });

  return overview;
}
export async function createWorkspaceProject(
  token: string,
  payload: {
    title: string;
    description?: string;
    tags?: string[];
    status?: string;
    icon?: string;
  },
) {
  return apiFetch<{ status: string; project: WorkspaceOverview['projects'][number] }>(
    '/workspace/projects',
    {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    },
  );
}

