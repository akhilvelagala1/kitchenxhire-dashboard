import { Eye, Pencil } from 'lucide-react';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { BusinessSettableStatus, HireAdminBusiness } from '../schemas/adminBusiness';
import { BusinessActionMenu } from './BusinessActionMenu';

/** What the row's buttons ask the table section to do. */
export interface BusinessRowHandlers {
  onView: (business: HireAdminBusiness) => void;
  onEdit: (business: HireAdminBusiness) => void;
  onSetStatus: (business: HireAdminBusiness, status: BusinessSettableStatus) => void;
}

/** Plain icon buttons as in the picture: 44px on a phone, 34 design px from lg. */
const ICON_BUTTON =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-650 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600 lg:size-8.5';

/** The table's last column. Everyone with view access can open a business; changes need manage. */
export function BusinessRowActions({
  business,
  handlers
}: {
  business: HireAdminBusiness;
  handlers: BusinessRowHandlers;
}) {
  const id = business.business_id;

  return (
    <div className="flex items-center gap-1 lg:justify-end">
      <button
        type="button"
        aria-label={`View business ${id}`}
        className={ICON_BUTTON}
        onClick={() => handlers.onView(business)}
      >
        <Eye className="size-4" aria-hidden />
      </button>
      <PermissionGate permission={P.manage}>
        <button
          type="button"
          aria-label={`Edit business ${id}`}
          className={ICON_BUTTON}
          onClick={() => handlers.onEdit(business)}
        >
          <Pencil className="size-4" aria-hidden />
        </button>
        <BusinessActionMenu
          business={business}
          triggerClassName={ICON_BUTTON}
          onSetStatus={handlers.onSetStatus}
        />
      </PermissionGate>
    </div>
  );
}
