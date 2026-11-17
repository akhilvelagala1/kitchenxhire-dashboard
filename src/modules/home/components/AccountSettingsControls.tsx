import { ChevronRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export function AccountSwitch({
  checked,
  label,
  onChange
}: {
  checked: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        checked ? 'bg-brand-600' : 'bg-line-strong'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full bg-surface shadow-btn-white',
          checked ? 'left-5' : 'left-0.5'
        )}
      />
    </button>
  );
}

export function AccountSection({
  title,
  lead,
  children
}: {
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <section className="flex h-full flex-col rounded-[18px] border border-line bg-surface p-4 shadow-card min-[1024px]:p-5">
      <h2 className="text-[16px] font-extrabold tracking-tight text-ink">{title}</h2>
      <p className="text-[13px] font-medium leading-snug text-ink-500">{lead}</p>
      <div className="mt-3 min-h-0 flex-1">{children}</div>
    </section>
  );
}

export function AccountActionRow({
  icon: Icon,
  title,
  lead,
  tone,
  onClick
}: {
  icon: LucideIcon;
  title: string;
  lead: string;
  tone: 'brand' | 'danger';
  onClick: () => void;
}) {
  const danger = tone === 'danger';
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-surface px-2.5 py-2 text-left hover:bg-canvas"
    >
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-full',
          danger ? 'bg-danger-50 text-danger-600' : 'bg-brand-50 text-brand-600'
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-[13px] font-extrabold',
            danger ? 'text-danger-600' : 'text-ink'
          )}
        >
          {title}
        </span>
        <span className="block text-[12px] font-medium text-ink-500">{lead}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
    </button>
  );
}
