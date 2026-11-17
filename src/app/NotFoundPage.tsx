import { Link } from 'react-router';
import { EmptyState } from '@/shared/components/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="The link may be old, or the page was removed."
      action={
        <Link to="/" className="text-brand-600 underline">
          Go to homepage
        </Link>
      }
    />
  );
}
