import type { LucideIcon } from 'lucide-react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface DashboardStatCardProps {
  label: string;
  value: number;
  growthPct: number;
  icon: LucideIcon;
  iconClassName: string;
  cardClassName: string;
  onClick?: () => void;
}

function formatCount(n: number) {
  return n.toLocaleString('en-IN');
}

export function DashboardStatCard({
  label,
  value,
  growthPct,
  icon: Icon,
  iconClassName,
  cardClassName,
  onClick
}: DashboardStatCardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex h-24 w-full items-center gap-3 rounded-2xl border border-[#E5E7EB]/80 p-4 text-left shadow-[0_2px_5px_rgba(16,24,40,0.04)] transition hover:shadow-[0_4px_8px_rgba(16,24,40,0.08)]',
        cardClassName,
        onClick && 'cursor-pointer'
      )}
    >
      <div
        className={cn(
          'flex size-[58px] shrink-0 items-center justify-center rounded-2xl bg-white/90',
          iconClassName
        )}
      >
        <Icon className="size-7" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#667085]">{label}</p>
        <p className="text-[29px] leading-none font-bold text-[#17191C]">{formatCount(value)}</p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="flex items-center justify-end gap-0.5 text-xs font-semibold text-[#16A66A]">
          <TrendingUp className="size-3.5" aria-hidden />+{growthPct}%
        </p>
        <p className="text-[11px] text-[#667085]">vs last month</p>
      </div>
    </Tag>
  );
}
