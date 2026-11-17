import { Ellipsis, Lock } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/cn';
import type { HireAdminRole, RoleStatus } from '../schemas/adminCategoryRole';

/** Fixed-position anchor for the open menu, measured from the trigger when it opens. */
interface MenuPos {
  right: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

const ITEM =
  'flex min-h-11 w-full flex-col justify-center px-3 py-1.5 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:text-ink-soft disabled:hover:bg-transparent lg:min-h-9';
const ITEM_SELECTOR = '[role="menuitem"]:not(:disabled)';
/** Roughly the height of the full menu; below this much room it opens upward instead. */
const MENU_ROOM = 140;

/** Why a protected or in-use role cannot be changed, or undefined when it can. */
function blockedReason(role: HireAdminRole, forDelete: boolean): string | undefined {
  if (role.protected) return 'Protected system role';
  if (forDelete && role.users > 0) {
    return `Reassign its ${role.users.toLocaleString('en-IN')} users first`;
  }
  return undefined;
}

/**
 * The "..." menu for one role row, in a portal with fixed positioning so a table that clips its
 * overflow cannot cut it off. Choosing an item only reports it; the panel asks for confirmation.
 */
export function RoleActionMenu({
  role,
  triggerClassName,
  onSetStatus,
  onDelete
}: {
  role: HireAdminRole;
  triggerClassName: string;
  onSetStatus: (role: HireAdminRole, status: RoleStatus) => void;
  onDelete: (role: HireAdminRole) => void;
}) {
  const [pos, setPos] = useState<MenuPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const open = pos !== null;

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
    if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [])];
    const current = items.indexOf(document.activeElement as HTMLElement);
    const step = e.key === 'ArrowDown' ? 1 : -1;
    const next = current === -1 ? 0 : (current + step + items.length) % items.length;
    items[next]?.focus();
  }

  const next: RoleStatus = role.status === 'active' ? 'inactive' : 'active';
  const entries = [
    {
      label: next === 'inactive' ? 'Deactivate' : 'Activate',
      reason: blockedReason(role, false),
      run: () => onSetStatus(role, next)
    },
    { label: 'Delete role', reason: blockedReason(role, true), run: () => onDelete(role) }
  ];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`More actions for ${role.name}`}
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
            aria-label={`Actions for ${role.name}`}
            style={{ right: pos.right, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }}
            className="fixed z-50 min-w-[220px] overflow-y-auto rounded-xl border border-[#E9ECF2] bg-white py-1 shadow-lg"
            onKeyDown={onMenuKeyDown}
          >
            {entries.map((entry) => (
              <li key={entry.label} role="none">
                <button
                  type="button"
                  role="menuitem"
                  disabled={entry.reason !== undefined}
                  className={cn(
                    ITEM,
                    entry.label === 'Delete role' && !entry.reason && 'text-danger-700'
                  )}
                  onClick={() => {
                    closeMenu(true);
                    entry.run();
                  }}
                >
                  {entry.label}
                  {entry.reason && (
                    <span className="flex items-center gap-1 text-xs font-normal">
                      {role.protected && <Lock className="size-3" aria-hidden />}
                      {entry.reason}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
}
