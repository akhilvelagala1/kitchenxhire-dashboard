/* Hire admin jobs list. Archive and restore map to the job lifecycle: pause or close a job from its row menu, and set it back to Active from Edit Job. */
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { BulkActionBar } from '@/shared/components/BulkActionBar';
import { BulkImportDialog } from '@/shared/components/BulkImportDialog';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DataTable } from '@/shared/components/DataTable';
import { ExportButton } from '@/shared/components/ExportButton';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { useApiMutation } from '@/shared/api/useApiMutation';
import { useRowSelection } from '@/shared/hooks/useRowSelection';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { adminJobsApi } from '../api/adminJobsApi';
import { adminJobsKeys } from '../api/adminJobsKeys';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminJob } from '../schemas/adminJob';
import { jobsCardClass } from './jobsCardStyles';
import { parseJobsSearchParams } from './jobsPageParams';
import { JobsPaginationControls } from './JobsPaginationControls';
import { JOBS_TABLE_ID } from './jobsTableAnchor';
import { jobsTableColumns } from './jobsTableColumns';
import { JobsTableToolbar } from './JobsTableToolbar';
import { JobsTabs, type JobsTabKey } from './JobsTabs';

const BULK_BTN = 'lg:min-h-7 lg:px-2.5 lg:text-xs';

const TABLE_TUNE = [
  '[&_table]:w-full [&_table]:table-fixed [&_table]:border-separate [&_table]:border-spacing-0',
  '[&_thead_th]:bg-[#F3F4F6] [&_thead_th]:font-bold [&_thead_th_button]:font-bold',
  '[&_thead_th:first-child]:rounded-l-lg [&_thead_th:last-child]:rounded-r-lg',
  '[&_tbody_td]:border-t [&_tbody_td]:border-[#E9EDF2] [&_tbody_tr:last-child_td]:border-b',
  '[&_thead_th]:h-9.5 [&_thead_th]:px-2.5 [&_thead_th]:text-[11px] [&_thead_th]:text-[#647084]',
  '[&_tbody_td]:h-12.5 [&_tbody_td]:px-2.5 [&_tbody_td]:align-middle',
  '[&_tbody_tr:hover]:bg-[#FFFAF8]'
].join(' ');

function BulkLabel({ long, short }: { long: string; short: string }) {
  return (
    <>
      <span className="lg:hidden">{long}</span>
      <span className="hidden lg:inline">{short}</span>
    </>
  );
}

function tabFromStatus(status: string): JobsTabKey {
  if (
    status === 'active' ||
    status === 'under_review' ||
    status === 'paused' ||
    status === 'closed' ||
    status === 'draft'
  ) {
    return status;
  }
  return 'all';
}

