import { MapPin, User } from 'lucide-react';
import type { ReactNode } from 'react';

/** Primary cell line — Candidate name, Job title, Outlet, Application ID, Applied On. */
export const CELL_PRIMARY = 'truncate text-[13px] font-semibold leading-5 text-[#172033]';

/** Secondary cell line — location, employment type, recruiter. */
const CELL_SECONDARY =
  'flex min-w-0 items-center gap-1 text-[12px] font-normal leading-4 text-[#64748B]';

/** Up to two capital letters: first and last word of the name. `Rahul Kumar` is `RK`, `Meena` is `M`. */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0]!.charAt(0);
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : '';
  return (first + last).toUpperCase();
}

function SubLine({ icon, text }: { icon?: ReactNode; text: string }) {
  return (
    <span className={CELL_SECONDARY} title={text}>
      {icon}
      <span className="truncate">{text}</span>
    </span>
  );
}

/**
 * Round peach avatar with bold orange initials and the name. The candidate's city goes under the
 * name when `location` is given; a table that has no city leaves it out and the name stands alone.
 */
export function CandidateCell({ name, location }: { name: string; location?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFE8DF] text-[12px] font-bold text-[#F04418]"
      >
        {initialsOf(name)}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={CELL_PRIMARY} title={name}>
          {name}
        </span>
        {location !== undefined && (
          <SubLine icon={<MapPin aria-hidden className="size-3 shrink-0" />} text={location} />
        )}
      </span>
    </span>
  );
}

/** Rounded-square peach tile around `icon`, the job title and the employment type under it. */
export function JobCell({ icon, title, type }: { icon: ReactNode; title: string; type: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-[#FFEBE4] text-brand-600"
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={CELL_PRIMARY} title={title}>
          {title}
        </span>
        <SubLine text={type} />
      </span>
    </span>
  );
}

/** Outlet name with the recruiter's name and a user icon under it. */
export function OutletCell({ outlet, recruiter }: { outlet: string; recruiter: string }) {
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className={CELL_PRIMARY} title={outlet}>
        {outlet}
      </span>
      <SubLine icon={<User aria-hidden className="size-3 shrink-0" />} text={recruiter} />
    </span>
  );
}
