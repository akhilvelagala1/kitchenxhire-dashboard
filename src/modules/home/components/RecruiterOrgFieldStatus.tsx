import { CircleCheck } from 'lucide-react';

interface OrgFieldLabelProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  /** Small success tick, shown only after the field is touched and valid. */
  success?: boolean;
}

/** Label row shared by the organisation fields: text, required mark and success tick. */
export function OrgFieldLabel({ label, required, optional, success }: OrgFieldLabelProps) {
  return (
    <span className="flex items-center gap-1.5 text-[16px] font-semibold text-ink">
      <span>
        {label}
        {required && <span className="text-brand-600"> *</span>}
        {optional && <span className="font-medium text-ink-500"> (Optional)</span>}
      </span>
      {success && <CircleCheck className="ml-auto size-4 flex-none text-success-700" />}
    </span>
  );
}

/** Field-level error, directly below its control (UI-09). */
export function OrgFieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-[12px] font-medium text-danger-600">
      {message}
    </p>
  );
}
