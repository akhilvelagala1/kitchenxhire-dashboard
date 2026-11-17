import { ArrowDown, ArrowUp, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/ui/Skeleton';

export interface StatCard {
  key: string;
  /** What the number counts, for the accessible name, when it is not the row's noun. */
  noun?: string;
  label: string;
  value: number;
  /** Percent change against last month; below zero draws a red arrow down. */
  growth: number;
  icon: LucideIcon;
  /** Tinted gradient and border classes of the card. */
  card: string;
  /** Classes of the round icon badge. */
  badge: string;
}

interface StatCardRowProps {
  cards: StatCard[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** Plural name of what is counted, for the card's accessible name: `recruiters`. */
  countNoun: string;
}

/** 90 design pixels tall from lg up, whatever the state, so the page grid below never jumps. */
const BOX =
  'flex min-h-22 min-w-0 items-center gap-2.5 overflow-hidden rounded-2xl border px-3 py-3 shadow-[0_2px_8px_rgba(20,35,60,0.06)] ' +
  'lg:h-[calc(90*var(--u))] lg:min-h-0 lg:gap-3 lg:px-3.5 lg:py-0';
const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6';

function Growth({ value }: { value: number }) {
  const up = value >= 0;
  const Arrow = up ? ArrowUp : ArrowDown;
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-1 text-xs leading-4 font-semibold lg:text-dense-sm">
      <span
        className={cn(
          'inline-flex shrink-0 items-center',
          up ? 'text-[#0F7A3A]' : 'text-[#B42318]'
        )}
      >
        <Arrow className="size-3" aria-hidden />
        {up ? '+' : ''}
        {value}%
      </span>
      <span className="font-normal whitespace-nowrap text-[#4B5563] max-[419px]:sr-only min-[420px]:inline">
        vs last month
      </span>
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className={cn(BOX, 'border-[#E9ECF2] bg-white')}>
      <Skeleton className="size-11 shrink-0 rounded-full" />
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-3 w-24" />
      </span>
    </div>
  );
}

function StatCardView({ card, countNoun }: { card: StatCard; countNoun: string }) {
  const Icon = card.icon;
  const value = card.value.toLocaleString('en-IN');
  return (
    <div
      role="group"
      aria-label={`${card.label}, ${value} ${card.noun ?? countNoun}`}
      className={cn(BOX, card.card)}
    >
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-full lg:size-11',
          card.badge
        )}
      >
        <Icon className="size-5.5" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span
          title={card.label}
          className="line-clamp-2 block text-xs leading-4 break-words text-[#202A3A] lg:line-clamp-2 lg:text-dense-md lg:leading-4"
        >
          {card.label}
        </span>
        <span className="block text-xl leading-7 font-bold text-[#111111] sm:text-2xl">
          {value}
        </span>
        <Growth value={card.growth} />
      </span>
    </div>
  );
}

/** Six tinted stat cards in a row: icon badge on the left, then label, big number and growth. */
export function StatCardRow({ cards, isLoading, isError, onRetry, countNoun }: StatCardRowProps) {
  const failed = isError && !isLoading;
  return (
    <div className={GRID} aria-busy={isLoading || undefined}>
      {isLoading && (
        <>
          <span role="status" className="sr-only">
            Loading {countNoun} counts
          </span>
          {Array.from({ length: Math.max(cards.length, 6) }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </>
      )}
      {failed && (
        <div
          role="alert"
          className={cn(
            BOX,
            'col-span-full flex-wrap justify-center border-[#E9ECF2] bg-white text-sm text-ink-soft'
          )}
        >
          <span>Could not load the {countNoun} counts.</span>
          <button
            type="button"
            onClick={onRetry}
            className="min-h-11 rounded-lg border border-[#E9ECF2] px-3 py-1.5 font-semibold text-[#202A3A] hover:bg-[#F6F7FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:min-h-0"
          >
            Retry
          </button>
        </div>
      )}
      {!isLoading &&
        !failed &&
        cards.map((card) => <StatCardView key={card.key} card={card} countNoun={countNoun} />)}
    </div>
  );
}
