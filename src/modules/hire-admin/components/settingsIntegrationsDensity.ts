/**
 * Density for the Integrations Settings two-card row (1536×1024 blueprint: a 735px left card next
 * to a 554px right card, both ~484px tall). Both stretch to the row's height, so they stay equal
 * even though Connected Integrations and Webhook hold different amounts of content.
 */
export const INTEGRATIONS_CARD_CLASS =
  'h-full min-h-0 overflow-hidden border-[#DBE3F0] lg:rounded-[calc(16*var(--u))]! ' +
  'lg:px-[calc(20*var(--u))]! lg:pt-[calc(20*var(--u))]! lg:pb-[calc(16*var(--u))]! ' +
  'lg:[&_header_h2]:text-[calc(20*var(--u))]! lg:[&_header_p]:text-[calc(13*var(--u))]! ' +
  'lg:[&_header_p]:text-[#586987]! lg:[&_header+div]:mt-[calc(12*var(--u))]!';

/** Left card is ~735 design px wide, the right one ~554: a 1.327 : 1 split. */
export const INTEGRATIONS_GRID_CLASS = 'lg:grid-cols-[1.327fr_1fr]';

export const INTEGRATIONS_ROW_CLASS =
  'flex items-center gap-3 border-b border-[#EEF0F4] py-3 last:border-b-0 ' +
  'lg:min-h-[calc(74*var(--u))] lg:gap-[calc(14*var(--u))] lg:py-0';

export const INTEGRATIONS_ICON_TILE_CLASS =
  'flex size-12 shrink-0 items-center justify-center rounded-xl ' +
  'lg:h-[calc(58*var(--u))] lg:w-[calc(74*var(--u))] lg:rounded-[calc(12*var(--u))]';

export const INTEGRATIONS_STATUS_PILL =
  'inline-flex h-6 shrink-0 items-center justify-center rounded-full px-3 text-xs font-semibold ' +
  'whitespace-nowrap lg:h-[calc(26*var(--u))] lg:px-[calc(12*var(--u))] lg:text-[calc(12.5*var(--u))]';

export const INTEGRATIONS_ACTION_BTN =
  'shrink-0 whitespace-nowrap lg:h-[calc(40*var(--u))] lg:min-h-0 lg:min-w-[calc(100*var(--u))] ' +
  'lg:rounded-[calc(10*var(--u))] lg:px-[calc(14*var(--u))] lg:text-[calc(13*var(--u))]';

export const INTEGRATIONS_SWITCH =
  'h-[calc(27*var(--u))] w-[calc(51*var(--u))] before:inset-y-0 ' +
  '[&>span]:size-[calc(21*var(--u))]! [&>span]:translate-x-[calc(3*var(--u))]! ' +
  'aria-checked:[&>span]:translate-x-[calc(27*var(--u))]!';
