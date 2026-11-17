/** 1482 -> "1,482", as on the other screens. */
export function formatCount(value: number): string {
  return value.toLocaleString('en-IN');
}

/** `count` out of `total` as a percent with one decimal, for example 28.9. Zero when the total is zero. */
export function sharePct(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
}

/** "28.9%". Worked out here from the counts; the API never sends a percentage. */
export function formatShare(count: number, total: number): string {
  return `${sharePct(count, total).toFixed(1)}%`;
}

/** A change in percent, rounded to one decimal (as a size, with no sign), and which way it went. Zero is flat. */
export function describeChange(change: number): {
  pct: number;
  direction: 'up' | 'down' | 'flat';
} {
  const pct = Math.round(Math.abs(change) * 10) / 10;
  const direction = pct === 0 ? 'flat' : change > 0 ? 'up' : 'down';
  return { pct, direction };
}

/** 6.8 -> "6.8 days", always with one decimal. No average is a dash, never a made-up number. */
export function formatDays(days: number | null): string {
  return days === null ? '—' : `${days.toFixed(1)} days`;
}
