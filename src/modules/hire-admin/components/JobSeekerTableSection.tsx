import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { DataTable } from '@/shared/components/DataTable';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { useRowSelection } from '@/shared/hooks/useRowSelection';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { adminJobSeekersApi } from '../api/adminJobSeekersApi';
import { adminJobSeekersKeys } from '../api/adminJobSeekersKeys';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import {
  JOB_SEEKER_TABS,
  JOB_SEEKER_TAB_LABELS,
  type HireAdminJobSeeker,
  type JobSeekerTab
} from '../schemas/adminJobSeeker';
import { JobSeekersBulkBar } from './JobSeekersBulkBar';
import { JobSeekerToolbar, type JobSeekerParamChanges } from './JobSeekerToolbar';
import { jobSeekerTableColumns } from './jobSeekerTableColumns';
import { parseJobSeekersSearchParams, toJobSeekersListQuery } from './jobSeekersPageParams';
import { jobsCardClass } from './jobsCardStyles';
import { ListPager } from './ListPager';
import { ListTabs } from './ListTabs';
import { JOB_SEEKERS_TABLE_ID } from './listTableAnchors';

/*
 * Fine-tuning of the shared DataTable (compact density) for the picture, as selectors on the
 * wrapper so the shared file stays untouched and the loading rows get the same height as real ones.
 * Row separators sit on the cells and the table uses separate borders, so the header can have
 * rounded ends. From lg the header is 37 design px tall with 11 px labels and the rows 49.
 */
const TABLE_TUNE = [
  '[&_table]:w-full [&_table]:table-fixed [&_table]:border-separate [&_table]:border-spacing-0',
  '[&_thead_th]:bg-[#F1F3F6] [&_thead_th]:font-bold [&_thead_th_button]:font-bold',
  '[&_thead_th:first-child]:rounded-l-lg [&_thead_th:last-child]:rounded-r-lg',
  '[&_tbody_td]:border-t [&_tbody_td]:border-[#E9EDF2] [&_tbody_tr:last-child_td]:border-b',
  '[&_thead_th]:h-9.5 [&_thead_th]:px-2.5 [&_thead_th]:text-[11px] [&_thead_th]:text-[#647084]',
  '[&_tbody_td]:h-12.5 [&_tbody_td]:px-2.5 [&_tbody_td]:align-middle',
  '[&_tbody_tr:hover]:bg-[#FAFBFD]'
].join(' ');

/** Everything "Clear filters" removes. The tab is not a filter, so it stays. */
const CLEAR_FILTER_CHANGES: JobSeekerParamChanges = {
  search: undefined,
  status: undefined,
  experience: undefined,
  city: undefined,
  joined: undefined
};

/** The Job Seekers card: tabs, filters, bulk bar, table and pager. All state is in the URL. */
export function JobSeekerTableSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Parsed once per URL change, so everything derived from it stays referentially stable.
  const p = useMemo(() => parseJobSeekersSearchParams(searchParams), [searchParams]);
  const query = useMemo(() => toJobSeekersListQuery(p), [p]);
  const selection = useRowSelection();
  const [resetKey, setResetKey] = useState(0);
  const [resetPending, setResetPending] = useState(false);
  // "Clear filters" empties the URL first, and the search box is remounted only once that has
  // happened, so it restarts from the empty value instead of from the text still in the old URL.
  if (resetPending && !p.search) {
    setResetPending(false);
    setResetKey((key) => key + 1);
  }

  function patchParams(changes: JobSeekerParamChanges) {
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
    queryKey: adminJobSeekersKeys.list(query),
    queryFn: () => adminJobSeekersApi.list(query),
    // Keep the current rows on screen while the next page loads, so the count and pager do not flash.
    placeholderData: keepPreviousData
  });
  const summary = useQuery({
    queryKey: adminJobSeekersKeys.summary(),
    queryFn: adminJobSeekersApi.summary
  });
  const locations = useQuery({
    queryKey: adminJobSeekersKeys.locations(),
    queryFn: adminJobSeekersApi.locations,
    staleTime: 5 * 60_000
  });

  // A selection made under one view must not silently apply under another. The serialized query,
  // not its identity, decides: an unrelated URL change keeps the ticks.
  const { clear } = selection;
  const queryText = JSON.stringify(query);
  useEffect(() => {
    clear();
  }, [clear, queryText]);

  const total = list.data?.meta.total;
  const hasActive = Boolean(
    p.search || p.status !== 'all' || p.experience !== 'all' || p.city || p.joined !== 'all'
  );
  const counts: Record<JobSeekerTab, number> | undefined = summary.data && {
    all: summary.data.total,
    active: summary.data.active,
    inactive: summary.data.inactive
  };

  return (
    <section
      id={JOB_SEEKERS_TABLE_ID}
      aria-label="Job seekers"
      className={cn(jobsCardClass, 'flex min-w-0 flex-col px-3.5 pt-0 pb-3.5')}
    >
      <ListTabs
        variant="applications"
        tabs={JOB_SEEKER_TABS.map((tab) => ({
          key: tab,
          label: JOB_SEEKER_TAB_LABELS[tab],
          count: counts?.[tab]
        }))}
        active={p.tab}
        onChange={(key) => patchParams({ tab: key === 'all' ? undefined : key, status: undefined })}
        ariaLabel="Job seeker status"
      >
        <JobSeekerToolbar
          params={p}
          locations={locations.data}
          hasActiveFilters={hasActive}
          resetKey={resetKey}
          onPatch={patchParams}
          onReset={resetFilters}
        />

        <PermissionGate permission={P.manage}>
          <JobSeekersBulkBar
            selectedIds={[...selection.selected]}
            onClear={selection.clear}
            listQuery={query}
          />
        </PermissionGate>

        <div className={cn('mt-3 min-h-0 flex-1 lg:mt-3.5', TABLE_TUNE)}>
          <DataTable<HireAdminJobSeeker>
            density="compact"
            framed={false}
            columns={jobSeekerTableColumns}
            rows={list.data?.items}
            getRowId={(row) => row.job_seeker_id}
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
              title: 'No job seekers match',
              description: 'Change filters or clear search to see more job seekers.',
              action: hasActive ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }}
            caption={`Job seekers - ${total ?? 0} total`}
          />
        </div>

        <ListPager
          page={p.page}
          pageSize={p.page_size}
          total={total}
          noun="job seekers"
          labelledNav
          onPageChange={(page) => patchParams({ page: String(page) })}
          onPageSizeChange={(size) => patchParams({ page_size: String(size) })}
        />
      </ListTabs>
    </section>
  );
}
