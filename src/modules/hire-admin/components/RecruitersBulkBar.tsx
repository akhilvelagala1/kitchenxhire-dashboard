import { useState } from 'react';
import { BulkActionBar } from '@/shared/components/BulkActionBar';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { ExportButton } from '@/shared/components/ExportButton';
import { Button } from '@/shared/ui/Button';
import { adminRecruitersApi, type RecruitersListParams } from '../api/adminRecruitersApi';
import type { RecruiterStatus } from '../schemas/adminRecruiter';
import { useBulkSetRecruiterStatus } from './recruiterMutations';

/** Compact sizing from lg up, the same as the Applications bulk buttons. */
const BULK_BTN = 'lg:min-h-7 lg:px-2.5 lg:text-xs';

export interface RecruitersBulkBarProps {
  selectedIds: string[];
  onClear: () => void;
  /** The current filtered view, for "Export selected". */
  listQuery: RecruitersListParams;
}

/** The bar above the table while rows are ticked. The parent shows it to people who can manage only. */
export function RecruitersBulkBar({ selectedIds, onClear, listQuery }: RecruitersBulkBarProps) {
  const [confirming, setConfirming] = useState(false);
  const bulk = useBulkSetRecruiterStatus();
  const count = selectedIds.length;

  function run(status: RecruiterStatus) {
    bulk.mutate(
      { recruiterIds: selectedIds, status },
      {
        onSuccess: () => {
          setConfirming(false);
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
          onClick={() => setConfirming(true)}
        >
          Deactivate selected
        </Button>
        <ExportButton
          label="Export selected"
          className={BULK_BTN}
          start={() => adminRecruitersApi.exportRecruiters(listQuery, selectedIds)}
        />
      </BulkActionBar>

      <ConfirmDialog
        open={confirming}
        title="Deactivate selected recruiters?"
        message={`${count} ${count === 1 ? 'recruiter' : 'recruiters'} will be marked as Inactive. You can activate them again later.`}
        confirmLabel="Deactivate"
        tone="danger"
        loading={bulk.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() => run('inactive')}
      />
    </>
  );
}
