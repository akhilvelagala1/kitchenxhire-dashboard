import { useState } from 'react';
import { BulkActionBar } from '@/shared/components/BulkActionBar';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { ExportButton } from '@/shared/components/ExportButton';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Input';
import { adminApplicationsApi, type ApplicationsListParams } from '../api/adminApplicationsApi';
import { APPLICATION_STATUS_LABELS, type HireApplicationStatus } from '../schemas/adminApplication';
import { SETTABLE_STATUSES, useBulkSetStatus } from './applicationMutations';

/** Compact sizing from lg up, the same as the Jobs bulk buttons. */
const BULK_BTN = 'lg:min-h-7 lg:px-2.5 lg:text-xs';

export interface ApplicationsBulkBarProps {
  selectedIds: string[];
  onClear: () => void;
  /** The current filtered view, for "Export selected". */
  listQuery: ApplicationsListParams;
}

/** The bar above the table while rows are ticked. The parent shows it to people who can manage only. */
export function ApplicationsBulkBar({ selectedIds, onClear, listQuery }: ApplicationsBulkBarProps) {
  const [status, setStatus] = useState<HireApplicationStatus | ''>('');
  const [confirming, setConfirming] = useState(false);
  const bulk = useBulkSetStatus();
  const count = selectedIds.length;

  function run() {
    if (!status) return;
    bulk.mutate(
      { applicationIds: selectedIds, status },
      {
        onSuccess: () => {
          setConfirming(false);
          setStatus('');
          onClear();
        }
      }
    );
  }

  function apply() {
    if (status === 'rejected') setConfirming(true);
    else run();
  }

  return (
    <>
      <BulkActionBar compact count={count} onClear={onClear}>
        <div className="w-52 lg:w-44">
          <Select
            aria-label="Change status of selected applications"
            value={status}
            className="lg:min-h-7 lg:px-2 lg:text-xs"
            onChange={(e) => setStatus(e.target.value as HireApplicationStatus | '')}
          >
            <option value="">Change status to…</option>
            {SETTABLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {APPLICATION_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <Button
          className={BULK_BTN}
          disabled={!status}
          loading={bulk.isPending && !confirming}
          onClick={apply}
        >
          Apply
        </Button>
        <ExportButton
          label="Export selected"
          className={BULK_BTN}
          start={() => adminApplicationsApi.exportApplications(listQuery, selectedIds)}
        />
      </BulkActionBar>

      <ConfirmDialog
        open={confirming}
        title="Reject selected applications?"
        message={`${count} ${count === 1 ? 'application' : 'applications'} will be marked as Rejected. You can change the status again later.`}
        confirmLabel="Reject"
        tone="danger"
        loading={bulk.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={run}
      />
    </>
  );
}
