import { useEffect, useRef, type ReactNode, type SyntheticEvent } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Render only the native shell. The caller supplies the panel markup and every class. `title` is then the accessible name. */
  bare?: boolean;
  /** When false, Escape / cancel does not close the dialog (caller must dismiss). Default true. */
  dismissible?: boolean;
  className?: string;
}

/** Native <dialog>: focus trap, Escape and backdrop come from the browser. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  bare,
  dismissible = true,
  className
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal?.();
    if (!open && el.open) el.close?.();
  }, [open]);

  function onCancel(event: SyntheticEvent) {
    if (!dismissible) event.preventDefault();
  }

  if (bare) {
    return (
      <dialog
        ref={ref}
        onClose={onClose}
        onCancel={onCancel}
        aria-label={title}
        className={className}
      >
        {open && children}
      </dialog>
    );
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onCancel}
      aria-labelledby="dialog-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/40"
    >
      {open && (
        <div className="flex flex-col gap-4 p-6">
          <h2 id="dialog-title" className="text-lg font-semibold">
            {title}
          </h2>
          <div className="text-sm">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-2">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
