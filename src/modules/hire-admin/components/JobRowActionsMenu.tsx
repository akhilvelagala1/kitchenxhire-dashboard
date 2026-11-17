import { Ellipsis } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { useApiMutation } from '@/shared/api/useApiMutation';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { cn } from '@/shared/lib/cn';
import { adminJobsApi } from '../api/adminJobsApi';
import { adminJobsKeys } from '../api/adminJobsKeys';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminJob } from '../schemas/adminJob';

type Confirm = 'pause' | 'close' | 'delete';

/** Fixed-position anchor for the open menu, measured from the trigger when it opens. */
interface MenuPos {
  right: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

const ITEM =
  'w-full px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none disabled:opacity-50 disabled:hover:bg-transparent';
const ITEM_SELECTOR = '[role="menuitem"]:not(:disabled)';
/** Roughly the height of the full menu; below this much room it opens upward instead. */
const MENU_ROOM = 260;

/**
 * Three-dot menu for one job row. The list is rendered in a portal with fixed positioning, so a
 * table that clips its overflow (the dense Jobs card) can never cut it off.
 */
export function JobRowActionsMenu({
  job,
  triggerClassName
}: {
  job: HireAdminJob;
  /** Optional trigger chrome; Jobs redesign uses bordered 36px icon buttons. */
  triggerClassName?: string;
}) {
  const navigate = useNavigate();
  const [pos, setPos] = useState<MenuPos | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const open = pos !== null;

  const patch = useApiMutation({
    mutationFn: (vars: { status: HireAdminJob['status'] }) =>
      adminJobsApi.patch(job.job_id, { status: vars.status }),
    invalidates: [adminJobsKeys.all],
    onSuccess: () => setConfirm(null)
  });

  const del = useApiMutation({
    mutationFn: (_: void) => adminJobsApi.delete(job.job_id),
    invalidates: [adminJobsKeys.all],
    onSuccess: () => setConfirm(null)
  });

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
      maxHeight: Math.max(160, up ? above : below)
    });
  }

  function onMenuKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [])];
    const current = items.indexOf(document.activeElement as HTMLElement);
    const down = e.key === 'ArrowDown';
    const next =
      current === -1
        ? down
          ? 0
          : items.length - 1
        : (current + (down ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  }

  function go(to: string) {
    setPos(null);
    navigate(to);
  }

  function ask(which: Confirm) {
    setPos(null);
    setConfirm(which);
  }

  const viewLinks = [
    { label: 'View Job Details', to: `/admin/jobs/${job.job_id}` },
    {
      label: 'View Applications',
      to: `/admin/applications?job_id=${encodeURIComponent(job.job_id)}&job_label=${encodeURIComponent(`${job.title} (${job.business_name}) · ${job.job_id}`)}`
    },
    {
      label: 'View Recruiter Details',
      to: `/admin/recruiters?search=${encodeURIComponent(job.business_name)}`
    }
  ];

  return (
    <div className="flex justify-center">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Actions for ${job.job_id}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className={
          triggerClassName ??
          'inline-flex size-8 items-center justify-center rounded-md text-ink-soft hover:bg-muted focus-visible:outline-2 focus-visible:outline-brand-600 lg:size-6'
        }
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
            style={{ right: pos.right, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }}
            className="fixed z-50 min-w-[200px] overflow-y-auto rounded-xl border border-[#E9ECF2] bg-white py-1 shadow-lg"
            onKeyDown={onMenuKeyDown}
          >
            {viewLinks.map((link) => (
              <li key={link.label} role="none">
                <button type="button" role="menuitem" className={ITEM} onClick={() => go(link.to)}>
                  {link.label}
                </button>
              </li>
            ))}
            <PermissionGate permission={P.manage}>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={ITEM}
                  onClick={() => go(`/admin/jobs/${job.job_id}/edit`)}
                >
                  Edit Job
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={ITEM}
                  disabled={job.status === 'paused'}
                  onClick={() => ask('pause')}
                >
                  Pause Job
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={ITEM}
                  disabled={job.status === 'closed'}
                  onClick={() => ask('close')}
                >
                  Close Job
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={cn(ITEM, 'text-danger-600 hover:bg-danger-50')}
                  onClick={() => ask('delete')}
                >
                  Delete Job
                </button>
              </li>
            </PermissionGate>
          </ul>,
          document.body
        )}

      <ConfirmDialog
        open={confirm === 'pause'}
        title="Pause this job?"
        message="Candidates will not see this posting until you activate it again."
        confirmLabel="Pause job"
        tone="primary"
        loading={patch.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => patch.mutate({ status: 'paused' })}
      />
      <ConfirmDialog
        open={confirm === 'close'}
        title="Close this job?"
        message="Closing marks the role as filled or cancelled."
        confirmLabel="Close job"
        tone="primary"
        loading={patch.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => patch.mutate({ status: 'closed' })}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        title="Delete this job?"
        message="This removes the job from the active list in this environment."
        confirmLabel="Delete job"
        tone="danger"
        loading={del.isPending}
        requireReason
        onCancel={() => setConfirm(null)}
        onConfirm={() => del.mutate()}
      />
    </div>
  );
}
