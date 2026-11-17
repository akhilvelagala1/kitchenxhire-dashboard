import { useSyncExternalStore } from 'react';

/** The `--u` unit that applies at `el`, in pixels; 1 without an element or when the value is not a length. */
function readUnit(el: Element | null): number {
  if (!el) return 1;
  const value = parseFloat(getComputedStyle(el).getPropertyValue('--u'));
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function subscribe(onChange: () => void) {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

/**
 * The page's scale unit as seen from one element, for the numbers a chart takes for its fonts, margins and
 * strokes. A page wrapper may set its own `--u` (the Applications page does), so this reads it from the
 * element, not from the root. It re-reads when the window is resized.
 */
export function useElementScale(el: Element | null): number {
  return useSyncExternalStore(
    subscribe,
    () => readUnit(el),
    () => 1
  );
}
