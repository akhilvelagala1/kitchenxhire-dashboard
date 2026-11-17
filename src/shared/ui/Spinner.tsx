import { cn } from '@/shared/lib/cn';

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        size === 'sm' ? 'size-4' : 'size-6'
      )}
    />
  );
}
