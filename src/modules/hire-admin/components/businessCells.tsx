import { MapPin, Store } from 'lucide-react';

/** `9876543210` as `+91 98765 43210`. Anything that is not 10 digits is shown as it came. */
function formatBusinessPhone(phone: string): string {
  return /^\d{10}$/.test(phone) ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : phone;
}

/**
 * Pale-orange store tile (same for every business) plus the business name and location under it.
 */
export function BusinessCell({ name, area, city }: { name: string; area: string; city: string }) {
  const place = [area, city].filter(Boolean).join(', ');
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden
        data-testid="business-tile"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FFE9E1] text-[#FF4B16]"
      >
        <Store className="size-4" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[12.5px] font-bold text-[#111827]" title={name}>
          {name}
        </span>
        <span
          className="flex min-w-0 items-center gap-1 text-[10.8px] leading-[14px] text-[#64748B]"
          title={place}
        >
          <MapPin aria-hidden className="size-3 shrink-0" />
          <span className="truncate">{place}</span>
        </span>
      </span>
    </span>
  );
}

/** Primary contact: owner name in bold and the phone number under it. */
export function BusinessContactCell({ owner, phone }: { owner: string; phone: string }) {
  const display = formatBusinessPhone(phone);
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-[12.5px] font-semibold text-[#111827]" title={owner}>
        {owner}
      </span>
      <span className="truncate text-[11px] text-[#64748B]" title={display}>
        {display}
      </span>
    </span>
  );
}
