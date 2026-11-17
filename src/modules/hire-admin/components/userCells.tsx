import { cn } from '@/shared/lib/cn';
import type { UserRole } from '../schemas/adminUser';

/** Pastel background and dark letter pairs; every letter colour is at least 4.5:1 on its background. */
const AVATAR_TONES = [
  'bg-[#DCFCE7] text-[#15803D]',
  'bg-[#FFF0D5] text-[#A16207]',
  'bg-[#FFE4EB] text-[#BE185D]',
  'bg-[#E0ECFF] text-[#2563EB]',
  'bg-[#EEE7FF] text-[#7C3AED]'
] as const;

/** The same id always gets the same colour, so a person keeps theirs across pages and reloads. */
function toneFor(id: string): string {
  const n = Number(id.replace(/\D/g, '')) || 0;
  return AVATAR_TONES[n % AVATAR_TONES.length]!;
}

/** Up to two initials from the display name. */
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]!)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Round avatar with initials, then the name and the e-mail under it. */
export function UserCell({
  id,
  name,
  email,
  size = 'md'
}: {
  id: string;
  name: string;
  email: string;
  size?: 'md' | 'lg';
}) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden
        data-testid="user-avatar"
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full font-bold',
          size === 'lg' ? 'size-12 text-lg' : 'size-9 text-[13px]',
          toneFor(id)
        )}
      >
        {initials(name) || '?'}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[12.5px] font-bold text-[#182230]" title={name}>
          {name}
        </span>
        <span className="truncate text-[10.5px] leading-[14px] text-[#667085]" title={email}>
          {email}
        </span>
      </span>
    </span>
  );
}

const ROLE_TONES: Record<UserRole, string> = {
  'Super Admin': 'bg-[#FFE7DE] text-[#C2410C]',
  'HR Manager': 'bg-[#EEE5FF] text-[#6D28D9]',
  'HR Executive': 'bg-[#E0ECFF] text-[#1D4ED8]',
  Support: 'bg-[#E9EDF2] text-[#475569]',
  Analyst: 'bg-[#DCFCE7] text-[#15803D]'
};

/** The role as a pill; the colour only groups, the name says what it is. */
export function UserRoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap',
        ROLE_TONES[role]
      )}
    >
      {role}
    </span>
  );
}
