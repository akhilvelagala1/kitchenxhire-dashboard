import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderPage } from '@/shared/test/render';
import { AdminJobCreatePage } from './AdminJobCreatePage';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    list: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn()
  }
}));
vi.mock('@/shared/ui/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function renderCreate() {
  return renderPage(<AdminJobCreatePage />, {
    route: '/admin/jobs/new',
    path: '/admin/jobs/new'
  });
}

describe('AdminJobCreatePage', () => {
  it('shows the Post a Job heading with its description', () => {
    renderCreate();

    expect(screen.getByRole('heading', { name: 'Post a Job' })).toBeInTheDocument();
    expect(screen.getByText(/Create a new job listing for recruiters/)).toBeInTheDocument();
  });

  it('links back to the Jobs list', () => {
    renderCreate();

    expect(screen.getByRole('link', { name: 'Back to Jobs' })).toHaveAttribute(
      'href',
      '/admin/jobs'
    );
  });

  it('offers Save as Draft and Publish Job', () => {
    renderCreate();

    expect(screen.getByRole('button', { name: 'Save as Draft' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Publish Job' })).toBeEnabled();
  });

  // jsdom has no layout engine, so the one-screen fit is asserted as classes, not real sizes.
  it('fills the shell area as a fit page that scales with the window', () => {
    const { container } = renderCreate();

    expect(container.firstElementChild).toHaveClass(
      'fit-scale',
      'fit-scale-post-job',
      'flex',
      'min-h-0',
      'flex-1',
      'flex-col'
    );
  });

  it('sets the Post a Job title in the dense title size from lg up only', () => {
    renderCreate();

    const title = screen.getByRole('heading', { level: 1, name: 'Post a Job' });

    expect(title).toHaveClass('lg:text-dense-title!');
    expect(title).not.toHaveClass('text-dense-title!');
  });

  it('is not held in a narrow centred column', () => {
    const { container } = renderCreate();

    expect(container.querySelector('.max-w-4xl')).toBeNull();
  });
});
