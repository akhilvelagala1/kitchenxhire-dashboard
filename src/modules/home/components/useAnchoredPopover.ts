import { useCallback, useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

/**
 * Spread onto the card a menu must stay inside (the profile form). Without it the
 * viewport is the boundary, which is how header pickers behave.
 */
export const popoverBoundaryProps = { 'data-dropdown-boundary': '' } as const;

const BOUNDARY_SELECTOR = '[data-dropdown-boundary]';
/** Distance kept between the trigger and its menu. */
const ANCHOR_GAP = 6;
/** Distance kept between the menu and the boundary edge. */
const BOUNDARY_INSET = 12;
/** Under this much room, opening downwards is not worth it. */
const MIN_DOWNWARD_SPACE = 132;
/** Long lists scroll inside the menu instead of growing past this. */
const MENU_MAX_HEIGHT = 260;

type PopoverPlacement = 'top' | 'bottom';

interface PopoverPosition {
  placement: PopoverPlacement;
  /** Distance from the viewport top. Read when `placement` is "bottom". */
  top: number;
  /** Distance from the viewport bottom. Read when `placement` is "top". */
  bottom: number;
  left: number;
  width: number;
  maxHeight: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function samePosition(a: PopoverPosition, b: PopoverPosition): boolean {
  return (
    a.placement === b.placement &&
    a.top === b.top &&
    a.bottom === b.bottom &&
    a.left === b.left &&
    a.width === b.width &&
    a.maxHeight === b.maxHeight
  );
}

/** Places a menu against its trigger, inside the boundary card and never past the viewport. */
function measure(trigger: HTMLElement, minWidth: number): PopoverPosition {
  const triggerRect = trigger.getBoundingClientRect();
  const boundaryRect = trigger.closest(BOUNDARY_SELECTOR)?.getBoundingClientRect();

  // The card is the boundary; the viewport still wins when the card scrolls past it.
  const edge = {
    top: Math.max(boundaryRect?.top ?? 0, 0),
    bottom: Math.min(boundaryRect?.bottom ?? window.innerHeight, window.innerHeight),
    left: Math.max(boundaryRect?.left ?? 0, 0),
    right: Math.min(boundaryRect?.right ?? window.innerWidth, window.innerWidth)
  };

  const spaceBelow = edge.bottom - BOUNDARY_INSET - triggerRect.bottom - ANCHOR_GAP;
  const spaceAbove = triggerRect.top - ANCHOR_GAP - edge.top - BOUNDARY_INSET;
  const placement: PopoverPlacement =
    spaceBelow < MIN_DOWNWARD_SPACE && spaceAbove > spaceBelow ? 'top' : 'bottom';

  // Anchor the far edge so a short list hugs the trigger instead of leaving a gap.
  const space = Math.max(placement === 'top' ? spaceAbove : spaceBelow, 0);

  const naturalWidth = Math.max(triggerRect.width, minWidth);
  const boundaryWidth = edge.right - edge.left - BOUNDARY_INSET * 2;
  const width = boundaryWidth > 0 ? Math.min(naturalWidth, boundaryWidth) : naturalWidth;
  const minLeft = edge.left + BOUNDARY_INSET;
  const left = clamp(
    triggerRect.left,
    minLeft,
    Math.max(edge.right - BOUNDARY_INSET - width, minLeft)
  );

  return {
    placement,
    top: triggerRect.bottom + ANCHOR_GAP,
    bottom: window.innerHeight - triggerRect.top + ANCHOR_GAP,
    left,
    width,
    maxHeight: Math.min(space, MENU_MAX_HEIGHT)
  };
}

interface UseAnchoredPopoverOptions {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  /** Floor for the menu width, e.g. a search panel wider than its control. */
  minWidth?: number;
}

/**
 * Fixed coordinates for a menu anchored to a form control, recalculated on scroll,
 * resize, and any change to the trigger or its boundary card.
 */
export function useAnchoredPopover({
  open,
  triggerRef,
  minWidth = 0
}: UseAnchoredPopoverOptions): PopoverPosition | null {
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  const place = useCallback(() => {
    if (!triggerRef.current) return;
    const next = measure(triggerRef.current, minWidth);
    setPosition((current) => (current && samePosition(current, next) ? current : next));
  }, [minWidth, triggerRef]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    const trigger = triggerRef.current;
    const boundary = trigger?.closest(BOUNDARY_SELECTOR);
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => place());
    if (boundary) observer?.observe(boundary);
    if (trigger) observer?.observe(trigger);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      observer?.disconnect();
    };
  }, [open, place, triggerRef]);

  return open ? position : null;
}

/** Modals with the browser top layer would paint over a body portal, so those host their menu. */
export function usePopoverPortalRoot(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>
): HTMLElement | null {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const dialog = triggerRef.current?.closest('dialog');
    setRoot(dialog instanceof HTMLElement ? dialog : document.body);
  }, [open, triggerRef]);

  return root;
}

/** Inline style for the portalled menu. `top` or `bottom` is set by the placement. */
export function popoverStyle(position: PopoverPosition): CSSProperties {
  return {
    top: position.placement === 'bottom' ? position.top : undefined,
    bottom: position.placement === 'top' ? position.bottom : undefined,
    left: position.left,
    width: position.width,
    maxHeight: position.maxHeight
  };
}
