import type { ReactNode } from 'react';
import { AuditTrail } from '@/shared/components/AuditTrail';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminCategory } from '../schemas/adminCategoryRole';
import { CategoryBusinessTypePill } from './CategoryBusinessTypePill';
import { CategoryIconTile } from './CategoryIconTile';
import { CategoryRoleStatusBadge } from './CategoryRoleStatusBadge';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line py-2.5">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right font-medium break-words text-ink">{children}</dd>
    </div>
  );
}

const grouped = (n: number) => n.toLocaleString('en-IN');

/** Read-only details of one category and its change history. Managers can go on to edit from here. */
export function CategoryViewDialog({
  category,
  onClose,
  onEdit
}: {
  category: HireAdminCategory | undefined;
  onClose: () => void;
  onEdit: (category: HireAdminCategory) => void;
}) {
  return (
    <Dialog
      open={category !== undefined}
      onClose={onClose}
      title={category ? `${category.name} (${category.category_id})` : 'Category details'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <PermissionGate permission={P.manage}>
            <Button onClick={() => category && onEdit(category)}>Edit</Button>
          </PermissionGate>
        </>
      }
    >
      {category && (
        <>
          <dl className="text-sm">
            <Row label="Icon">
              <CategoryIconTile icon={category.icon} />
            </Row>
            <Row label="Status">
              <CategoryRoleStatusBadge status={category.status} />
            </Row>
            <Row label="Code">{category.code}</Row>
            <Row label="Business type">
              <CategoryBusinessTypePill type={category.business_type} />
            </Row>
            <Row label="Businesses">{grouped(category.businesses)}</Row>
            <Row label="Outlets">{grouped(category.outlets)}</Row>
            <Row label="Description">{category.description || 'No description'}</Row>
          </dl>
          <h3 className="mt-4 mb-2 text-sm font-semibold text-ink">History</h3>
          <AuditTrail entityType="hire_category" entityId={category.category_id} />
        </>
      )}
    </Dialog>
  );
}
