import { ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useHireLanguage } from '../hooks/useHireLanguage';
import type { Role } from '../schemas/home';

interface RoleCardProps {
  role: Role;
  active: boolean;
  slideArrow?: boolean;
  className?: string;
  onPick: (query: string) => void;
}

export function RoleCard({ role, active, slideArrow = true, className, onPick }: RoleCardProps) {
  const { tx } = useHireLanguage();
  return (
    <button
      type="button"
      onClick={() => onPick(role.query)}
      className={cn(
        'group relative flex h-full min-h-[98px] w-full items-center gap-3 rounded-[20px] bg-surface py-3 pr-4 pl-[22px] text-left transition-[translate,box-shadow] duration-[180ms] before:absolute before:inset-y-[18px] before:left-2.5 before:w-1 before:rounded-full before:bg-brand-600 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30',
        active
          ? 'border border-brand-200 shadow-role-on'
          : 'border border-line/60 shadow-role hover:shadow-card-hover',
        className
      )}
    >
      <span className="grid size-7 flex-none place-items-center text-brand-600">
        <role.icon className="size-[22px] stroke-[1.7]" />
      </span>
      <span className="min-w-0 flex-1">
        <strong
          className={cn(
            'block truncate text-sm leading-tight font-extrabold tracking-[-0.02em] after:ml-0.5 after:font-medium after:text-ink-400 after:content-["_›"]',
            active ? 'text-brand-600' : 'text-ink'
          )}
        >
          {tx(role.title)}
        </strong>
        <em className="mt-0.5 line-clamp-2 text-[13px] leading-[1.45] font-medium text-ink-500 not-italic">
          {tx(role.description)}
        </em>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'grid flex-none place-items-center text-ink',
          slideArrow && 'transition-transform duration-[180ms] group-hover:translate-x-[3px]'
        )}
      >
        <ArrowRight className="size-[18px]" />
      </span>
    </button>
  );
}
