import { useState } from 'react';
import { BulkActionBar } from '@/shared/components/BulkActionBar';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { ExportButton } from '@/shared/components/ExportButton';
import { Button } from '@/shared/ui/Button';
import { adminBusinessesApi, type BusinessesListParams } from '../api/adminBusinessesApi';
import type { BusinessSettableStatus } from '../schemas/adminBusiness';
import { useBulkSetBusinessStatus } from './businessMutations';

/** Compact sizing from lg up, the same as the other lists' bulk buttons. */
const BULK_BTN = 'lg:min-h-7 lg:px-2.5 lg:text-xs';

export interface BusinessesBulkBarProps {
  selectedIds: string[];
  onClear: () => void;
  /** The current filtered view, for "Export selected". */
  listQuery: BusinessesListParams;
}

/** The bar above the table while rows are ticked. The parent shows it to people who can manage only. */
export function BusinessesBulkBar({ selectedIds, onClear, listQuery }: BusinessesBulkBarProps) {
  const [confirming, setConfirming] = useState(false);
  const bulk = useBulkSetBusinessStatus();
  const count = selectedIds.length;
  const noun = count === 1 ? 'business' : 'businesses';

  function run(status: BusinessSettableStatus) {
    bulk.mutate(
      { businessIds: selectedIds, status },
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
          start={() => adminBusinessesApi.exportBusinesses(listQuery, selectedIds)}
        />
      </BulkActionBar>

      <ConfirmDialog
        open={confirming}
        title="Deactivate selected businesses?"
        message={`${count} ${noun} will be marked as Inactive. You can activate them again later.`}
        confirmLabel="Deactivate"
        tone="danger"
        loading={bulk.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() => run('inactive')}
      />
    </>
  );
}
