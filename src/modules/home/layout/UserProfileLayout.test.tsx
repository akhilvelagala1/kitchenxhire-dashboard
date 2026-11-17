import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { UserProfileLayout } from './UserProfileLayout';

const SECTIONS = [
  { path: '/user/profile', content: 'Profile content', link: 'My Profile' },
  { path: '/user/applications', content: 'Applications content', link: 'My Applications' },
  { path: '/user/resume', content: 'Resume content', link: 'My Resume' },
  { path: '/user/documents', content: 'Documents content', link: 'My Documents' },
  { path: '/user/settings', content: 'Settings content', link: 'Account Settings' }
] as const;

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<UserProfileLayout />}>
          <Route path="user/profile" element={<p>Profile content</p>} />
          <Route path="user/applications" element={<p>Applications content</p>} />
          <Route path="user/resume" element={<p>Resume content</p>} />
          <Route path="user/documents" element={<p>Documents content</p>} />
          <Route path="user/settings" element={<p>Settings content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('UserProfileLayout', () => {
  it('renders the skip-link main landmark once around the sidebar and the section', () => {
    renderAt('/user/profile');

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
  });

  it.each(SECTIONS)('keeps one identical sidebar beside $link', ({ path, content, link }) => {
    renderAt(path);

    const nav = screen.getByRole('navigation', { name: 'Profile sections' });
    expect(within(nav).getAllByRole('link')).toHaveLength(5);
    expect(within(nav).getByRole('link', { name: link })).toHaveAttribute('aria-current', 'page');

    const promo = screen.getByText('Complete your profile to get better job opportunities');
    expect(promo.closest('aside')).toBe(nav.closest('aside'));
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  it('keeps the sidebar mounted when moving between sections', async () => {
    const user = userEvent.setup();
    renderAt('/user/applications');

    const nav = screen.getByRole('navigation', { name: 'Profile sections' });
    await user.click(within(nav).getByRole('link', { name: 'My Documents' }));

    expect(screen.getByText('Documents content')).toBeInTheDocument();
    expect(screen.queryByText('Applications content')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Profile sections' })).toBe(nav);
    expect(within(nav).getByRole('link', { name: 'My Documents' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
