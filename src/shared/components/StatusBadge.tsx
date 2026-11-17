import { Badge, type Tone } from '@/shared/ui/Badge';

/** One status → tone map for the whole app, so a status never changes color between pages. */
const TONES: Record<string, Tone> = {
  ACTIVE: 'success',
  APPROVED: 'success',
  DELIVERED: 'success',
  SUCCEEDED: 'success',
  DRAFT: 'neutral',
  INACTIVE: 'neutral',
  PENDING: 'warning',
  PROCESSING: 'info',
  RUNNING: 'info',
  REJECTED: 'danger',
  FAILED: 'danger',
  CANCELLED: 'danger',
  DELETED: 'danger'
};

function label(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase().replaceAll('_', ' ');
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={TONES[status] ?? 'neutral'}>{label(status)}</Badge>;
}