export function JobsTableSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const p = useMemo(() => parseJobsSearchParams(searchParams), [searchParams]);
  const selection = useRowSelection();
  const [importOpen, setImportOpen] = useState(false);
  const [bulkClose, setBulkClose] = useState(false);
  const activeTab = tabFromStatus(p.job_status);

  function patchParams(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setSearchParams(next, { replace: true });
  }

  const listQuery = useMemo(
    () => ({
      page: p.page,
      page_size: p.page_size,
      search: p.search,
      sort: p.sort,
      order: p.order,
      range: p.range,
      from: p.from,
      to: p.to,
      job_status: p.job_status !== 'all' ? p.job_status : undefined,
      job_category: p.job_category !== 'all' ? p.job_category : undefined,
      location: p.location !== 'all' ? p.location : undefined,
      recruiter_name: p.recruiter_name !== 'all' ? p.recruiter_name : undefined,
      job_title_label: p.job_title_label,
      recruited: p.recruited ? true : undefined
    }),
    [p]
  );

  const list = useQuery({
    queryKey: adminJobsKeys.list(listQuery),
    queryFn: () => adminJobsApi.list(listQuery),
    placeholderData: keepPreviousData
  });

  const summary = useQuery({
    queryKey: adminJobsKeys.summary(p.range, p.from, p.to),
    queryFn: () => adminJobsApi.summary(p.range, p.from, p.to)
  });

  const bulk = useApiMutation({
    mutationFn: (vars: { action: 'approve' | 'pause' | 'close'; job_ids: string[] }) =>
      adminJobsApi.bulk(vars.action, vars.job_ids),
    invalidates: [adminJobsKeys.all]
  });

  const { clear } = selection;
  useEffect(() => {
    clear();
  }, [clear, listQuery]);

  const total = list.data?.meta.total;
  const selectedIds = [...selection.selected];
  const counts = summary.data
    ? {
        all: summary.data.total_jobs,
        active: summary.data.active_jobs,
        under_review: summary.data.under_review_jobs,
        paused: summary.data.paused_jobs,
        closed: summary.data.closed_jobs,
        draft: summary.data.draft_jobs
      }
    : undefined;

  function runBulk(action: 'approve' | 'pause' | 'close') {
    bulk.mutate(
      { action, job_ids: selectedIds },
      {
        onSuccess: () => {
          selection.clear();
          setBulkClose(false);
        }
      }
    );
  }

  return (
    <>
      <section
        id={JOBS_TABLE_ID}
        aria-label="Jobs"
        className={cn(jobsCardClass, 'flex min-w-0 flex-col px-3.5 pt-0 pb-3.5')}
      >
        <JobsTabs
          active={activeTab}
          counts={counts}
          onChange={(tab) =>
            patchParams({
              job_status: tab === 'all' ? undefined : tab,
              job_title_label: undefined,
              recruited: undefined
            })
          }
        >
          <JobsTableToolbar
            search={p.search}
            jobStatus={p.job_status}
            jobCategory={p.job_category}
            location={p.location}
            recruiterName={p.recruiter_name}
            from={p.from}
            to={p.to}
            listQuery={listQuery}
            onPatch={patchParams}
          />

          <PermissionGate permission={P.manage}>
            <BulkActionBar compact count={selectedIds.length} onClear={selection.clear}>
              <Button
                variant="secondary"
                className={BULK_BTN}
                aria-label="Approve selected jobs"
                onClick={() => runBulk('approve')}
              >
                <BulkLabel long="Approve selected jobs" short="Approve" />
              </Button>
              <Button
                variant="secondary"
                className={BULK_BTN}
                aria-label="Pause selected jobs"
                onClick={() => runBulk('pause')}
              >
                <BulkLabel long="Pause selected jobs" short="Pause" />
              </Button>
              <Button
                variant="secondary"
                className={BULK_BTN}
                aria-label="Close selected jobs"
                onClick={() => setBulkClose(true)}
              >
                <BulkLabel long="Close selected jobs" short="Close" />
              </Button>
              <ExportButton
                label="Export selected"
                className={BULK_BTN}
                start={() => adminJobsApi.exportJobs(listQuery, selectedIds)}
              />
              <Button variant="secondary" className={BULK_BTN} onClick={() => setImportOpen(true)}>
                Import
              </Button>
            </BulkActionBar>
          </PermissionGate>

          <div className={cn('min-h-0 flex-1', TABLE_TUNE)}>
            <DataTable<HireAdminJob>
              density="compact"
              framed={false}
              columns={jobsTableColumns}
              rows={list.data?.items}
              getRowId={(row) => row.job_id}
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
                title: 'No jobs match',
                description: 'Change filters or clear search to see more roles.'
              }}
              caption={`Jobs — ${total ?? 0} total`}
            />
          </div>

          <JobsPaginationControls
            page={p.page}
            pageSize={p.page_size}
            total={total}
            onPageChange={(page) => patchParams({ page: String(page) })}
            onPageSizeChange={(size) => patchParams({ page_size: String(size) })}
          />
        </JobsTabs>
      </section>

      <BulkImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entityLabel="Hire jobs"
        templateUrl="/api/v1/hire/admin/jobs/imports/template"
        upload={(file, opts) => adminJobsApi.importJobs(file, opts)}
        invalidates={[adminJobsKeys.all]}
      />

      <ConfirmDialog
        open={bulkClose}
        title="Close selected jobs?"
        message="Closed postings stop accepting new applications."
        confirmLabel="Close jobs"
        tone="primary"
        loading={bulk.isPending}
        onCancel={() => setBulkClose(false)}
        onConfirm={() => runBulk('close')}
      />
    </>
  );
}
