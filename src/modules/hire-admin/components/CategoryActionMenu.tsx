import { Ellipsis } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import type { CategoryStatus, HireAdminCategory } from '../schemas/adminCategoryRole';

/** Fixed-position anchor for the open menu, measured from the trigger when it opens. */
interface MenuPos {
  right: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

const ITEM =
  'flex min-h-11 w-full items-center px-3 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600 lg:min-h-9';
const ITEM_SELECTOR = '[role="menuitem"]:not(:disabled)';
/** Roughly the height of the full menu; below this much room it opens upward instead. */
const MENU_ROOM = 130;

/** What the menu offers for each status. An archived category can only be brought back. */
const CHANGES: Record<CategoryStatus, { label: string; status: CategoryStatus }[]> = {
  active: [
    { label: 'Deactivate', status: 'inactive' },
    { label: 'Archive', status: 'archived' }
  ],
  inactive: [
    { label: 'Activate', status: 'active' },
    { label: 'Archive', status: 'archived' }
  ],
  archived: [{ label: 'Activate', status: 'active' }]
};

/**
 * The "..." menu for one category row, drawn in a portal with fixed positioning so a table that
 * clips its overflow can never cut it off. Choosing an item only reports it through `onSetStatus`;
 * the panel asks for confirmation before deactivating or archiving.
 */
export function CategoryActionMenu({
  category,
  triggerClassName,
  onSetStatus
}: {
  category: HireAdminCategory;
  triggerClassName: string;
  onSetStatus: (category: HireAdminCategory, status: CategoryStatus) => void;
}) {
  const [pos, setPos] = useState<MenuPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const open = pos !== null;
  const id = category.category_id;

  function closeMenu(restoreFocus: boolean) {
    setPos(null);
    if (restoreFocus) triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const close = () => setPos(null);
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      close();
      triggerRef.current?.focus();
    };
    // The menu is anchored to the viewport, so any other scroll or resize would leave it adrift.
    const onScroll = (e: Event) => {
      if (!menuRef.current?.contains(e.target as Node)) close();
    };
    menuRef.current?.querySelector<HTMLElement>(ITEM_SELECTOR)?.focus();
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  function toggle() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (open || !rect) return setPos(null);
    const below = window.innerHeight - rect.bottom - 8;
    const above = rect.top - 8;
    const up = below < MENU_ROOM && above > below;
    setPos({
      right: window.innerWidth - rect.right,
      ...(up ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
      maxHeight: Math.max(120, up ? above : below)
    });
  }

  function onMenuKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === 'Tab') {
      // Tab leaves the menu: close it and put focus back on the button, so the next Tab moves on.
      e.preventDefault();
      closeMenu(true);
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [])];
    const current = items.indexOf(document.activeElement as HTMLElement);
    const step = e.key === 'ArrowDown' ? 1 : -1;
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? items.length - 1
          : current === -1
            ? step === 1
              ? 0
              : items.length - 1
            : (current + step + items.length) % items.length;
    items[next]?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`More actions for ${id}`}
        className={triggerClassName}
        onClick={toggle}
      >
        <Ellipsis className="size-4" aria-hidden />
      </button>
      {pos &&
        createPortal(
          <ul
            id={listId}
            ref={menuRef}
            role="menu"
            aria-label={`Actions for ${id}`}
            style={{ right: pos.right, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }}
            className="fixed z-50 min-w-[200px] overflow-y-auto rounded-xl border border-[#E9ECF2] bg-white py-1 shadow-lg"
            onKeyDown={onMenuKeyDown}
          >
            {CHANGES[category.status].map((change) => (
              <li key={change.label} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={ITEM}
                  onClick={() => {
                    closeMenu(true);
                    onSetStatus(category, change.status);
                  }}
                >
                  {change.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
}
