import { Search } from 'lucide-react';
import { SearchInput } from '@/shared/components/SearchInput';
import { cn } from '@/shared/lib/cn';
import { CATEGORY_STATUSES, CATEGORY_STATUS_LABELS } from '../schemas/adminCategoryRole';
import type { CategoriesPageParams } from './categoriesPageParams';
import { LIST_FIELD, ListFilterSelect } from './ListFilterSelect';

export type CategoryParamChanges = Record<string, string | undefined>;

/** Pill shape and 40 design px height from lg, for both the search box and the status select. */
const PILL = 'lg:h-[calc(40*var(--u))] lg:rounded-full lg:text-[calc(14*var(--u))]';

/**
 * The search box and the status select. Every change goes to the URL through `onPatch`, which also
 * drops the page. `resetKey` remounts the search box so "Clear filters" empties the text as well.
 */
export function CategoriesToolbar({
  params: p,
  resetKey,
  onPatch
}: {
  params: CategoriesPageParams;
  resetKey: number;
  onPatch: (changes: CategoryParamChanges) => void;
}) {
  return (
    <div
      role="search"
      className="mt-3 flex flex-wrap items-center gap-2 lg:mt-[calc(23*var(--u))] lg:flex-nowrap lg:gap-[calc(10*var(--u))]"
    >
      <div className="relative min-w-[200px] flex-1 lg:w-[calc(430*var(--u))] lg:flex-none">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-600"
        />
        <SearchInput
          key={resetKey}
          label="Search categories"
          placeholder="Search category name or code..."
          value={p.q}
          onChange={(value) => onPatch({ q: value || undefined })}
          className={cn('truncate pl-10!', LIST_FIELD, PILL)}
        />
      </div>
      <ListFilterSelect
        label="Filter by status"
        value={p.status}
        onChange={(value) => onPatch({ status: value === 'all' ? undefined : value })}
        className="lg:w-[calc(174*var(--u))] lg:[&_select]:h-[calc(40*var(--u))] lg:[&_select]:rounded-full lg:[&_select]:pl-[calc(16*var(--u))] lg:[&_select]:text-[calc(14*var(--u))]"
      >
        <option value="all">All Status</option>
        {CATEGORY_STATUSES.map((status) => (
          <option key={status} value={status}>
            {CATEGORY_STATUS_LABELS[status]}
          </option>
        ))}
      </ListFilterSelect>
    </div>
  );
}
