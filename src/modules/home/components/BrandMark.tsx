import { cn } from '@/shared/lib/cn';
import logo from '../assets/kitchenx-logo.png';

interface BrandMarkProps {
  size?: 'header' | 'footer' | 'auth';
  /** White wordmark for the dark footer. */
  dark?: boolean;
  /** Hide the Hiring label when a surrounding chrome already shows it (e.g. recruiter chip). */
  hideHiringLabel?: boolean;
}

const logoSize = {
  header: 'h-5 max-w-[132px] min-[768px]:h-[22px]',
  footer: 'h-7 max-w-[180px]',
  auth: 'h-[22px]'
};

/** The KitchenX logo, a hairline rule and the "Hiring" label. */
export function BrandMark({
  size = 'header',
  dark = false,
  hideHiringLabel = false
}: BrandMarkProps) {
  return (
    <span className="flex flex-none items-center gap-2.5">
      <img
        src={logo}
        alt="KitchenX"
        decoding="async"
        className={cn('block w-auto object-contain', logoSize[size])}
      />
      {!hideHiringLabel && (
        <>
          <span
            aria-hidden="true"
            className={cn('h-[18px] w-px', dark ? 'bg-white/[.28]' : 'bg-line-strong')}
          />
          <span
            className={cn(
              'text-[14px] font-extrabold tracking-[-0.02em]',
              dark ? 'text-white' : 'text-ink'
            )}
          >
            Hiring
          </span>
        </>
      )}
    </span>
  );
}
