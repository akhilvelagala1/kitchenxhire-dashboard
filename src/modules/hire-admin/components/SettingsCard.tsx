import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { jobsCardClass } from './jobsCardStyles';

interface SettingsCardProps {
  title: string;
  description: string;
  /** Optional control beside the title (for example “+ Add User”). */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * The white frame of a Settings card: a bold title with a grey line under it, then the body, which
 * fills the rest of the card. 12 design px radius and 22 design px padding, as in the picture.
 */
export function SettingsCard({
  title,
  description,
  action,
  className,
  children
}: SettingsCardProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        jobsCardClass,
        'flex min-w-0 flex-col p-4 lg:rounded-[calc(12*var(--u))] lg:px-[calc(22*var(--u))] lg:pt-[calc(22*var(--u))] lg:pb-[calc(13*var(--u))]',
        className
      )}
    >
      <header className={action ? 'flex items-start justify-between gap-3' : undefined}>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[#17191F] lg:text-[calc(18*var(--u))]">{title}</h2>
          <p className="mt-0.5 text-sm text-[#667085] lg:mt-[calc(3*var(--u))] lg:text-[calc(13*var(--u))]">
            {description}
          </p>
        </div>
        {action}
      </header>
      <div className="mt-3 flex min-h-0 flex-1 flex-col lg:mt-[calc(4*var(--u))]">{children}</div>
    </section>
  );
}
