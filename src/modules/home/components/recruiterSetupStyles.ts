import { cn } from '@/shared/lib/cn';
import { homeButton } from './styles';

export const recruiterSetupPage =
  'bg-[#fff8f4] motion-safe:animate-rise-in motion-reduce:animate-none';

/** Desktop org setup: cap page height; scroll only if content exceeds viewport. */
export const recruiterSetupPageOrgFit =
  'w-full min-w-0 min-[1024px]:max-h-[calc(100dvh-60px)] min-[1024px]:overflow-y-auto';

export const recruiterSetupGrid =
  'mx-auto grid w-full max-w-[1550px] gap-5 px-4 pb-6 pt-5 min-[1024px]:grid-cols-[minmax(280px,378px)_minmax(0,1fr)] min-[1024px]:gap-[22px] min-[1024px]:px-6 min-[1024px]:pt-6';

export const recruiterSetupGridOrgFit =
  'w-full min-w-0 min-[1024px]:items-stretch min-[1024px]:px-6 min-[1024px]:pb-4 min-[1024px]:pt-3';

/** Post a Job: reference 330px sidebar + ~1200px form at 1672px viewport. */
export const recruiterSetupPagePostJobFit =
  'flex min-h-[calc(100dvh-60px)] w-full min-w-0 flex-1 flex-col bg-[#fff8f4] min-[1024px]:max-h-[calc(100dvh-60px)] min-[1024px]:overflow-y-auto';

export const recruiterSetupGridPostJobFit =
  'w-full min-w-0 min-[1024px]:max-w-[1572px] min-[1024px]:items-stretch min-[1024px]:grid-cols-[330px_minmax(0,1fr)] min-[1024px]:px-[50px] min-[1024px]:pb-[34px] min-[1024px]:pt-7';

export const recruiterSetupPostJobPanelColumn =
  'flex h-full min-h-0 w-full min-w-0 items-stretch self-stretch';

const recruiterSetupFormCardCompactBase =
  'rounded-[20px] border border-[#eee9e7] bg-surface p-4 shadow-[0_8px_24px_rgb(25_30_45/0.07)] min-[1024px]:p-[30px]';

/** Organization form: content height; paired with left panel in org grid row. */
export const recruiterSetupFormCardOrgFit = cn(
  recruiterSetupFormCardCompactBase,
  'h-full w-full min-w-0 min-[1024px]:p-6 min-[1024px]:pb-5'
);

/** Left panel column: height follows reference art aspect at column width. */
export const recruiterSetupOrgPanelColumn =
  'flex h-full min-h-0 w-full min-w-0 items-stretch self-stretch';

export const recruiterSetupInfoPanelPostJob =
  'relative flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] bg-[#fff1e9] px-6 py-7 min-[1024px]:px-7 min-[1024px]:py-7';

/** Post a Job form card: white panel, compact padding, footer pinned with flex. */
export const recruiterSetupFormCardPostJobFit = cn(
  recruiterSetupFormCardCompactBase,
  'flex h-full min-h-0 w-full min-w-0 flex-col border-[#edf0f5] min-[1024px]:px-[30px] min-[1024px]:pb-[18px] min-[1024px]:pt-7'
);

export const recruiterSetupFieldClass =
  'min-h-[50px] w-full rounded-[11px] border border-[#d7deea] bg-surface px-4 text-[16px] font-medium text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-400 focus-visible:border-brand-600 focus-visible:shadow-focus-ring aria-invalid:border-danger-600 aria-invalid:focus-visible:border-danger-600';

/** Reference input height ~43px (Post a Job compact form). */
export const recruiterSetupFieldClassPostJob =
  'h-[43px] min-h-0 w-full rounded-[12px] border border-[#d8dfea] bg-surface px-3.5 text-[16px] font-medium text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[16px] placeholder:font-normal placeholder:text-ink-400 focus:border-[#d8dfea] focus:outline-none focus-visible:border-brand-600 focus-visible:shadow-focus-ring aria-invalid:border-danger-600 aria-invalid:focus-visible:border-danger-600 data-[valid=true]:border-success-700';

export const recruiterSetupTextareaClassPostJob =
  'min-h-[88px] w-full resize-y rounded-[12px] border border-[#d8dfea] bg-surface px-3.5 py-2.5 text-[16px] font-medium text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[16px] placeholder:font-normal placeholder:text-ink-400 focus:border-[#d8dfea] focus:outline-none focus-visible:border-brand-600 focus-visible:shadow-focus-ring aria-invalid:border-danger-600 aria-invalid:focus-visible:border-danger-600 data-[valid=true]:border-success-700';

