/** Step sizes an axis may use, as multiples of a power of ten: 1, 2, 2.5 and 5 (then 10). */
const NICE_STEPS = [1, 2, 2.5, 5, 10];

/**
 * A tidy value axis for a chart: `intervals` equal steps from 0, the smallest nice step that
 * still reaches `max`. For example 1,842 over 4 intervals is 0 to 2,000 in steps of 500, and
 * 24,860 over 5 intervals is 0 to 25,000 in steps of 5,000. Nothing to draw gives a 0-to-`intervals` axis.
 */
export function niceAxis(max: number, intervals: number): { max: number; step: number } {
  if (!(max > 0) || intervals < 1) return { max: Math.max(intervals, 1), step: 1 };
  const raw = max / intervals;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = (NICE_STEPS.find((s) => s * magnitude >= raw) ?? 10) * magnitude;
  return { max: step * intervals, step };
}
