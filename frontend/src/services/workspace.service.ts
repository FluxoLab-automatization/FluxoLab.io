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
