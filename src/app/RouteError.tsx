import { isRouteErrorResponse, useRouteError } from 'react-router';
import { ErrorState } from '@/shared/components/ErrorState';

export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error;
  return <ErrorState error={message} onRetry={() => window.location.reload()} />;
}