/** Post a Job field grids (reference column ratios). */
export const recruiterPostJobGridDetailsRow2 =
  'min-[1024px]:grid-cols-[1.2fr_1.7fr_1.6fr_1.5fr] min-[1024px]:gap-x-6';

export const recruiterPostJobGridCandidateRow1 =
  'min-[1024px]:grid-cols-[1fr_1.2fr_1.35fr] min-[1024px]:gap-x-6';

export const recruiterPostJobGridCandidateRow2 =
  'min-[1024px]:grid-cols-[1fr_1fr_1.35fr] min-[1024px]:gap-x-6';

export const recruiterSetupSectionTitlePostJob =
  'text-[22px] font-bold tracking-tight text-[#151515] min-[1024px]:text-[24px]';

export const recruiterSetupFieldLabelPostJob = 'text-[16px] font-semibold text-[#151515]';

export const recruiterSetupFormTitle =
  'text-[28px] font-extrabold leading-[1.1] tracking-tight text-ink min-[1024px]:text-[32px]';

export const recruiterSetupFormLead = 'mt-1 text-[18px] font-medium leading-snug text-ink-500';

export const recruiterSetupFormTitlePostJob =
  'text-[28px] font-extrabold leading-[1.12] tracking-tight text-[#151515] min-[1024px]:text-[34px] min-[1024px]:font-[800]';

export const recruiterSetupFormLeadPostJob =
  'mt-1.5 text-[16px] font-medium leading-snug text-[#243754] min-[1024px]:mt-2 min-[1024px]:text-[18px]';

export const recruiterSetupSectionTitle = 'text-[22px] font-extrabold tracking-tight text-ink';

export const recruiterSetupSectionTitleCompact =
  'text-[22px] font-extrabold tracking-tight text-ink min-[1024px]:text-[24px]';

export const recruiterSetupSectionTitleOrgFit =
  'text-[20px] font-extrabold tracking-tight text-ink min-[1024px]:text-[22px]';

export function recruiterSetupPrimaryButton(): string {
  return cn(
    homeButton('orange-base'),
    'min-h-[52px] rounded-2xl px-6 text-[17px] font-bold disabled:opacity-60'
  );
}

export function recruiterSetupSecondaryButton(): string {
  return cn(homeButton('white-base'), 'min-h-[52px] rounded-2xl px-6 text-[17px] font-bold');
}

export function recruiterSetupPrimaryButtonOrgFit(): string {
  return cn(
    homeButton('orange-base'),
    'min-h-[48px] rounded-2xl px-5 text-[16px] font-bold disabled:opacity-60'
  );
}

export function recruiterSetupSecondaryButtonOrgFit(): string {
  return cn(homeButton('white-base'), 'min-h-[48px] rounded-2xl px-5 text-[16px] font-bold');
}

export function recruiterSetupPrimaryButtonPostJob(): string {
  return cn(
    homeButton('orange-base'),
    'min-h-[50px] min-w-[185px] rounded-[15px] px-6 text-[17px] font-bold shadow-[0_6px_18px_rgb(255_79_24/0.22)] disabled:opacity-60'
  );
}

export function recruiterSetupSecondaryButtonPostJob(): string {
  return cn(
    homeButton('white-base'),
    'min-h-[50px] min-w-[120px] rounded-[15px] border-[#d8dfea] px-6 text-[17px] font-semibold'
  );
}

/** Reference-proportions dashed upload (organization GST certificate). */
export const recruiterSetupUploadBoxOrg =
  'flex w-full min-h-[80px] flex-col gap-2 rounded-[15px] border border-dashed border-[#cdd6e5] bg-surface px-3.5 py-3 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between min-[640px]:gap-3 min-[640px]:px-4';

export const recruiterSetupUploadIconOrg =
  'grid size-12 shrink-0 place-items-center rounded-xl bg-[#fff0e8] text-brand-600 min-[1024px]:size-[52px] min-[1024px]:rounded-2xl';

export function recruiterSetupAddFileButton(): string {
  return cn(
    homeButton('white-base'),
    'min-h-[44px] min-w-[132px] shrink-0 rounded-xl px-4 text-[15px] font-bold'
  );
}

export const recruiterSetupIconTile =
  'grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0e8] text-brand-600';
