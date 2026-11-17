const parts = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
});

/** Posted On cell matching the Jobs redesign: `11 Nov 2026, 09:44 AM`. */
export function formatPostedOn(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const p = Object.fromEntries(parts.formatToParts(date).map((x) => [x.type, x.value]));
  const dayPeriod = String(p.dayPeriod ?? '').toUpperCase();
  return `${p.day} ${p.month} ${p.year}, ${p.hour}:${p.minute} ${dayPeriod}`;
}
