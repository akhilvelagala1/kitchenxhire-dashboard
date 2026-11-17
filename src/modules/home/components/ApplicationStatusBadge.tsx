import { Calendar, CheckCircle2, Clock, Star, XCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { ApplicationStatus } from '../schemas/jobApplication';
import { APPLICATION_STATUS_LABEL } from '../schemas/jobApplication';

const STATUS_CLASS: Record<ApplicationStatus, string> = {
  'under-review': 'bg-sky-50 text-sky-700',
  shortlisted: 'bg-violet-50 text-violet-700',
  interview: 'bg-brand-50 text-brand-600',
  selected: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-rose-50 text-rose-700'
};

const STATUS_ICON: Record<ApplicationStatus, LucideIcon> = {
  'under-review': Clock,
  shortlisted: Star,
  interview: Calendar,
  selected: CheckCircle2,
  closed: XCircle
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const Icon = STATUS_ICON[status];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-extrabold',
        STATUS_CLASS[status]
      )}
    >
      <Icon className="size-3.5 stroke-[2.2]" aria-hidden="true" />
      {APPLICATION_STATUS_LABEL[status]}
    </span>
  );
}
