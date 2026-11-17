import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { useInView } from '../hooks/useInView';

/** Fades and lifts its content once it scrolls into view (the prototype's `.rise`). */
export function Reveal({ className, children }: { className?: string; children: ReactNode }) {
  const [ref, inView] = useInView<HTMLDivElement>('0px 0px -8% 0px', 0.12);
  return (
    <div
      ref={ref}
      className={cn(
        'transition-[opacity,translate] duration-[550ms]',
        inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        'motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none',
        className
      )}
    >
      {children}
    </div>
  );
}
