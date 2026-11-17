import { toErrorMessage } from '@/shared/api/errors';
import { Button } from '@/shared/ui/Button';

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <p className="text-base font-medium text-ink">Could not load this data</p>
      <p className="max-w-md text-sm text-ink-soft">{toErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
