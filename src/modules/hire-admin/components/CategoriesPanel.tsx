import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DataTable } from '@/shared/components/DataTable';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { useRowSelection } from '@/shared/hooks/useRowSelection';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { adminCategoriesApi } from '../api/adminCategoriesApi';
import { adminCategoriesKeys } from '../api/adminCategoriesKeys';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import {
  CATEGORY_STATUS_LABELS,
  type CategoryStatus,
  type HireAdminCategory
} from '../schemas/adminCategoryRole';
import { CategoriesBulkBar } from './CategoriesBulkBar';
import { parseCategoriesSearchParams, toCategoriesListQuery } from './categoriesPageParams';
import { CategoriesToolbar, type CategoryParamChanges } from './CategoriesToolbar';
import { useSetCategoryStatus } from './categoryMutations';
import { buildCategoryColumns } from './categoryTableColumns';
import { jobsCardClass } from './jobsCardStyles';
import { ListPager } from './ListPager';

/*
 * Fine-tuning of the shared DataTable (compact density) for the picture, as selectors on the
 * wrapper so the shared file stays untouched. Row separators sit on the cells and the table uses
 * separate borders, so the header can have rounded ends. From lg the header is 41 design px tall
 * and the rows 55, so five rows fit at 1536x1024 without an inner scrollbar. The pager buttons
 * are tuned the same way: 38x40, and a filled grey for the disabled Previous / Next.
 */
const TABLE_TUNE = [
  '[&_table]:border-separate [&_table]:border-spacing-0',
  '[&_thead_th]:bg-[#F5F6FA] [&_thead_th]:font-bold [&_thead_th]:text-[#1F2937]',
  '[&_thead_th:first-child]:rounded-l-[calc(10*var(--u))] [&_thead_th:last-child]:rounded-r-[calc(10*var(--u))]',
  '[&_tbody_td]:border-t [&_tbody_td]:border-[#EEF0F4] [&_tbody_tr:last-child_td]:border-b',
  'lg:[&_thead_th]:h-[calc(41*var(--u))] lg:[&_thead_th]:text-[calc(11.5*var(--u))] lg:[&_tbody_td]:h-[calc(55*var(--u))]',
  'lg:[&_thead_th:first-child]:w-[calc(42*var(--u))] lg:[&_tbody_td:first-child]:w-[calc(42*var(--u))]'
].join(' ');

const PAGER_TUNE = [
  'lg:[&_nav_button]:h-[calc(40*var(--u))] lg:[&_nav_button]:min-w-[calc(38*var(--u))] lg:[&_nav_button]:rounded-[calc(10*var(--u))]',
  '[&_nav_button:disabled]:border-transparent [&_nav_button:disabled]:bg-[#EEF0F4] [&_nav_button:disabled]:text-[#5B6472] [&_nav_button:disabled]:opacity-100'
].join(' ');

const CLEAR_FILTER_CHANGES: CategoryParamChanges = { q: undefined, status: undefined };
const NO_PAGE_SIZE_PICKER = () => undefined;

interface PendingChange {
  category: HireAdminCategory;
  status: Exclude<CategoryStatus, 'active'>;
}

interface CategoriesPanelProps {
  onAddCategory: () => void;
  onViewCategory: (category: HireAdminCategory) => void;
  onEditCategory: (category: HireAdminCategory) => void;
}

/**
 * The Business Categories card: heading, search and status filter, table, bulk bar and pager.
 * Search, status and page live in the URL. Opening, adding and editing are reported to the page,
 * which owns the dialogs; deactivating and archiving are confirmed here.
 */
