const parts = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
});

/**
 * "Last Login" cell in India time: `10 Nov, 9:42 AM`, with the year when it is not this year.
 * Someone who never signed in shows `Invite sent` while the invite is pending, else `Never`.
 */
export function formatLastLogin(
  iso: string | null,
  pending: boolean,
  now: Date = new Date()
): string {
  if (iso === null) return pending ? 'Invite sent' : 'Never';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const p = Object.fromEntries(parts.formatToParts(date).map((x) => [x.type, x.value]));
  const year = Number(p.year) === now.getFullYear() ? '' : ` ${p.year}`;
  return `${p.day} ${p.month}${year}, ${p.hour}:${p.minute} ${String(p.dayPeriod).toUpperCase()}`;
}
