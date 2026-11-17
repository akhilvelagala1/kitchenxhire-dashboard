import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DataTable } from '@/shared/components/DataTable';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { useRowSelection } from '@/shared/hooks/useRowSelection';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { adminUsersApi } from '../api/adminUsersApi';
import { adminUsersKeys } from '../api/adminUsersKeys';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import {
  USER_TABS,
  USER_TAB_LABELS,
  type HireAdminUser,
  type UserSettableStatus,
  type UserTab
} from '../schemas/adminUser';
import { jobsCardClass } from './jobsCardStyles';
import { ListPager } from './ListPager';
import { ListTabs } from './ListTabs';
import { USERS_TABLE_ID } from './listTableAnchors';
import { useSetUserStatus } from './userMutations';
import { buildUserColumns } from './userTableColumns';
import { UsersBulkBar } from './UsersBulkBar';
import { UserToolbar, type UserParamChanges } from './UserToolbar';
import { DEFAULT_LOGIN_FILTER, parseUsersSearchParams, toUsersListQuery } from './usersPageParams';

const TABLE_TUNE = [
  '[&_table]:w-full [&_table]:table-fixed [&_table]:border-separate [&_table]:border-spacing-0',
  '[&_thead_th]:bg-[#F1F3F6] [&_thead_th]:font-bold [&_thead_th_button]:font-bold',
  '[&_thead_th:first-child]:rounded-l-lg [&_thead_th:last-child]:rounded-r-lg',
  '[&_tbody_td]:border-t [&_tbody_td]:border-[#E9EDF2] [&_tbody_tr:last-child_td]:border-b',
  '[&_thead_th]:h-9 [&_thead_th]:px-2.5 [&_thead_th]:text-[11px] [&_thead_th]:text-[#647084]',
  '[&_tbody_td]:h-[50px] [&_tbody_td]:px-2.5 [&_tbody_td]:align-middle',
  '[&_tbody_tr:hover]:bg-[#FAFBFD]'
].join(' ');

/** Everything "Clear filters" removes. The status tab is not a filter, so it stays. */
const CLEAR_FILTER_CHANGES: UserParamChanges = {
  search: undefined,
  status: undefined,
  role: undefined,
  department: undefined,
  login: undefined
};

/** What each confirmed change tells the person. Activating needs no question. */
const CONFIRM_COPY: Record<
  Exclude<UserSettableStatus, 'active'>,
  { title: string; message: (name: string) => string; label: string }
> = {
  inactive: {
    title: 'Deactivate this user?',
    message: (name) => `${name} will be marked as Inactive. You can activate them again later.`,
    label: 'Deactivate'
  },
  suspended: {
    title: 'Suspend this user?',
    message: (name) => `${name} will be suspended and signed out. You can reactivate them later.`,
    label: 'Suspend'
  }
};

interface PendingChange {
  user: HireAdminUser;
  status: Exclude<UserSettableStatus, 'active'>;
}

/**
 * The User Management card: tabs, filters, bulk bar, table and pager. All list state is in the URL.
 * Opening a user to view or edit is reported to the page, which owns the dialogs.
 */
export function UserTableSection({
  onView,
  onEdit
}: {
  onView: (user: HireAdminUser) => void;
  onEdit: (user: HireAdminUser) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const p = useMemo(() => parseUsersSearchParams(searchParams), [searchParams]);
  const query = useMemo(() => toUsersListQuery(p), [p]);
  const selection = useRowSelection();
  const setStatus = useSetUserStatus();
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [resetPending, setResetPending] = useState(false);
  if (resetPending && !p.search) {
    setResetPending(false);
    setResetKey((key) => key + 1);
  }

  function patchParams(changes: UserParamChanges) {
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

  function changeStatus(user: HireAdminUser, status: UserSettableStatus) {
    if (status === 'active') setStatus.mutate({ userId: user.user_id, status });
    else setPending({ user, status });
  }

  const list = useQuery({
    queryKey: adminUsersKeys.list(query),
    queryFn: () => adminUsersApi.list(query),
    placeholderData: keepPreviousData
  });
  const summary = useQuery({
    queryKey: adminUsersKeys.summary(),
    queryFn: () => adminUsersApi.summary()
  });

  const { clear } = selection;
  const queryText = JSON.stringify(query);
  useEffect(() => {
    clear();
  }, [clear, queryText]);

  const columns = useMemo(
    () => buildUserColumns({ onView, onEdit, onSetStatus: changeStatus }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onView, onEdit]
  );

  const total = list.data?.meta.total;
  const hasActive = Boolean(
    p.search || p.status !== 'all' || p.role || p.department || p.login !== DEFAULT_LOGIN_FILTER
  );
  const tabs = USER_TABS.map((key) => ({
    key,
    label: USER_TAB_LABELS[key],
    count: summary.data?.[key === 'all' ? 'total' : key]
  }));
  const copy = pending ? CONFIRM_COPY[pending.status] : undefined;

  return (
    <section
      id={USERS_TABLE_ID}
      aria-label="Users"
      className={cn(jobsCardClass, 'flex min-w-0 flex-col px-3.5 pt-0 pb-3.5')}
    >
      <ListTabs
        variant="applications"
        tabs={tabs}
        active={p.tab}
        ariaLabel="User status"
        onChange={(tab) =>
          patchParams({ tab: tab === 'all' ? undefined : (tab as UserTab), status: undefined })
        }
      >
        <UserToolbar
          params={p}
          hasActiveFilters={hasActive}
          resetKey={resetKey}
          onPatch={patchParams}
          onReset={resetFilters}
        />

        <PermissionGate permission={P.manage}>
          <UsersBulkBar
            selectedIds={[...selection.selected]}
            onClear={selection.clear}
            listQuery={query}
          />
        </PermissionGate>

        <div className={cn('mt-3 min-h-0 flex-1 lg:mt-3.5', TABLE_TUNE)}>
          <DataTable<HireAdminUser>
            density="compact"
            framed={false}
            columns={columns}
            rows={list.data?.items}
            getRowId={(row) => row.user_id}
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
              title: 'No users match',
              description: 'Change filters or clear search to see more users.',
              action: hasActive ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }}
            caption={`Users - ${total ?? 0} total`}
          />
        </div>

        <ListPager
          labelledNav
          page={p.page}
          pageSize={p.page_size}
          total={total}
          noun="users"
          onPageChange={(page) => patchParams({ page: String(page) })}
          onPageSizeChange={(size) => patchParams({ page_size: String(size) })}
        />
      </ListTabs>

      <ConfirmDialog
        open={pending !== null}
        title={copy?.title ?? ''}
        message={pending && copy ? copy.message(pending.user.name) : ''}
        confirmLabel={copy?.label ?? ''}
        tone="danger"
        loading={setStatus.isPending}
        onCancel={() => setPending(null)}
        onConfirm={() =>
          pending &&
          setStatus.mutate(
            { userId: pending.user.user_id, status: pending.status },
            { onSuccess: () => setPending(null) }
          )
        }
      />
    </section>
  );
}
