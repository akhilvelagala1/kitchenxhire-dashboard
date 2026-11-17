import { renderHook } from '@testing-library/react';
import { popoverBoundaryProps, useAnchoredPopover } from './useAnchoredPopover';

function domRect({
  top,
  left,
  width,
  height
}: {
  top: number;
  left: number;
  width: number;
  height: number;
}): DOMRect {
  return {
    top,
    left,
    width,
    height,
    bottom: top + height,
    right: left + width,
    x: left,
    y: top,
    toJSON: () => ({})
  } as DOMRect;
}

interface MountOptions {
  card: DOMRect;
  trigger: DOMRect;
  minWidth?: number;
  open?: boolean;
}

function mountPopover({ card, trigger, minWidth, open = true }: MountOptions) {
  const cardElement = document.createElement('form');
  for (const [name, value] of Object.entries(popoverBoundaryProps)) {
    cardElement.setAttribute(name, value);
  }
  const triggerElement = document.createElement('button');
  cardElement.append(triggerElement);
  document.body.append(cardElement);

  vi.spyOn(cardElement, 'getBoundingClientRect').mockReturnValue(card);
  vi.spyOn(triggerElement, 'getBoundingClientRect').mockReturnValue(trigger);

  return renderHook(() =>
    useAnchoredPopover({ open, triggerRef: { current: triggerElement }, minWidth })
  );
}

describe('useAnchoredPopover', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
  });

  it('opens below the field and caps its height when the card has room underneath', () => {
    const { result } = mountPopover({
      card: domRect({ top: 200, left: 100, width: 800, height: 700 }),
      trigger: domRect({ top: 300, left: 120, width: 380, height: 52 })
    });

    expect(result.current).toMatchObject({
      placement: 'bottom',
      top: 358,
      left: 120,
      width: 380,
      maxHeight: 260
    });
  });

  it('opens above the field instead of hanging past the bottom of the card', () => {
    const { result } = mountPopover({
      card: domRect({ top: 100, left: 100, width: 800, height: 460 }),
      trigger: domRect({ top: 480, left: 120, width: 380, height: 52 })
    });

    expect(result.current).toMatchObject({
      placement: 'top',
      bottom: 526,
      maxHeight: 260
    });
  });

  it('shrinks the menu to the space left in the card rather than a fixed height', () => {
    const { result } = mountPopover({
      card: domRect({ top: 100, left: 100, width: 800, height: 360 }),
      trigger: domRect({ top: 200, left: 120, width: 380, height: 52 })
    });

    expect(result.current).toMatchObject({ placement: 'bottom', maxHeight: 190 });
  });

  it('keeps the menu inside the card width when the field sits near its right edge', () => {
    const { result } = mountPopover({
      card: domRect({ top: 100, left: 100, width: 400, height: 700 }),
      trigger: domRect({ top: 200, left: 420, width: 380, height: 52 })
    });

    expect(result.current).toMatchObject({ left: 112, width: 376 });
  });

  it('returns no position while the menu is closed', () => {
    const { result } = mountPopover({
      card: domRect({ top: 100, left: 100, width: 800, height: 700 }),
      trigger: domRect({ top: 200, left: 120, width: 380, height: 52 }),
      open: false
    });

    expect(result.current).toBeNull();
  });
});
