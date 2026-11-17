import { Mail, MapPin, Phone } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

/** Pastel background and dark letter pairs; every letter colour is at least 4.5:1 on its background. */
const AVATAR_TONES = [
  'bg-[#DDF8E7] text-[#15803D]',
  'bg-[#FFF0D2] text-[#A16207]',
  'bg-[#FFE0E8] text-[#BE123C]',
  'bg-[#E0EDFF] text-[#1D4ED8]',
  'bg-[#EEE5FF] text-[#6D28D9]',
  'bg-[#FFEADB] text-[#EA580C]'
] as const;

/** The same id always gets the same colour, so a person keeps theirs across pages and reloads. */
function toneFor(id: string): string {
  let sum = 0;
  for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i);
  return AVATAR_TONES[sum % AVATAR_TONES.length]!;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

/** Round avatar with initials, then the name and the e-mail under it. */
export function JobSeekerCell({ id, name, email }: { id: string; name: string; email: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden
        data-testid="job-seeker-avatar"
        className={cn(
          'inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold',
          toneFor(id)
        )}
      >
        {initials(name)}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[13px] font-bold text-[#111827]" title={name}>
          {name}
        </span>
        <span className="truncate text-[11px] leading-[14px] text-[#64748B]" title={email}>
          {email}
        </span>
      </span>
    </span>
  );
}

/** Email and phone stacked with icons. */
export function JobSeekerContactCell({ email, phone }: { email: string; phone: string }) {
  return (
    <span className="flex min-w-0 flex-col gap-1">
      <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-[#334155]" title={email}>
        <Mail aria-hidden className="size-3.5 shrink-0 text-[#94A3B8]" />
        <span className="truncate">{email}</span>
      </span>
      <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-[#334155]" title={phone}>
        <Phone aria-hidden className="size-3.5 shrink-0 text-[#94A3B8]" />
        <span className="truncate">{phone}</span>
      </span>
    </span>
  );
}

/** Location pin + city, state. */
export function JobSeekerLocationCell({ city, state }: { city: string; state: string }) {
  const place = [city, state].filter(Boolean).join(', ');
  return (
    <span className="flex min-w-0 items-center gap-1.5" title={place}>
      <MapPin aria-hidden className="size-3.5 shrink-0 text-[#64748B]" />
      <span className="truncate text-[12px] font-medium text-[#111827]">{place}</span>
    </span>
  );
}

function progressTone(value: number): string {
  if (value >= 75) return 'bg-[#22C55E]';
  if (value >= 50) return 'bg-[#F4B400]';
  return 'bg-[#EF4444]';
}

/** Percentage label above a 96×8 progress bar. */
export function JobSeekerCompletionCell({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <span className="flex w-24 flex-col gap-1">
      <span className="text-[13px] font-semibold tabular-nums text-[#111827]">{clamped}%</span>
      <span
        className="block h-2 overflow-hidden rounded-full bg-[#E9EDF3]"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Profile ${clamped}% complete`}
      >
        <span
          className={cn('block h-full rounded-full', progressTone(clamped))}
          style={{ width: `${clamped}%` }}
        />
      </span>
    </span>
  );
}
