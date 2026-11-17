/**
 * Density for the Users & Roles 2×2 Settings cards (1536×1024 blueprint). Card padding ~18px,
 * heading ~21px. Each stretches to its row's height, so the two cards sharing a row stay equal
 * even when their content differs.
 */
export const USERS_ROLES_CARD_CLASS =
  'h-full min-h-0 overflow-hidden border-[#E4E8F0] lg:rounded-[calc(14*var(--u))]! ' +
  'lg:px-[calc(18*var(--u))]! lg:pt-[calc(16*var(--u))]! lg:pb-[calc(12*var(--u))]! ' +
  'lg:[&_header_h2]:text-[calc(21*var(--u))]! lg:[&_header_p]:text-[calc(13*var(--u))]! ' +
  'lg:[&_header_p]:text-[#586987]! lg:[&_header+div]:mt-[calc(10*var(--u))]!';

export const USERS_ROLES_BTN =
  'lg:h-[calc(40*var(--u))] lg:min-h-0 lg:rounded-[calc(10*var(--u))] ' +
  'lg:px-[calc(14*var(--u))] lg:text-[calc(13*var(--u))]';

/** Compact count chip next to role edit/delete (person icon + N Users). */
export const USERS_ROLES_COUNT_BADGE =
  'inline-flex h-[calc(28*var(--u))] min-h-0 shrink-0 items-center gap-[calc(4*var(--u))] ' +
  'rounded-full border border-[#E4E8F0] bg-[#F5F6FB] px-[calc(10*var(--u))] ' +
  'text-[calc(12*var(--u))] font-semibold text-[#586987] ' +
  '[&_svg]:size-[calc(12*var(--u))]';

/** Plain icon hit target for edit/delete (same idea as ROW_ICON_BUTTON; no shared Button). */
export const USERS_ROLES_ICON_BTN =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-[#F5F6FB] ' +
  'disabled:cursor-not-allowed ' +
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600 ' +
  'lg:size-[calc(32*var(--u))]';

export const USERS_ROLES_ROWS_CLASS =
  'flex flex-col ' +
  'lg:[&>div]:gap-[calc(12*var(--u))] lg:[&>div]:border-[#E8ECF2]! lg:[&>div]:py-[calc(10*var(--u))] ' +
  'lg:[&>div>span:first-child]:size-[calc(50*var(--u))]! ' +
  'lg:[&>div>span:first-child]:rounded-[calc(12*var(--u))] ' +
  'lg:[&>div>span:first-child_svg]:size-[calc(22*var(--u))] ' +
  'lg:[&>div_p:first-child]:text-[calc(14.5*var(--u))]! ' +
  'lg:[&>div_p:last-child]:text-[calc(12*var(--u))]! lg:[&>div_p:last-child]:text-[#586987]!';

/** Access & Security toggle sized to ~51×27 design px. */
export const USERS_ROLES_SWITCH =
  'h-[calc(27*var(--u))] w-[calc(51*var(--u))] before:inset-y-0 ' +
  '[&>span]:size-[calc(21*var(--u))]! [&>span]:translate-x-[calc(3*var(--u))]! ' +
  'aria-checked:[&>span]:translate-x-[calc(27*var(--u))]!';
