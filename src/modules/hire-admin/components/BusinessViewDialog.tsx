import type { ReactNode } from 'react';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminBusiness } from '../schemas/adminBusiness';
import { BusinessKindBadge } from './BusinessKindBadge';
import { BusinessStatusBadge } from './BusinessStatusBadge';
import { BusinessVerificationBadge } from './BusinessVerificationBadge';
import { formatJoinedOnDate } from './formatJoinedOnDate';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line py-2.5">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right font-medium break-words text-ink">{children}</dd>
    </div>
  );
}

/** `9876543210` as `+91 98765 43210`. Anything else is shown as it came. */
function showPhone(phone: string): string {
  return /^\d{10}$/.test(phone) ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : phone;
}

/** Read-only details of one business. People who can manage businesses can go on to edit from here. */
export function BusinessViewDialog({
  business,
  onClose,
  onEdit
}: {
  business: HireAdminBusiness | undefined;
  onClose: () => void;
  onEdit: (business: HireAdminBusiness) => void;
}) {
  return (
    <Dialog
      open={business !== undefined}
      onClose={onClose}
      title={business ? `${business.business_name} (${business.business_id})` : 'Business details'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <PermissionGate permission={P.manage}>
            <Button onClick={() => business && onEdit(business)}>Edit</Button>
          </PermissionGate>
        </>
      }
    >
      {business && (
        <dl className="text-sm">
          <Row label="Status">
            <BusinessStatusBadge status={business.status} />
          </Row>
          <Row label="Verification">
            <BusinessVerificationBadge verification={business.verification} />
          </Row>
          <Row label="Business type">
            <BusinessKindBadge kind={business.business_type} />
          </Row>
          <Row label="Location">{`${business.area}, ${business.city}`}</Row>
          <Row label="Owner">{business.owner_name}</Row>
          <Row label="Phone">{showPhone(business.phone)}</Row>
          <Row label="E-mail">{business.email}</Row>
          <Row label="Outlets">{business.outlets}</Row>
          <Row label="Joined on">{formatJoinedOnDate(business.joined_at)}</Row>
        </dl>
      )}
    </Dialog>
  );
}
