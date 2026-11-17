import { cn } from '@/shared/lib/cn';
import { JOB_CATEGORY_ICON } from '../lib/jobCategoryIcons';
import type { JobCategory } from '../schemas/findJobs';

interface JobCategoryIconBoxProps {
  category: JobCategory;
  className?: string;
  /** md = Find Jobs default; sm = dense My Applications cards. */
  size?: 'md' | 'sm';
}

const SIZE_CLASS = {
  md: 'size-[68px] rounded-2xl',
  sm: 'size-[52px] rounded-[12px]'
} as const;

const ICON_CLASS = {
  md: 'size-8',
  sm: 'size-[22px]'
} as const;

/** Soft peach tile + orange outline icon (prototype reference). */
export function JobCategoryIconBox({ category, className, size = 'md' }: JobCategoryIconBoxProps) {
  const Icon = JOB_CATEGORY_ICON[category];
  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center bg-[#FFF3ED] text-brand-600 ring-1 ring-brand-600/10',
        SIZE_CLASS[size],
        className
      )}
    >
      <Icon className={ICON_CLASS[size]} strokeWidth={1.65} aria-hidden="true" />
    </div>
  );
}
