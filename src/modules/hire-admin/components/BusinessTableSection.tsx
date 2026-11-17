import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DataTable } from '@/shared/components/DataTable';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { useRowSelection } from '@/shared/hooks/useRowSelection';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { adminBusinessesApi } from '../api/adminBusinessesApi';
import { adminBusinessesKeys } from '../api/adminBusinessesKeys';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import {
  BUSINESS_TABS,
  BUSINESS_TAB_LABELS,
  type BusinessSettableStatus,
  type BusinessTab,
  type HireAdminBusiness
} from '../schemas/adminBusiness';
import { buildBusinessColumns } from './businessTableColumns';
import { useSetBusinessStatus } from './businessMutations';
import { BusinessesBulkBar } from './BusinessesBulkBar';
import { parseBusinessesSearchParams, toBusinessesListQuery } from './businessesPageParams';
import { BusinessToolbar, type BusinessParamChanges } from './BusinessToolbar';
import { jobsCardClass } from './jobsCardStyles';
import { ListPager } from './ListPager';
import { ListTabs } from './ListTabs';
import { BUSINESSES_TABLE_ID } from './listTableAnchors';

const TABLE_TUNE = [
  '[&_table]:w-full [&_table]:table-fixed [&_table]:border-separate [&_table]:border-spacing-0',
  '[&_thead_th]:bg-[#F1F3F6] [&_thead_th]:font-bold [&_thead_th_button]:font-bold',
  '[&_thead_th:first-child]:rounded-l-lg [&_thead_th:last-child]:rounded-r-lg',
  '[&_tbody_td]:border-t [&_tbody_td]:border-[#E9EDF2] [&_tbody_tr:last-child_td]:border-b',
  '[&_thead_th]:h-9 [&_thead_th]:px-2.5 [&_thead_th]:text-[11px] [&_thead_th]:text-[#647084]',
  '[&_tbody_td]:h-[45px] [&_tbody_td]:px-2.5 [&_tbody_td]:align-middle',
  '[&_tbody_tr:hover]:bg-[#FAFBFD]'
].join(' ');

/** Everything "Clear filters" removes. The tab is not a filter, so it stays. */
const CLEAR_FILTER_CHANGES: BusinessParamChanges = {
  search: undefined,
  status: undefined,
  business_type: undefined,
  verification: undefined,
  city: undefined,
  joined: undefined
};

interface PendingChange {
  business: HireAdminBusiness;
}

/**
 * The Businesses card: tabs, filters, bulk bar, table and pager. All list state is in the URL.
 * Opening a business to view or edit is reported to the page, which owns the dialogs.
 */
export function BusinessTableSection({
  onView,
  onEdit
}: {
  onView: (business: HireAdminBusiness) => void;
  onEdit: (business: HireAdminBusiness) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const p = useMemo(() => parseBusinessesSearchParams(searchParams), [searchParams]);
  const query = useMemo(() => toBusinessesListQuery(p), [p]);
  const selection = useRowSelection();
  const setStatus = useSetBusinessStatus();
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [resetPending, setResetPending] = useState(false);
  if (resetPending && !p.search) {
    setResetPending(false);
    setResetKey((key) => key + 1);
  }

  function patchParams(changes: BusinessParamChanges) {
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

  function changeStatus(business: HireAdminBusiness, status: BusinessSettableStatus) {
    if (status === 'inactive') setPending({ business });
    else setStatus.mutate({ businessId: business.business_id, status });
  }

  const list = useQuery({
    queryKey: adminBusinessesKeys.list(query),
    queryFn: () => adminBusinessesApi.list(query),
    placeholderData: keepPreviousData
  });
  const summary = useQuery({
    queryKey: adminBusinessesKeys.summary(),
    queryFn: () => adminBusinessesApi.summary()
  });

  const { clear } = selection;
  const queryText = JSON.stringify(query);
  useEffect(() => {
    clear();
  }, [clear, queryText]);

  const columns = useMemo(
    () => buildBusinessColumns({ onView, onEdit, onSetStatus: changeStatus }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onView, onEdit]
  );

  const total = list.data?.meta.total;
  const hasActive = Boolean(
    p.search ||
    p.status !== 'all' ||
    p.business_type !== 'all' ||
    p.verification !== 'all' ||
    p.city ||
    p.joined !== 'all'
  );
  const counts: Record<BusinessTab, number> | undefined = summary.data && {
    all: summary.data.total,
    active: summary.data.active,
    inactive: summary.data.inactive
  };

  return (
    <section
      id={BUSINESSES_TABLE_ID}
      aria-label="Businesses"
      className={cn(jobsCardClass, 'flex min-w-0 flex-col px-3.5 pt-0 pb-3.5')}
    >
      <ListTabs
        variant="applications"
        tabs={BUSINESS_TABS.map((tab) => ({
          key: tab,
          label: BUSINESS_TAB_LABELS[tab],
          count: counts?.[tab]
        }))}
        active={p.tab}
        ariaLabel="Business status"
        onChange={(key) =>
          patchParams({ tab: key === 'all' ? undefined : (key as BusinessTab), status: undefined })
        }
      >
        <BusinessToolbar
          params={p}
          hasActiveFilters={hasActive}
          resetKey={resetKey}
          onPatch={patchParams}
          onReset={resetFilters}
        />

        <PermissionGate permission={P.manage}>
          <BusinessesBulkBar
            selectedIds={[...selection.selected]}
            onClear={selection.clear}
            listQuery={query}
          />
        </PermissionGate>

        <div className={cn('mt-3 min-h-0 flex-1 lg:mt-3.5', TABLE_TUNE)}>
          <DataTable<HireAdminBusiness>
            density="compact"
            framed={false}
            columns={columns}
            rows={list.data?.items}
            getRowId={(row) => row.business_id}
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
              title: 'No businesses match',
              description: 'Change filters or clear search to see more businesses.',
              action: hasActive ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }}
            caption={`Businesses - ${total ?? 0} total`}
          />
        </div>

        <ListPager
          labelledNav
          page={p.page}
          pageSize={p.page_size}
          total={total}
          noun="businesses"
          onPageChange={(page) => patchParams({ page: String(page) })}
          onPageSizeChange={(size) => patchParams({ page_size: String(size) })}
        />
      </ListTabs>

      <ConfirmDialog
        open={pending !== null}
        title="Deactivate this business?"
        message={
          pending
            ? `${pending.business.business_name} will be marked as Inactive. You can activate it again later.`
            : ''
        }
        confirmLabel="Deactivate"
        tone="danger"
        loading={setStatus.isPending}
        onCancel={() => setPending(null)}
        onConfirm={() =>
          pending &&
          setStatus.mutate(
            { businessId: pending.business.business_id, status: 'inactive' },
            { onSuccess: () => setPending(null) }
          )
        }
      />
    </section>
  );
}
