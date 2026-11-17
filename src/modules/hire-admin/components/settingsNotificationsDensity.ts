/**
 * Density for the Notifications Settings 2×2 cards (1536×1024 blueprint). Each stretches to its
 * row's height, so the two cards sharing a row stay equal even when their content differs.
 */
export const NOTIFICATIONS_CARD_CLASS =
  'h-full min-h-0 overflow-hidden border-[#E4E8F0] lg:rounded-[calc(16*var(--u))]! ' +
  'lg:px-[calc(18*var(--u))]! lg:pt-[calc(16*var(--u))]! lg:pb-[calc(12*var(--u))]! ' +
  'lg:[&_header_h2]:text-[calc(21*var(--u))]! lg:[&_header_p]:text-[calc(13*var(--u))]! ' +
  'lg:[&_header_p]:text-[#586987]! lg:[&_header+div]:mt-[calc(10*var(--u))]!';

export const NOTIFICATIONS_ROWS_CLASS =
  'flex flex-col ' +
  'lg:[&>div]:gap-[calc(12*var(--u))] lg:[&>div]:border-[#E8ECF2]! lg:[&>div]:py-[calc(8*var(--u))] ' +
  'lg:[&>div>span:first-child]:size-[calc(50*var(--u))]! ' +
  'lg:[&>div>span:first-child]:rounded-[calc(12*var(--u))] ' +
  'lg:[&>div>span:first-child_svg]:size-[calc(22*var(--u))] ' +
  'lg:[&>div_p:first-child]:text-[calc(14.5*var(--u))]! ' +
  'lg:[&>div_p:last-child]:text-[calc(12*var(--u))]! lg:[&>div_p:last-child]:text-[#586987]!';

export const NOTIFICATIONS_SWITCH =
  'h-[calc(27*var(--u))] w-[calc(51*var(--u))] before:inset-y-0 ' +
  '[&>span]:size-[calc(21*var(--u))]! [&>span]:translate-x-[calc(3*var(--u))]! ' +
  'aria-checked:[&>span]:translate-x-[calc(27*var(--u))]!';

export const NOTIFICATIONS_BTN =
  'lg:h-[calc(40*var(--u))] lg:min-h-0 lg:rounded-[calc(10*var(--u))] ' +
  'lg:px-[calc(14*var(--u))] lg:text-[calc(13*var(--u))]';
