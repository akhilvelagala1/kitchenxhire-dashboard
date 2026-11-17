import type { ButtonHTMLAttributes, Ref } from 'react';
import { cn } from '@/shared/lib/cn';

interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'role' | 'type' | 'value'
> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * An on/off switch: a 44 x 24 track, orange when on. It is a button with role="switch", so the
 * keyboard (Space, Enter) and screen readers treat it as one. Name it with aria-labelledby or
 * aria-label. The invisible hit area makes it 44px tall for touch.
 */
export function Switch({
  checked,
  onCheckedChange,
  className,
  disabled,
  ref,
  ...rest
}: SwitchProps) {
  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors before:absolute before:inset-x-0 before:-inset-y-2.5 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? 'bg-brand-600' : 'bg-[#D0D5DD]',
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none size-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform',
          checked && 'translate-x-[22px]'
        )}
      />
    </button>
  );
}
