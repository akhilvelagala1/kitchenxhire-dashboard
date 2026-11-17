import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QuickActionsCard } from './QuickActionsCard';

function renderCard() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <QuickActionsCard /> },
      { path: '*', element: <p>Somewhere else</p> }
    ],
    { initialEntries: ['/'] }
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe('QuickActionsCard', () => {
  it('opens the Settings users tab from Manage Roles', async () => {
    const router = renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'Manage Roles' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/settings'));
    expect(router.state.location.search).toBe('?tab=users');
  });

  it('opens the Post a Job form from Post a Job', async () => {
    const router = renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'Post a Job' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/jobs/new'));
  });
});
