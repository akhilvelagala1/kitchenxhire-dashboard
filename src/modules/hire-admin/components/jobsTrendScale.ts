/** `YYYY-MM-DD` is a calendar day, not a UTC instant, so read it as local midnight. */
function parseDay(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(iso);
}

export function formatAxisDate(iso: string): string {
  return parseDay(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** A rounded y-axis top and its gridline values (about five steps), so the chart fits whatever the data is. */
export function niceAxis(max: number): { top: number; ticks: number[] } {
  if (!(max > 0)) return { top: 4, ticks: [0, 1, 2, 3, 4] };
  const rough = max / 5;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10);
  const top = Math.ceil(max / step) * step;
  return { top, ticks: Array.from({ length: top / step + 1 }, (_, i) => i * step) };
}

/**
 * About `target` evenly spaced x labels, counted back from the last day so the latest date is
 * always labelled. Thirty-one daily points give 25 May, 30 May, ... 24 Jun.
 */
export function sparseTicks(dates: string[], target = 7): string[] {
  if (dates.length <= target) return dates;
  const step = Math.ceil((dates.length - 1) / (target - 1));
  return dates.filter((_, i) => (dates.length - 1 - i) % step === 0);
}
