import { Check } from 'lucide-react';
import { useEffect, useRef, type ComponentType, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/cn';
import { hireMenu, hireMenuOption, hireMenuScroll } from './styles';
import { popoverStyle, useAnchoredPopover, usePopoverPortalRoot } from './useAnchoredPopover';

interface HireMenuItem {
  value: string;
  label: string;
  /** Optional leading icon for option rows (e.g. onboarding categories). */
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

interface HireMenuProps {
  id: string;
  labelledBy: string;
  open: boolean;
  value: string;
  options: readonly HireMenuItem[];
  onChange: (value: string) => void;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  minWidth?: number;
}

/** One Hire listbox used by form selects and the header language control. */
export function HireMenu({
  id,
  labelledBy,
  open,
  value,
  options,
  onChange,
  onClose,
  triggerRef,
  minWidth = 0
}: HireMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const position = useAnchoredPopover({ open, triggerRef, minWidth });
  const portalRoot = usePopoverPortalRoot(open, triggerRef);

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      const node = event.target as Node;
      if (triggerRef.current?.contains(node) || menuRef.current?.contains(node)) return;
      onClose();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, open, triggerRef]);

  if (!open || !portalRoot || !position) return null;

  return createPortal(
    <div
      ref={menuRef}
      id={id}
      role="listbox"
      aria-labelledby={labelledBy}
      style={popoverStyle(position)}
      className={cn('fixed z-[200] flex flex-col overflow-hidden', hireMenu)}
    >
      <div className={hireMenuScroll}>
        {options.map((opt) => {
          const selected = opt.value === value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={selected}
              className={cn(hireMenuOption, selected && 'bg-brand-50 text-ink')}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onChange(opt.value);
                onClose();
              }}
            >
              {Icon ? <Icon className="size-4 shrink-0 text-brand-600" aria-hidden /> : null}
              <span className="min-w-0 flex-1 truncate text-left">{opt.label}</span>
              <Check
                className={cn(
                  'ml-auto size-4 shrink-0 stroke-[2.4] text-brand-600',
                  selected ? 'opacity-100' : 'opacity-0'
                )}
              />
            </button>
          );
        })}
      </div>
    </div>,
    portalRoot
  );
}
