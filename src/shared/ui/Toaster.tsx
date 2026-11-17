import { useSyncExternalStore } from 'react';
import { cn } from '@/shared/lib/cn';
import { getToasts, subscribeToasts } from './toast';

export function Toaster() {
  const list = useSyncExternalStore(subscribeToasts, getToasts);
  return (
    <div aria-live="polite" className="fixed right-4 bottom-4 z-50 flex max-w-sm flex-col gap-2">
      {list.map((t) => (
        <div
          key={t.id}
          role={t.kind === 'error' ? 'alert' : 'status'}
          className={cn(
            'rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg',
            t.kind === 'error' ? 'bg-danger-600' : 'bg-ink'
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
