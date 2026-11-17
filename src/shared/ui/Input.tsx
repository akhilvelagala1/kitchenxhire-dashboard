import type { InputHTMLAttributes, Ref, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

const base =
  'min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-soft ' +
  'focus-visible:outline-2 focus-visible:outline-brand-600 aria-invalid:border-danger-600';

export function Input({
  className,
  ref,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} {...rest} className={cn(base, className)} />;
}

export function Textarea({
  className,
  ref,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: Ref<HTMLTextAreaElement> }) {
  return <textarea ref={ref} {...rest} className={cn(base, 'py-2', className)} />;
}

/** Native select for small, fixed enums only (status, tax slab). Entity references use AsyncSelect (UI-06). */
export function Select({
  className,
  ref,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { ref?: Ref<HTMLSelectElement> }) {
  return <select ref={ref} {...rest} className={cn(base, className)} />;
}
