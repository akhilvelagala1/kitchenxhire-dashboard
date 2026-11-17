import { cn } from '@/shared/lib/cn';

/** Class strings the prototype repeats. Colours, shadows and motion come from index.css tokens. */
export const pageWrap = 'w-full px-4 min-[1024px]:px-6';

const kickerBase = 'font-extrabold uppercase text-brand-600';

export const kicker = `${kickerBase} text-[11px] tracking-[0.14em]`;

/** The larger eyebrow the roles and how-it-works sections use. */
export const kickerLg = `${kickerBase} text-[12px] tracking-[0.16em]`;

const secTitleBase = 'mt-1 font-extrabold leading-[1.12] tracking-[-0.03em] text-ink';

export const secTitle = `${secTitleBase} text-[26px] min-[768px]:text-[30px]`;

/** Roles, match and stories headings grow to 36px from 768px. */
export const secTitleLg = `${secTitleBase} text-[26px] min-[768px]:text-[36px]`;

/** The how-it-works heading is 30px, then 44px. */
export const secTitleXl = `${secTitleBase} text-[30px] min-[768px]:text-[44px]`;

export const secLead = 'mt-1.5 max-w-[520px] text-[14.5px] font-medium leading-[1.45] text-ink-500';

/** Resume wizard — compact tier aligned with Find Jobs cards/filters (UI-13). */
export const resumeCardHeading = 'text-lg font-extrabold tracking-tight text-ink';

export const resumeCardLead = 'mt-1 text-[14px] font-medium leading-snug text-ink-500';

export const resumeFieldLabel = 'text-[14px] font-bold text-ink';

export const resumeFieldInput = 'h-12 w-full rounded-xl px-3 text-[14px] font-semibold';

export const resumeFormCard =
  'w-full rounded-[18px] border border-line bg-surface p-5 shadow-card min-[768px]:p-6';

export const resumeEntryTitle = 'text-[15px] font-extrabold text-ink';

export const resumeWizardAddAction =
  'inline-flex min-h-9 items-center gap-1.5 text-[14px] font-extrabold text-brand-600 hover:underline';

export const resumeWizardFieldsWrap = 'mt-4';

/** Custom Hire listbox — same menu as LocationPicker, not a native OS dropdown. */
export const hireMenu = 'rounded-2xl border border-line bg-surface p-1.5 shadow-loc';

/** Scroll region inside a Hire listbox — long lists scroll here, never in the menu frame. */
export const hireMenuScroll = 'min-h-0 flex-1 overflow-y-auto overscroll-contain';

export const hireMenuOption =
  'flex min-h-10 w-full items-center gap-2 rounded-[10px] px-2.5 text-left text-sm font-bold text-ink-700 hover:bg-brand-50 hover:text-ink';

export const card =
  'relative rounded-[18px] bg-surface shadow-card transition-[translate,box-shadow] duration-[220ms] hover:z-[2] hover:-translate-y-1 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0';

export const pillBadge =
  'shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[12px] font-extrabold text-brand-600';

export const metaGrid =
  'grid gap-x-4 gap-y-1.5 text-[13px] font-semibold text-ink-600 min-[640px]:grid-cols-2';

export const metaItem = 'flex min-w-0 items-center gap-2';

const buttonBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full font-extrabold transition-[background-color,border-color,box-shadow,filter,translate] duration-150';
const orange = 'bg-brand-600 text-white hover:brightness-[.97] active:translate-y-px';
const white =
  'border border-line bg-surface text-ink hover:border-line-strong hover:bg-canvas active:translate-y-px';
const login = 'border border-line bg-surface leading-none text-ink hover:bg-muted';

const buttons = {
  'orange-base': `${orange} h-[42px] gap-2 px-[18px] text-sm shadow-btn-orange hover:shadow-btn-orange-hover`,
  'orange-slim': `${orange} h-10 gap-2 px-4 text-[13.5px] shadow-btn-orange-slim`,
  'orange-header': `${orange} h-9 gap-2 px-3.5 text-[13px] shadow-btn-orange-slim`,
  'orange-block': `${orange} h-[46px] w-full gap-2 px-[18px] text-sm shadow-btn-orange hover:shadow-btn-orange-hover`,
  'white-base': `${white} h-[42px] px-[18px] text-sm shadow-btn-white`,
  'white-slim': `${white} h-10 px-4 text-[13.5px]`,
  'login-header': `${login} h-9 px-3.5 text-[13px]`,
  'login-block': `${login} h-[46px] w-full px-4 text-[13.5px]`
} as const;

/** The prototype's pill buttons: orange, white and login, each at the sizes the page uses. */
export function homeButton(kind: keyof typeof buttons): string {
  return cn(buttonBase, buttons[kind]);
}
