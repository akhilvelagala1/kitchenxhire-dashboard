import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

/** The pastel tile behind a row's icon, and the icon colour. */
const TONES = {
  purple: 'bg-[#F3E8FF] text-[#7C3AED]',
  blue: 'bg-[#E8F1FF] text-[#2563EB]',
  pink: 'bg-[#FCE7F3] text-[#DB2777]',
  green: 'bg-[#E2F8EE] text-[#16A34A]',
  orange: 'bg-[#FFF0E8] text-[#C2410C]',
  amber: 'bg-[#FFF5DF] text-[#D97706]'
} as const;

type SettingsTone = keyof typeof TONES;

export interface SettingsRowProps {
  icon: LucideIcon;
  tone: SettingsTone;
  title: string;
  /** Lets the control name itself from the title (aria-labelledby). */
  titleId?: string;
  description?: string;
  /** Lets the control describe itself from the description (aria-describedby). */
  descriptionId?: string;
  className?: string;
  /** The control on the right: a switch, a number box or a select. */
  children: ReactNode;
}

/**
 * One line of a Settings card: an icon tile, a bold title with a grey explanation, and the control
 * at the right end. Rows are separated by a thin line, except the last one. A card sets the row
 * height it needs with `className` (for example lg:h-[calc(62*var(--u))]).
 */
export function SettingsRow({
  icon: Icon,
  tone,
  title,
  titleId,
  description,
  descriptionId,
  className,
  children
}: SettingsRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-[#EEF0F4] py-3 last:border-b-0 lg:min-h-[calc(52*var(--u))] lg:gap-[calc(16*var(--u))] lg:py-0',
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-xl lg:size-[calc(52*var(--u))] lg:rounded-[calc(12*var(--u))]',
          TONES[tone]
        )}
      >
        <Icon className="size-6 lg:size-[calc(24*var(--u))]" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p
          id={titleId}
          className="text-sm font-semibold text-[#17191F] lg:text-[calc(14.5*var(--u))]"
        >
          {title}
        </p>
        {description && (
          <p id={descriptionId} className="text-xs text-[#667085] lg:text-[calc(12.5*var(--u))]">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
