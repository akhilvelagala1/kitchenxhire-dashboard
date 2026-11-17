import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { DataTable } from '@/shared/components/DataTable';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { useRowSelection } from '@/shared/hooks/useRowSelection';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { adminApplicationsApi } from '../api/adminApplicationsApi';
import { adminApplicationsKeys } from '../api/adminApplicationsKeys';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminApplication } from '../schemas/adminApplication';
import { ApplicationsBulkBar } from './ApplicationsBulkBar';
import { APPLICATIONS_TABLE_ID } from './applicationsTableAnchor';
import { applicationsTableColumns } from './applicationsTableColumns';
import { parseApplicationsSearchParams, toApplicationsListQuery } from './applicationsPageParams';
import { ApplicationsPager } from './ApplicationsPager';
import { ApplicationsTabs } from './ApplicationsTabs';
import { ApplicationsToolbar, type ParamChanges } from './ApplicationsToolbar';
import { jobsCardClass } from './jobsCardStyles';

/*
 * Fine-tuning of the shared DataTable (compact density) for the picture, as selectors on the
 * wrapper so the shared file stays untouched and the loading rows get the same height as real ones.
 * Row separators sit on the cells and the table uses separate borders, so the header can have
 * rounded ends. From lg the header is 33 design px tall with 11 px labels and the rows 46.
 */
const TABLE_TUNE = [
  '[&_table]:w-full [&_table]:table-fixed [&_table]:border-separate [&_table]:border-spacing-0',
  '[&_thead_th]:bg-[#F3F4F6] [&_thead_th]:font-bold [&_thead_th_button]:font-bold',
  '[&_thead_th:first-child]:rounded-l-lg [&_thead_th:last-child]:rounded-r-lg',
  '[&_tbody_td]:border-t [&_tbody_td]:border-[#E9EDF2] [&_tbody_tr:last-child_td]:border-b',
  '[&_thead_th]:h-9.5 [&_thead_th]:px-2.5 [&_thead_th]:text-[11px] [&_thead_th]:text-[#647084]',
  '[&_tbody_td]:h-12 [&_tbody_td]:px-2.5 [&_tbody_td]:align-middle',
  '[&_tbody_tr:hover]:bg-[#FFFAF8]'
].join(' ');

/** Everything "Clear filters" removes. The stage tab is not a filter, so it stays. */
const CLEAR_FILTER_CHANGES: ParamChanges = {
  search: undefined,
  status: undefined,
  job_id: undefined,
  job_label: undefined,
  recruiter_id: undefined,
  recruiter_label: undefined,
  location: undefined,
  from: undefined,
  to: undefined
};

/** The Applications card: stage tabs, filters, bulk bar, table and pager. All state is in the URL. */
export function ApplicationsTableSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Parsed once per URL change, so everything derived from it stays referentially stable.
  const p = useMemo(() => parseApplicationsSearchParams(searchParams), [searchParams]);
  const query = useMemo(() => toApplicationsListQuery(p), [p]);
  const selection = useRowSelection();
  const [resetKey, setResetKey] = useState(0);
  const [resetPending, setResetPending] = useState(false);
  // "Clear filters" empties the URL first, and the search box is remounted only once that has
  // happened, so it restarts from the empty value instead of from the text still in the old URL.
  if (resetPending && !p.search) {
    setResetPending(false);
    setResetKey((key) => key + 1);
  }

  function patchParams(changes: ParamChanges) {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key)
    );
    if (!('page' in changes)) next.delete('page');
    setSearchParams(next, { replace: true });
  }

  function resetFilters() {
    setResetPending(true);
    patchParams(CLEAR_FILTER_CHANGES);
  }

  const list = useQuery({
    queryKey: adminApplicationsKeys.list(query),
    queryFn: () => adminApplicationsApi.list(query),
    // Keep the current rows on screen while the next page loads, so the count and pager do not flash.
    placeholderData: keepPreviousData
  });
  const summary = useQuery({
    queryKey: adminApplicationsKeys.summary(),
    queryFn: adminApplicationsApi.summary
  });

  // A selection made under one view must not silently apply under another. The serialized query,
  // not its identity, decides when the ticks clear.
  const { clear } = selection;
  const queryText = JSON.stringify(query);
  useEffect(() => {
    clear();
  }, [clear, queryText]);

  const total = list.data?.meta.total;
  const hasActive = Boolean(
    p.search || p.status !== 'all' || p.job_id || p.recruiter_id || p.location || p.from || p.to
  );

  return (
    <section
      id={APPLICATIONS_TABLE_ID}
      aria-label="Applications"
      className={cn(jobsCardClass, 'flex min-w-0 flex-col px-3.5 pt-0 pb-3.5')}
    >
      <ApplicationsTabs
        active={p.tab}
        counts={summary.data?.counts}
        onChange={(tab) => patchParams({ tab: tab === 'all' ? undefined : tab, status: undefined })}
      >
        <ApplicationsToolbar
          params={p}
          listQuery={query}
          hasActiveFilters={hasActive}
          resetKey={resetKey}
          onPatch={patchParams}
          onReset={resetFilters}
        />

        <PermissionGate permission={P.manage}>
          <ApplicationsBulkBar
            selectedIds={[...selection.selected]}
            onClear={selection.clear}
            listQuery={query}
          />
        </PermissionGate>

        <div className={cn('mt-3 min-h-0 flex-1 lg:mt-3.5', TABLE_TUNE)}>
          <DataTable<HireAdminApplication>
            density="compact"
            framed={false}
            columns={applicationsTableColumns}
            rows={list.data?.items}
            getRowId={(row) => row.application_id}
            isLoading={list.isLoading}
            error={list.error}
            onRetry={() => list.refetch()}
            selection={selection}
            sort={{
              key: p.sort,
              order: p.order,
              onChange: (key, order) => patchParams({ sort: key, order })
            }}
            empty={{
              title: 'No applications match',
              description: 'Change filters or clear search to see more applications.',
              action: hasActive ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }}
            caption={`Applications - ${total ?? 0} total`}
          />
        </div>

        <ApplicationsPager
          page={p.page}
          pageSize={p.page_size}
          total={total}
          onPageChange={(page) => patchParams({ page: String(page) })}
          onPageSizeChange={(size) => patchParams({ page_size: String(size) })}
        />
      </ApplicationsTabs>
    </section>
  );
}
