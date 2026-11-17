import { cn } from '@/shared/lib/cn';

export function CandidateInitialsAvatar({
  initials,
  className
}: {
  initials: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600',
        className
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}
