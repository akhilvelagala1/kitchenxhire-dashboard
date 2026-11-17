import { useState } from 'react';
import { BulkActionBar } from '@/shared/components/BulkActionBar';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { ExportButton } from '@/shared/components/ExportButton';
import { Button } from '@/shared/ui/Button';
import { adminJobSeekersApi, type JobSeekersListParams } from '../api/adminJobSeekersApi';
import { useBulkSetJobSeekerStatus } from './jobSeekerMutations';

/** Compact sizing from lg up, the same as the Jobs bulk buttons. */
const BULK_BTN = 'lg:min-h-7 lg:px-2.5 lg:text-xs';

export interface JobSeekersBulkBarProps {
  selectedIds: string[];
  onClear: () => void;
  /** The current filtered view, for "Export selected". */
  listQuery: JobSeekersListParams;
}

/** The bar above the table while rows are ticked. The parent shows it to people who can manage only. */
export function JobSeekersBulkBar({ selectedIds, onClear, listQuery }: JobSeekersBulkBarProps) {
  const [confirming, setConfirming] = useState(false);
  const bulk = useBulkSetJobSeekerStatus();
  const count = selectedIds.length;

  function run(status: 'active' | 'inactive') {
    bulk.mutate(
      { jobSeekerIds: selectedIds, status },
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
          start={() => adminJobSeekersApi.exportJobSeekers(listQuery, selectedIds)}
        />
      </BulkActionBar>

      <ConfirmDialog
        open={confirming}
        title="Deactivate selected job seekers?"
        message={`${count} ${count === 1 ? 'job seeker' : 'job seekers'} will be marked as Inactive. You can activate them again later.`}
        confirmLabel="Deactivate"
        tone="danger"
        loading={bulk.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() => run('inactive')}
      />
    </>
  );
}
