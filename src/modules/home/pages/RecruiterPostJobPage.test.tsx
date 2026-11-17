import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, beforeEach } from 'vitest';
import { RecruiterSessionProvider } from '../layout/RecruiterSessionProvider';
import { normalizeRecruiterAccountId } from '../lib/recruiterAccount';
import { writeRecruiterSession } from '../lib/recruiterSession';
import { RecruiterPostJobPage } from './RecruiterPostJobPage';

function renderPostJob() {
  return render(
    <RecruiterSessionProvider>
      <MemoryRouter initialEntries={['/recruiter/post-job']}>
        <RecruiterPostJobPage />
      </MemoryRouter>
    </RecruiterSessionProvider>
  );
}

function seedCompleteOrganisation() {
  const accountId = normalizeRecruiterAccountId('9876543210');
  localStorage.setItem(
    `kx-hire-recruiter-organisation-v2:${accountId}`,
    JSON.stringify({
      status: 'COMPLETED',
      updatedAt: new Date().toISOString(),
      organisation: {}
    })
  );
}

describe('RecruiterPostJobPage', () => {
  beforeEach(() => {
    localStorage.clear();
    writeRecruiterSession({ phone: '9876543210' });
  });

  it('shows organization setup on post-job URL when profile is incomplete', () => {
    renderPostJob();
    expect(screen.getByRole('heading', { name: 'Organization Details' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Set up your organization' })).toBeInTheDocument();
  });

  it('shows the post a job form when organization setup is complete', () => {
    seedCompleteOrganisation();
    renderPostJob();

    expect(screen.getByRole('heading', { level: 1, name: 'Post a Job' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post Job' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Description/i)).toBeInTheDocument();
    expect(screen.queryByText(/Resume \(Optional\)/i)).not.toBeInTheDocument();
  });
});
