import { apiFetch } from './api';
import type { SettingsSummaryResponse, SettingsSummary } from '../types/api';

export async function fetchSettingsSummary(
  token: string,
): Promise<SettingsSummary> {
  const { summary } = await apiFetch<SettingsSummaryResponse>(
    '/settings/summary',
    {
      method: 'GET',
      token,
    },
  );

  return summary;
}
