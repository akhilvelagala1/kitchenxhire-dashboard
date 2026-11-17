/**
 * Shared density for the Hiring & Jobs 2×2 cards. Rows share the card height (no fixed floor),
 * icon tiles stay about 44 design px, and the card padding matches the 1536×1024 reference so the
 * page can fit one main without scrolling. `min-h-0!` beats SettingsRow's default 52 design px floor.
 */
export const HIRING_CARD_CLASS =
  'h-full min-h-0 overflow-hidden lg:rounded-[calc(14*var(--u))]! ' +
  'lg:px-[calc(20*var(--u))]! lg:pt-[calc(14*var(--u))]! lg:pb-[calc(8*var(--u))]! ' +
  'lg:[&_header_h2]:text-[calc(19*var(--u))]! lg:[&_header_p]:text-[calc(12.5*var(--u))]! ' +
  'lg:[&_header+div]:mt-[calc(4*var(--u))]!';

export const HIRING_ROWS_CLASS =
  'flex min-h-0 flex-1 flex-col ' +
  'lg:[&>div]:min-h-0! lg:[&>div]:flex-1 lg:[&>div]:gap-[calc(12*var(--u))] lg:[&>div]:py-0 ' +
  'lg:[&>div>span:first-child]:size-[calc(42*var(--u))]! ' +
  'lg:[&>div>span:first-child]:rounded-[calc(11*var(--u))] ' +
  'lg:[&>div>span:first-child_svg]:size-[calc(20*var(--u))]';
