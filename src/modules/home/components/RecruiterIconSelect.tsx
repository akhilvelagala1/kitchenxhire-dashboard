import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { recruiterSetupFieldClass } from './recruiterSetupStyles';

interface RecruiterIconSelectProps {
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  children: ReactNode;
  className?: string;
  size?: 'default' | 'large';
  /** Override select field styling (e.g. compact post-job inputs). */
  fieldClassName?: string;
  id?: string;
  invalid?: boolean;
  describedBy?: string;
}

/** Branded native select with peach icon tile (Post a Job Job Category pattern). */
export function RecruiterIconSelect({
  icon: Icon,
  value,
  onChange,
  onBlur,
  children,
  className,
  size = 'default',
  fieldClassName,
  id,
  invalid = false,
  describedBy
}: RecruiterIconSelectProps) {
  const large = size === 'large';
  const fieldClass = fieldClassName ?? recruiterSetupFieldClass;

  return (
    <div className={cn('relative', className)}>
      <span
        className={cn(
          'pointer-events-none absolute top-1/2 left-2 grid -translate-y-1/2 place-items-center rounded-xl bg-[#fff0e8] text-brand-600',
          large ? 'size-10' : 'size-8 rounded-lg',
          fieldClassName && 'size-8 rounded-lg'
        )}
      >
        <Icon className={large ? 'size-[18px]' : 'size-4'} aria-hidden />
      </span>
      <select // guard-allow: recruiter branded enum select matches prototype native select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(fieldClass, large ? 'pl-[52px]' : 'pl-11')}
      >
        {children}
      </select>
    </div>
  );
}
