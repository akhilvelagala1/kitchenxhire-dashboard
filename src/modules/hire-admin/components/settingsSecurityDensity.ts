/**
 * Density for the Security Settings two-card row (1536×1024 blueprint: two side-by-side cards,
 * each at least ~475px tall, a 0.957 : 1 column split). Both stretch to the row's height, so they
 * stay equal even though Access & Authentication has one more row than Additional Security.
 */
export const SECURITY_CARD_CLASS =
  'h-full min-h-0 overflow-hidden border-[#DFE4F0] lg:rounded-[calc(16*var(--u))]! ' +
  'lg:px-[calc(20*var(--u))]! lg:pt-[calc(20*var(--u))]! lg:pb-[calc(15*var(--u))]! ' +
  'lg:[&_header_h2]:text-[calc(21*var(--u))]! lg:[&_header_p]:text-[calc(13.5*var(--u))]! ' +
  'lg:[&_header_p]:text-[#172D65]! lg:[&_header+div]:mt-[calc(11*var(--u))]!';

export const SECURITY_GRID_CLASS = 'lg:grid-cols-[0.957fr_1fr]';

export const SECURITY_ROWS_CLASS =
  'flex flex-col ' +
  'lg:[&>div]:gap-[calc(14*var(--u))] lg:[&>div]:border-[#E4E8F1]! lg:[&>div]:py-[calc(8*var(--u))] ' +
  'lg:[&>div]:min-h-[calc(74*var(--u))] ' +
  'lg:[&>div>span:first-child]:h-[calc(56*var(--u))]! lg:[&>div>span:first-child]:w-[calc(68*var(--u))]! ' +
  'lg:[&>div>span:first-child]:rounded-[calc(14*var(--u))] ' +
  'lg:[&>div>span:first-child_svg]:size-[calc(23*var(--u))] ' +
  'lg:[&>div_p:first-child]:text-[calc(15*var(--u))]! ' +
  'lg:[&>div_p:last-child]:text-[calc(13*var(--u))]! lg:[&>div_p:last-child]:text-[#172D65]!';

export const SECURITY_SELECT_CLASS =
  'h-10 min-h-0 w-[150px] rounded-xl px-3 text-sm font-semibold lg:h-[calc(42*var(--u))] ' +
  'lg:w-[calc(160*var(--u))] lg:rounded-[calc(11*var(--u))] lg:px-[calc(12*var(--u))] ' +
  'lg:text-[calc(14*var(--u))]';

export const SECURITY_ACTION_BTN =
  'shrink-0 whitespace-nowrap lg:h-[calc(44*var(--u))] lg:min-h-0 lg:min-w-[calc(126*var(--u))] ' +
  'lg:rounded-[calc(12*var(--u))] lg:px-[calc(14*var(--u))] lg:text-[calc(14*var(--u))]';

export const SECURITY_SWITCH =
  'h-[calc(34*var(--u))] w-[calc(55*var(--u))] before:inset-y-0 ' +
  '[&>span]:size-[calc(26*var(--u))]! [&>span]:translate-x-[calc(4*var(--u))]! ' +
  'aria-checked:[&>span]:translate-x-[calc(21*var(--u))]!';
