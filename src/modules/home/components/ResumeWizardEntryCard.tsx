import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { resumeEntryTitle } from './styles';

interface ResumeWizardEntryCardProps {
  icon: LucideIcon;
  title: string;
  onRemove?: () => void;
  removeLabel?: string;
  children: ReactNode;
  className?: string;
  /** First entry in list — no top divider. */
  isFirst?: boolean;
}

/** Flat section inside the main form card (Find Jobs density — no nested shadow card). */
export function ResumeWizardEntryCard({
  icon: Icon,
  title,
  onRemove,
  removeLabel = 'Remove',
  children,
  className,
  isFirst = false
}: ResumeWizardEntryCardProps) {
  return (
    <section
      className={cn(
        !isFirst && 'mt-5 border-t border-line pt-5 min-[768px]:mt-4 min-[768px]:pt-4',
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2 min-[768px]:mb-3.5">
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-brand-600" strokeWidth={1.75} aria-hidden="true" />
          <h3 className={resumeEntryTitle}>{title}</h3>
        </div>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-[13px] font-bold text-danger-600 hover:underline"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            {removeLabel}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}
