import { Ellipsis } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { toast } from '@/shared/ui/toast';
import type { HireAdminJobSeeker, JobSeekerStatus } from '../schemas/adminJobSeeker';
import { useSetJobSeekerStatus } from './jobSeekerMutations';

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
const MENU_ROOM = 200;

/** Activating, deactivating or suspending asks first and names the job seeker. */
export function JobSeekerStatusDialog({
  jobSeeker,
  status,
  loading,
  onCancel,
  onConfirm
}: {
  jobSeeker: HireAdminJobSeeker;
  /** The status to set, or null while the dialog is closed. */
  status: JobSeekerStatus | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const activating = status === 'active';
  const suspending = status === 'suspended';
  const title = activating
    ? 'Activate this job seeker?'
    : suspending
      ? 'Suspend this job seeker?'
      : 'Deactivate this job seeker?';
  const message = activating
    ? `${jobSeeker.name}'s account will be marked as Active.`
    : suspending
      ? `${jobSeeker.name}'s account will be Suspended until reactivated.`
      : `${jobSeeker.name}'s account will be marked as Inactive. You can activate it again later.`;
  return (
    <ConfirmDialog
      open={status !== null}
      title={title}
      message={message}
      confirmLabel={activating ? 'Activate' : suspending ? 'Suspend' : 'Deactivate'}
      tone={activating ? 'primary' : 'danger'}
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

/**
 * The "..." menu for one job seeker row. The list is rendered in a portal with fixed positioning,
 * so a table that clips its overflow can never cut it off.
 */
export function JobSeekerActionMenu({
  jobSeeker,
  triggerClassName
}: {
  jobSeeker: HireAdminJobSeeker;
  triggerClassName: string;
}) {
  const [pos, setPos] = useState<MenuPos | null>(null);
  const [confirming, setConfirming] = useState<JobSeekerStatus | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const open = pos !== null;
  const setStatus = useSetJobSeekerStatus();
  const id = jobSeeker.job_seeker_id;
  const active = jobSeeker.status === 'active';
  const suspended = jobSeeker.status === 'suspended';

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
    if (e.key === 'Tab') {
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

  function chooseStatus(status: JobSeekerStatus) {
    closeMenu(true);
    setConfirming(status);
  }

  async function copyId() {
    closeMenu(true);
    try {
      await navigator.clipboard.writeText(id);
      toast.success('Job seeker ID copied');
    } catch {
      toast.error('Could not copy the job seeker ID. Copy it from the table instead.');
    }
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
            className="fixed z-50 min-w-[220px] overflow-y-auto rounded-xl border border-[#E9ECF2] bg-white py-1 shadow-lg"
            onKeyDown={onMenuKeyDown}
          >
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className={ITEM}
                onClick={() => chooseStatus(active ? 'inactive' : 'active')}
              >
                {active ? 'Deactivate' : 'Activate'}
              </button>
            </li>
            {!suspended && (
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={ITEM}
                  onClick={() => chooseStatus('suspended')}
                >
                  Suspend
                </button>
              </li>
            )}
            <li role="separator" className="my-1 border-t border-line" />
            <li role="none">
              <button type="button" role="menuitem" className={ITEM} onClick={copyId}>
                Copy job seeker ID
              </button>
            </li>
          </ul>,
          document.body
        )}
      <JobSeekerStatusDialog
        jobSeeker={jobSeeker}
        status={confirming}
        loading={setStatus.isPending}
        onCancel={() => setConfirming(null)}
        onConfirm={() =>
          confirming &&
          setStatus.mutate(
            { jobSeekerId: id, status: confirming },
            { onSuccess: () => setConfirming(null) }
          )
        }
      />
    </>
  );
}