export function CategoriesPanel({
  onAddCategory,
  onViewCategory,
  onEditCategory
}: CategoriesPanelProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  // Parsed once per URL change, so everything derived from it stays referentially stable.
  const p = useMemo(() => parseCategoriesSearchParams(searchParams), [searchParams]);
  const query = useMemo(() => toCategoriesListQuery(p), [p]);
  const selection = useRowSelection();
  const setStatus = useSetCategoryStatus();
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [resetPending, setResetPending] = useState(false);
  // "Clear filters" empties the URL first, and the search box is remounted only once that has
  // happened, so it restarts from the empty value instead of from the text still in the old URL.
  if (resetPending && !p.q) {
    setResetPending(false);
    setResetKey((key) => key + 1);
  }

  /** Functional form, so the other params on the page (tab, role) survive. */
  function patchParams(changes: CategoryParamChanges) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([key, value]) =>
          value ? next.set(key, value) : next.delete(key)
        );
        if (!('page' in changes)) next.delete('page');
        return next;
      },
      { replace: true }
    );
  }

  function resetFilters() {
    setResetPending(true);
    patchParams(CLEAR_FILTER_CHANGES);
  }

  function changeStatus(category: HireAdminCategory, status: CategoryStatus) {
    if (status === 'active') setStatus.mutate({ categoryId: category.category_id, status });
    else setPending({ category, status });
  }

  const list = useQuery({
    queryKey: adminCategoriesKeys.list(query),
    queryFn: () => adminCategoriesApi.list(query),
    // Keep the current rows on screen while the next page loads, so the count and pager do not flash.
    placeholderData: keepPreviousData
  });

  // A selection made under one view must not silently apply under another.
  const { clear } = selection;
  const queryText = JSON.stringify(query);
  useEffect(() => {
    clear();
  }, [clear, queryText]);

  // Deactivating or archiving the last row of a filtered last page leaves an empty page: step back.
  const total = list.data?.meta.total;
  const lastPage = Math.max(1, Math.ceil((total ?? 0) / query.page_size));
  useEffect(() => {
    if (total === undefined || p.page <= lastPage) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (lastPage > 1) next.set('page', String(lastPage));
        else next.delete('page');
        return next;
      },
      { replace: true }
    );
  }, [total, lastPage, p.page, setSearchParams]);

  const columns = useMemo(
    () =>
      buildCategoryColumns({
        onView: onViewCategory,
        onEdit: onEditCategory,
        onSetStatus: changeStatus
      }),
    // `changeStatus` only uses stable setters and the mutation's `mutate`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onViewCategory, onEditCategory]
  );

  const hasActive = Boolean(p.q || p.status !== 'all');

  return (
    <section
      aria-label="Business categories"
      className={cn(
        jobsCardClass,
        'flex min-w-0 flex-col p-3 lg:min-h-[calc(559*var(--u))] lg:px-[calc(15*var(--u))] lg:pt-[calc(20*var(--u))] lg:pb-[calc(22*var(--u))]'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-1 lg:px-[calc(8*var(--u))]">
        <div className="min-w-0 lg:-mt-[calc(4*var(--u))]">
          <h2 className="text-lg font-bold text-[#111827] lg:text-[calc(20*var(--u))]">
            Business Categories
          </h2>
          <p className="mt-1 text-sm text-ink-600 lg:mt-[calc(3*var(--u))] lg:text-[calc(13*var(--u))]">
            Define and manage the types of businesses on the platform.
          </p>
        </div>
        <PermissionGate permission={P.manage}>
          <Button
            onClick={onAddCategory}
            className="whitespace-nowrap lg:h-[calc(40*var(--u))] lg:min-h-0 lg:w-[calc(154*var(--u))] lg:rounded-[calc(12*var(--u))] lg:px-0 lg:text-[calc(14.5*var(--u))]"
          >
            <Plus aria-hidden className="size-4" strokeWidth={2.25} />
            Add Category
          </Button>
        </PermissionGate>
      </div>

      <div className="px-1 lg:px-[calc(8*var(--u))]">
        <CategoriesToolbar params={p} resetKey={resetKey} onPatch={patchParams} />
      </div>

      <PermissionGate permission={P.manage}>
        <div className="mt-3 lg:mt-[calc(14*var(--u))] empty:hidden">
          <CategoriesBulkBar
            selectedIds={[...selection.selected]}
            onClear={selection.clear}
            listQuery={query}
          />
        </div>
      </PermissionGate>

      <div className={cn('mt-3 min-h-0 flex-1 lg:mt-[calc(1*var(--u))]', TABLE_TUNE)}>
        <DataTable<HireAdminCategory>
          density="compact"
          framed={false}
          columns={columns}
          rows={list.data?.items}
          getRowId={(row) => row.category_id}
          isLoading={list.isLoading}
          error={list.error}
          onRetry={() => list.refetch()}
          selection={selection}
          empty={{
            title: 'No categories match these filters',
            description: 'Change the filters or clear the search to see more categories.',
            action: hasActive ? (
              <Button variant="secondary" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : undefined
          }}
          caption={`Business categories - ${total ?? 0} total`}
        />
      </div>

      <div className={cn('px-1 lg:px-[calc(8*var(--u))]', PAGER_TUNE)}>
        <ListPager
          labelledNav
          page={p.page}
          pageSize={query.page_size}
          total={total}
          noun="categories"
          onPageChange={(page) => patchParams({ page: String(page) })}
          onPageSizeChange={NO_PAGE_SIZE_PICKER}
        />
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={
          pending?.status === 'archived' ? 'Archive this category?' : 'Deactivate this category?'
        }
        message={
          pending
            ? `${pending.category.name} will be marked as ${CATEGORY_STATUS_LABELS[pending.status]}. You can activate it again later.`
            : ''
        }
        confirmLabel={pending?.status === 'archived' ? 'Archive' : 'Deactivate'}
        tone="danger"
        loading={setStatus.isPending}
        onCancel={() => setPending(null)}
        onConfirm={() =>
          pending &&
          setStatus.mutate(
            { categoryId: pending.category.category_id, status: pending.status },
            { onSuccess: () => setPending(null) }
          )
        }
      />
    </section>
  );
}
