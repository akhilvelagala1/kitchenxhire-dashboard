import { Ellipsis } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { toast } from '@/shared/ui/toast';
import type { HireAdminUser, UserSettableStatus } from '../schemas/adminUser';

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
const MENU_ROOM = 160;

/** What the menu offers for each status. A pending invite cannot be changed by hand. */
const CHANGES: Record<HireAdminUser['status'], { label: string; status: UserSettableStatus }[]> = {
  active: [
    { label: 'Deactivate', status: 'inactive' },
    { label: 'Suspend', status: 'suspended' }
  ],
  inactive: [
    { label: 'Activate', status: 'active' },
    { label: 'Suspend', status: 'suspended' }
  ],
  suspended: [{ label: 'Reactivate', status: 'active' }],
  pending: []
};

/**
 * The "..." menu for one user row. The list is rendered in a portal with fixed positioning, so a
 * table that clips its overflow can never cut it off. Choosing a status change only reports it
 * through `onSetStatus`; the table section asks for confirmation.
 */
export function UserActionMenu({
  user,
  triggerClassName,
  onSetStatus
}: {
  user: HireAdminUser;
  triggerClassName: string;
  onSetStatus: (user: HireAdminUser, status: UserSettableStatus) => void;
}) {
  const [pos, setPos] = useState<MenuPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const open = pos !== null;
  const id = user.user_id;

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

  async function copyId() {
    closeMenu(true);
    try {
      await navigator.clipboard.writeText(id);
      toast.success('User ID copied');
    } catch {
      toast.error('Could not copy the user ID. Copy it from the table instead.');
    }
  }

  const changes = CHANGES[user.status];

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
            className="fixed z-50 min-w-[220px] overflow-y-auto rounded-xl border border-[#E9ECF2] bg-white py-1 shadow-lg"
            onKeyDown={onMenuKeyDown}
          >
            {changes.map((change) => (
              <li key={change.label} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={ITEM}
                  onClick={() => {
                    closeMenu(true);
                    onSetStatus(user, change.status);
                  }}
                >
                  {change.label}
                </button>
              </li>
            ))}
            {changes.length > 0 && <li role="separator" className="my-1 border-t border-line" />}
            <li role="none">
              <button type="button" role="menuitem" className={ITEM} onClick={copyId}>
                Copy user ID
              </button>
            </li>
          </ul>,
          document.body
        )}
    </>
  );
}
