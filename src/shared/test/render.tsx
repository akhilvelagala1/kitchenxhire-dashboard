import { useEffect, type ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';

/** The router's current query string, for asserting URL-synced list state. */
export const routerLocation = { search: '' };

function LocationProbe() {
  const { search } = useLocation();
  useEffect(() => {
    routerLocation.search = search;
  }, [search]);
  return null;
}

/** Renders inside a fresh QueryClient and router. Read `routerLocation.search` to assert URL state. */
export function renderPage(
  ui: ReactElement,
  { route = '/', path = '*' }: { route?: string; path?: string } = {}
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route
            path={path}
            element={
              <>
                {ui}
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
