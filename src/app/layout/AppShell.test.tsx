import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { apiClient } from '@/shared/api/apiClient';
import type { ShellRouteHandle } from '@/shared/types/module';
import { AppShell } from './AppShell';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: vi.fn(), list: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }
}));

function renderShell(initial: string) {
  vi.mocked(apiClient.get).mockResolvedValue({
    user_id: 'u1',
    role: 'PLATFORM_ADMIN',
    permissions: ['*']
  });
  const router = createMemoryRouter(
    [
      {
        element: <AppShell />,
        children: [
          {
            path: 'fit',
            handle: { fit: true } satisfies ShellRouteHandle,
            element: <p>Fit page</p>
          },
          { path: 'plain', element: <p>Plain page</p> }
        ]
      }
    ],
    { initialEntries: [initial] }
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
}

describe('AppShell', () => {
  it('hands the whole scroll area to a page whose route asks to fit the viewport', async () => {
    renderShell('/fit');

    expect(await screen.findByText('Fit page')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('data-layout', 'fit');
  });

  it('keeps the usual page gutters for any other route', async () => {
    renderShell('/plain');

    expect(await screen.findByText('Plain page')).toBeInTheDocument();
    expect(screen.getByRole('main')).not.toHaveAttribute('data-layout');
  });

  it('opens the header location menu and applies the chosen city', async () => {
    const user = userEvent.setup();
    renderShell('/plain');
    await screen.findByText('Plain page');

    await user.click(screen.getByRole('button', { name: 'Hyderabad' }));
    await user.click(screen.getByRole('option', { name: 'Madhapur' }));

    expect(screen.getByRole('button', { name: 'Madhapur' })).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens the header language menu and applies the chosen language', async () => {
    localStorage.removeItem('kx-hire-language');
    const user = userEvent.setup();
    renderShell('/plain');
    await screen.findByText('Plain page');

    await user.click(screen.getByRole('button', { name: 'Language' }));
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'हिन्दी' }));

    expect(screen.getByRole('button', { name: 'Language' })).toHaveTextContent('हिन्दी');
    expect(localStorage.getItem('kx-hire-language')).toBe('hi');
    localStorage.removeItem('kx-hire-language');
  });

  it('switches layout when navigating between the two kinds of route', async () => {
    const router = renderShell('/fit');
    await screen.findByText('Fit page');

    await router.navigate('/plain');

    expect(await screen.findByText('Plain page')).toBeInTheDocument();
    expect(screen.getByRole('main')).not.toHaveAttribute('data-layout');
  });
});
