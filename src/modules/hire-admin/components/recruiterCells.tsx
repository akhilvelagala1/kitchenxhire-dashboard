import { Mail, MapPin, Phone, Store } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

/** Avatar initials + recruiter name + role line. */
export function RecruiterPersonCell({ name }: { name: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden
        className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#FFE8DF] text-[12px] font-bold text-[#FF4B16]"
      >
        {initials(name)}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[12px] font-semibold text-[#111827]" title={name}>
          {name}
        </span>
        <span className="truncate text-[11px] font-normal text-[#64748B]">Recruiter</span>
      </span>
    </span>
  );
}

/** Email and phone stacked with icons. */
export function RecruiterContactCell({ email, phone }: { email: string; phone: string }) {
  return (
    <span className="flex min-w-0 flex-col gap-1">
      <span
        className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-[#334155]"
        title={email}
      >
        <Mail aria-hidden className="size-3.5 shrink-0 text-[#94A3B8]" />
        <span className="truncate">{email}</span>
      </span>
      <span
        className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-[#334155]"
        title={phone}
      >
        <Phone aria-hidden className="size-3.5 shrink-0 text-[#94A3B8]" />
        <span className="truncate">{phone}</span>
      </span>
    </span>
  );
}

/** Company name + location stacked with icons. */
export function RecruiterCompanyCell({
  name,
  area,
  city
}: {
  name: string;
  area: string;
  city: string;
}) {
  const place = [area, city].filter(Boolean).join(', ');
  return (
    <span className="flex min-w-0 flex-col gap-1">
      <span className="flex min-w-0 items-center gap-1.5" title={name}>
        <Store aria-hidden className="size-4 shrink-0 text-[#94A3B8]" />
        <span className="truncate text-[12.5px] font-semibold text-[#111827]">{name}</span>
      </span>
      <span className="flex min-w-0 items-center gap-1.5" title={place}>
        <MapPin aria-hidden className="size-3 shrink-0 text-[#94A3B8]" />
        <span className={cn('truncate text-[11.5px] text-[#64748B]')}>{place}</span>
      </span>
    </span>
  );
}
