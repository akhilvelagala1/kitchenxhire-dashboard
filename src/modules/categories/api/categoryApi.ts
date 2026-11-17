import { apiClient } from '@/shared/api/apiClient';
import type { Job, ListQuery } from '@/shared/api/types';
import type { Option } from '@/shared/components/AsyncSelect';
import type { Category, CategoryFormValues } from '../schemas/category';
import { toCategoryPayload } from '../schemas/category';

const BASE = '/catalog/categories';

export const categoryApi = {
  list: (q: ListQuery) => apiClient.list<Category>(BASE, q),
  get: (id: string) => apiClient.get<Category>(`${BASE}/${id}`),
  create: (v: CategoryFormValues) =>
    apiClient.post<Category>(BASE, toCategoryPayload(v), { idempotencyKey: crypto.randomUUID() }),
  /** `version` guards against two admins overwriting each other (409 on conflict). */
  update: (id: string, version: number, v: CategoryFormValues) =>
    apiClient.patch<Category>(`${BASE}/${id}`, { ...toCategoryPayload(v), version }),
  softDelete: (id: string, reason: string | undefined) =>
    apiClient.post<void>(`${BASE}/${id}/archive`, { reason }),
  restore: (id: string) => apiClient.post<void>(`${BASE}/${id}/restore`),
  bulk: (
    action: 'ARCHIVE' | 'RESTORE' | 'ACTIVATE' | 'DEACTIVATE',
    ids: string[],
    reason?: string
  ) => apiClient.post<{ affected: number }>(`${BASE}/bulk-actions`, { action, ids, reason }),
  options: async (search: string): Promise<Option[]> => {
    const page = await apiClient.list<Category>(BASE, {
      page: 1,
      page_size: 20,
      search,
      status: 'ACTIVE'
    });
    return page.items.map((c) => ({
      value: c.id,
      label: c.parent_name ? `${c.parent_name} › ${c.name}` : c.name
    }));
  },
  templateUrl: `${BASE}/imports/template`,
  import: (file: File, opts: { dryRun: boolean }) =>
    apiClient.upload<Job>(`${BASE}/imports`, file, { dry_run: String(opts.dryRun) }),
  export: (q: ListQuery) =>
    apiClient.post<Job>(`${BASE}/exports`, { ...q, page: undefined, page_size: undefined })
};
