import { CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { BUSINESS_VERIFICATION_LABELS, type BusinessVerification } from '../schemas/adminBusiness';

const TONES: Record<BusinessVerification, string> = {
  verified: 'bg-[#DCFCE7] text-[#15803D]',
  pending: 'bg-[#DBEAFE] text-[#2563EB]',
  unverified: 'bg-[#FEE2E2] text-[#DC2626]'
};

const ICONS: Record<BusinessVerification, typeof CheckCircle2> = {
  verified: CheckCircle2,
  pending: ShieldCheck,
  unverified: ShieldAlert
};

export function BusinessVerificationBadge({
  verification,
  className
}: {
  verification: BusinessVerification;
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
      {BUSINESS_VERIFICATION_LABELS[verification]}
    </span>
  );
}
