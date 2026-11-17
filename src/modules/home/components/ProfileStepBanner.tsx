import { ChefHat, UtensilsCrossed, type LucideIcon } from 'lucide-react';

interface ProfileStepBannerProps {
  title: string;
  lead: string;
  icon?: LucideIcon;
}

/** Soft peach step header used inside the Create Profile form card. */
export function ProfileStepBanner({
  title,
  lead,
  icon: Icon = UtensilsCrossed
}: ProfileStepBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#FFF3ED] px-4 py-3.5 min-[768px]:gap-4 min-[768px]:px-5 min-[768px]:py-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface text-brand-600 shadow-sm ring-1 ring-brand-600/10">
        <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-[18px] font-extrabold tracking-tight text-ink min-[768px]:text-[20px]">
          {title}
        </h2>
        <p className="mt-0.5 text-[13.5px] font-medium text-ink-500">{lead}</p>
      </div>
      <ChefHat
        className="hidden size-12 shrink-0 text-brand-600/25 min-[640px]:block"
        strokeWidth={1.25}
        aria-hidden="true"
      />
    </div>
  );
}
