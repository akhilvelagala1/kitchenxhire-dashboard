import { useState } from 'react';
import { BulkActionBar } from '@/shared/components/BulkActionBar';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { ExportButton } from '@/shared/components/ExportButton';
import { Button } from '@/shared/ui/Button';
import { adminUsersApi, type UsersListParams } from '../api/adminUsersApi';
import type { UserSettableStatus } from '../schemas/adminUser';
import { useBulkSetUserStatus } from './userMutations';

/** Compact sizing from lg up, the same as the other lists' bulk buttons. */
const BULK_BTN = 'lg:min-h-7 lg:px-2.5 lg:text-xs';

/** What the two confirmed changes say to the person before they go through. */
const CONFIRM: Record<
  Exclude<UserSettableStatus, 'active'>,
  { title: string; verb: string; outcome: string; label: string }
> = {
  inactive: {
    title: 'Deactivate selected users?',
    verb: 'marked as Inactive',
    outcome: 'You can activate them again later.',
    label: 'Deactivate'
  },
  suspended: {
    title: 'Suspend selected users?',
    verb: 'suspended and signed out',
    outcome: 'You can reactivate them later.',
    label: 'Suspend'
  }
};

export interface UsersBulkBarProps {
  selectedIds: string[];
  onClear: () => void;
  /** The current filtered view, for "Export selected". */
  listQuery: UsersListParams;
}

/** The bar above the table while rows are ticked. The parent shows it to people who can manage only. */
export function UsersBulkBar({ selectedIds, onClear, listQuery }: UsersBulkBarProps) {
  const [confirming, setConfirming] = useState<Exclude<UserSettableStatus, 'active'> | null>(null);
  const bulk = useBulkSetUserStatus();
  const count = selectedIds.length;
  const noun = count === 1 ? 'user' : 'users';
  const copy = confirming ? CONFIRM[confirming] : undefined;

  function run(status: UserSettableStatus) {
    bulk.mutate(
      { userIds: selectedIds, status },
      {
        onSuccess: () => {
          setConfirming(null);
          onClear();
        }
      }
    );
  }

  return (
    <>
      <BulkActionBar compact count={count} onClear={onClear}>
        <Button
          className={BULK_BTN}
          variant="secondary"
          disabled={bulk.isPending}
          onClick={() => run('active')}
        >
          Activate selected
        </Button>
        <Button
          className={BULK_BTN}
          variant="secondary"
          disabled={bulk.isPending}
          onClick={() => setConfirming('inactive')}
        >
          Deactivate selected
        </Button>
        <Button
          className={BULK_BTN}
          variant="secondary"
          disabled={bulk.isPending}
          onClick={() => setConfirming('suspended')}
        >
          Suspend selected
        </Button>
        <ExportButton
          label="Export selected"
          className={BULK_BTN}
          start={() => adminUsersApi.exportUsers(listQuery, selectedIds)}
        />
      </BulkActionBar>

      <ConfirmDialog
        open={confirming !== null}
        title={copy?.title ?? ''}
        message={`${count} ${noun} will be ${copy?.verb ?? ''}. ${copy?.outcome ?? ''}`}
        confirmLabel={copy?.label ?? ''}
        tone="danger"
        loading={bulk.isPending}
        onCancel={() => setConfirming(null)}
        onConfirm={() => confirming && run(confirming)}
      />
    </>
  );
}
