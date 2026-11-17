import { useState } from 'react';
import { BulkActionBar } from '@/shared/components/BulkActionBar';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { ExportButton } from '@/shared/components/ExportButton';
import { Button } from '@/shared/ui/Button';
import { adminCategoriesApi, type CategoriesListParams } from '../api/adminCategoriesApi';
import type { CategoryStatus } from '../schemas/adminCategoryRole';
import { useBulkSetCategoryStatus } from './categoryMutations';

/** Compact sizing from lg up, the same as the other lists' bulk buttons. */
const BULK_BTN = 'lg:min-h-7 lg:px-2.5 lg:text-xs';

type ConfirmedStatus = Exclude<CategoryStatus, 'active'>;

const CONFIRM_TEXT: Record<ConfirmedStatus, { title: string; verb: string; done: string }> = {
  inactive: {
    title: 'Deactivate selected categories?',
    verb: 'Deactivate',
    done: 'marked as Inactive. You can activate them again later.'
  },
  archived: {
    title: 'Archive selected categories?',
    verb: 'Archive',
    done: 'archived. You can activate them again later.'
  }
};

interface CategoriesBulkBarProps {
  selectedIds: string[];
  onClear: () => void;
  /** The current filtered view, for "Export selected". */
  listQuery: CategoriesListParams;
}

/** The bar above the table while rows are ticked. The parent shows it to people who can manage only. */
export function CategoriesBulkBar({ selectedIds, onClear, listQuery }: CategoriesBulkBarProps) {
  const [confirming, setConfirming] = useState<ConfirmedStatus | null>(null);
  const bulk = useBulkSetCategoryStatus();
  const count = selectedIds.length;
  const text = confirming ? CONFIRM_TEXT[confirming] : undefined;

  function run(status: CategoryStatus) {
    bulk.mutate(
      { categoryIds: selectedIds, status },
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
          Activate
        </Button>
        <Button
          className={BULK_BTN}
          variant="secondary"
          disabled={bulk.isPending}
          onClick={() => setConfirming('inactive')}
        >
          Deactivate
        </Button>
        <Button
          className={BULK_BTN}
          variant="secondary"
          disabled={bulk.isPending}
          onClick={() => setConfirming('archived')}
        >
          Archive
        </Button>
        <ExportButton
          label="Export selected"
          className={BULK_BTN}
          start={() => adminCategoriesApi.exportCategories(listQuery, selectedIds)}
        />
      </BulkActionBar>

      <ConfirmDialog
        open={confirming !== null}
        title={text?.title ?? ''}
        message={
          text ? `${count} ${count === 1 ? 'category' : 'categories'} will be ${text.done}` : ''
        }
        confirmLabel={text?.verb ?? 'Confirm'}
        tone="danger"
        loading={bulk.isPending}
        onCancel={() => setConfirming(null)}
        onConfirm={() => confirming && run(confirming)}
      />
    </>
  );
}
