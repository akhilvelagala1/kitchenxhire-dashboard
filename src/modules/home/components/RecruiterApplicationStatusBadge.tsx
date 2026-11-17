import { cn } from '@/shared/lib/cn';
import { useHireLanguage } from '../hooks/useHireLanguage';
import {
  RECRUITER_STATUS_CLASS,
  RECRUITER_STATUS_LABEL,
  type RecruiterApplicationStatus
} from '../schemas/recruiterApplication';

export function RecruiterApplicationStatusBadge({
  status
}: {
  status: RecruiterApplicationStatus;
}) {
  const { tx } = useHireLanguage();

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[12px] font-extrabold',
        RECRUITER_STATUS_CLASS[status]
      )}
    >
      {tx(RECRUITER_STATUS_LABEL[status])}
    </span>
  );
}
