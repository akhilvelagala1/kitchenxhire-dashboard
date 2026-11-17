import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { ListQuery, SortDirection } from '@/shared/api/types';

export const PAGE_SIZES = [25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 25;
const RESERVED = new Set([
  'page',
  'page_size',
  'search',
  'sort',
  'order',
  'from',
  'to',
  'include_deleted'
]);

export interface ListParams {
  query: ListQuery;
  filters: Record<string, string>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (search: string) => void;
  setSort: (sort: string, order: SortDirection) => void;
  setFilter: (key: string, value: string | undefined) => void;
  setDateRange: (from: string | undefined, to: string | undefined) => void;
  setIncludeDeleted: (value: boolean) => void;
  reset: () => void;
}

function toPositiveInt(raw: string | null, fallback: number): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

/**
 * List state lives in the URL so a filtered view can be shared, bookmarked and
 * survives reload (UI-05). Any change other than paging returns to page 1.
 */
export function useListParams(defaults?: { sort?: string; order?: SortDirection }): ListParams {
  const [params, setParams] = useSearchParams();

  const update = useCallback(
    (changes: Record<string, string | undefined>, keepPage = false) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
          if (!keepPage) next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const query = useMemo<ListQuery>(() => {
    const pageSize = toPositiveInt(params.get('page_size'), DEFAULT_PAGE_SIZE);
    return {
      page: toPositiveInt(params.get('page'), 1),
      page_size: (PAGE_SIZES as readonly number[]).includes(pageSize)
        ? pageSize
        : DEFAULT_PAGE_SIZE,
      search: params.get('search') ?? undefined,
      sort: params.get('sort') ?? defaults?.sort,
      order: (params.get('order') as SortDirection | null) ?? defaults?.order,
      from: params.get('from') ?? undefined,
      to: params.get('to') ?? undefined,
      include_deleted: params.get('include_deleted') === 'true' || undefined,
      ...Object.fromEntries([...params.entries()].filter(([k]) => !RESERVED.has(k)))
    };
  }, [params, defaults?.sort, defaults?.order]);

  const filters = useMemo(
    () => Object.fromEntries([...params.entries()].filter(([k]) => !RESERVED.has(k))),
    [params]
  );

  return {
    query,
    filters,
    setPage: (page) => update({ page: page > 1 ? String(page) : undefined }, true),
    setPageSize: (size) => update({ page_size: String(size) }),
    setSearch: (search) => update({ search: search.trim() || undefined }),
    setSort: (sort, order) => update({ sort, order }),
    setFilter: (key, value) => update({ [key]: value }),
    setDateRange: (from, to) => update({ from, to }),
    setIncludeDeleted: (value) => update({ include_deleted: value ? 'true' : undefined }),
    reset: () => setParams(new URLSearchParams(), { replace: true })
  };
}
