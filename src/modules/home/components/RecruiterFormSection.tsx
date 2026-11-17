import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import {
  recruiterSetupIconTile,
  recruiterSetupSectionTitle,
  recruiterSetupSectionTitleCompact,
  recruiterSetupSectionTitleOrgFit,
  recruiterSetupSectionTitlePostJob
} from './recruiterSetupStyles';

interface RecruiterFormSectionProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  className?: string;
  density?: 'default' | 'compact' | 'fit' | 'postJob';
  /** Plain orange icon for section title (no peach tile). */
  iconVariant?: 'badge' | 'plain';
}

export function RecruiterFormSection({
  icon: Icon,
  title,
  children,
  className = '',
  density = 'default',
  iconVariant = 'badge'
}: RecruiterFormSectionProps) {
  const postJob = density === 'postJob';
  const compact = density === 'compact' || density === 'fit' || postJob;
  const fit = density === 'fit';

  return (
    <section
      className={cn(
        'border-t border-line-soft first:border-t-0',
        postJob
          ? 'space-y-[18px] border-[#e9ecf2] pt-5 first:border-t-0 first:pt-0 min-[1024px]:pt-[22px]'
          : fit
            ? 'space-y-2 pt-2.5 first:border-t-0 first:pt-0'
            : compact
              ? 'space-y-2.5 pt-4 first:pt-0'
              : 'space-y-4 pt-5 first:pt-0',
        className
      )}
    >
      <h2
        className={cn(
          'flex items-center',
          iconVariant === 'plain' ? 'gap-2.5' : 'gap-2',
          postJob
            ? recruiterSetupSectionTitlePostJob
            : fit
              ? recruiterSetupSectionTitleOrgFit
              : compact
                ? recruiterSetupSectionTitleCompact
                : recruiterSetupSectionTitle
        )}
      >
        {iconVariant === 'plain' ? (
          <Icon className="size-[22px] shrink-0 text-brand-600" aria-hidden />
        ) : (
          <span className={cn(recruiterSetupIconTile, (fit || postJob) && 'size-9 rounded-lg')}>
            <Icon className={fit || postJob ? 'size-4' : 'size-[18px]'} aria-hidden />
          </span>
        )}
        {title}
      </h2>
      <div
        className={cn(
          postJob ? 'space-y-3.5' : fit ? 'space-y-2' : compact ? 'space-y-2.5' : 'space-y-4'
        )}
      >
        {children}
      </div>
    </section>
  );
}
