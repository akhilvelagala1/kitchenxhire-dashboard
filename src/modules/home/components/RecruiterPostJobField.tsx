import { CircleAlert, CircleCheck } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { recruiterSetupFieldLabelPostJob } from './recruiterSetupStyles';

interface PostJobLabelProps {
  label: string;
  required?: boolean;
}

/** Label row shared by the Post a Job fields. */
export function PostJobLabel({ label, required = false }: PostJobLabelProps) {
  return (
    <span className={recruiterSetupFieldLabelPostJob}>
      {label}
      {required && <span className="text-brand-600"> *</span>}
    </span>
  );
}

/** Field-level error, directly below its control (UI-09). */
export function PostJobError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-[12px] font-medium text-danger-600">
      {message}
    </p>
  );
}

/** In-field validation icon: a tick when touched and valid, an alert when invalid. */
export function PostJobStatusIcon({
  state,
  className
}: {
  state?: 'valid' | 'invalid';
  className?: string;
}) {
  if (!state) return null;
  const Icon = state === 'valid' ? CircleCheck : CircleAlert;
  return (
    <Icon
      aria-hidden
      className={cn(
        'pointer-events-none absolute right-3 size-4',
        state === 'valid' ? 'text-success-700' : 'text-danger-600',
        className
      )}
    />
  );
}
