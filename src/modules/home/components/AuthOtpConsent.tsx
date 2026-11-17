import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export function AuthOtpConsent({
  children,
  className,
  ...input
}: {
  children: React.ReactNode;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-2.5 text-sm leading-[1.4] font-medium text-ink-700',
        className
      )}
    >
      <span className="relative mt-px flex-none">
        <input
          type="checkbox"
          className="peer size-5 cursor-pointer appearance-none rounded-md border-[1.5px] border-line-strong bg-surface checked:border-brand-600 checked:bg-brand-600"
          {...input}
        />
        <Check className="pointer-events-none absolute inset-0 m-auto size-3 stroke-[2.4] text-white opacity-0 peer-checked:opacity-100" />
      </span>
      <span>{children}</span>
    </label>
  );
}
