import { CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import {
  RECRUITER_VERIFICATION_LABELS,
  type RecruiterVerification
} from '../schemas/adminRecruiter';

const TONES: Record<RecruiterVerification, string> = {
  verified: 'bg-[#DCFCE7] text-[#15803D]',
  pending: 'bg-[#DBEAFE] text-[#2563EB]',
  rejected: 'bg-[#FEE2E2] text-[#DC2626]'
};

const ICONS: Record<RecruiterVerification, typeof CheckCircle2> = {
  verified: CheckCircle2,
  pending: ShieldCheck,
  rejected: ShieldAlert
};

export function RecruiterVerificationBadge({
  verification,
  className
}: {
  verification: RecruiterVerification;
  className?: string;
}) {
  const Icon = ICONS[verification];
  return (
    <span
      className={cn(
        'inline-flex h-5.5 items-center gap-1 rounded-full px-2.5 text-[11.5px] font-bold whitespace-nowrap',
        TONES[verification],
        className
      )}
    >
      <Icon aria-hidden className="size-3" />
      {RECRUITER_VERIFICATION_LABELS[verification]}
    </span>
  );
}
