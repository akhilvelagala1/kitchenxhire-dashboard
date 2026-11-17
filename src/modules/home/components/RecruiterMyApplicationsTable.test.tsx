import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { RecruiterInboundApplication } from '../schemas/recruiterApplication';
import { RecruiterMyApplicationsTable } from './RecruiterMyApplicationsTable';

function buildRow(
  overrides: Partial<RecruiterInboundApplication> = {}
): RecruiterInboundApplication {
  return {
    id: 'app-1',
    candidateName: 'Ramesh Kumar',
    initials: 'RK',
    avatarHue: 10,
    jobId: 'job-1',
    jobTitle: 'Tandoor Chef',
    appliedAt: '2026-10-01T00:00:00.000Z',
    status: 'new',
    experience: '3 yrs',
    location: 'Chennai',
    ...overrides
  };
}

function renderTable(rows: RecruiterInboundApplication[] = [buildRow()]) {
  return render(
    <RecruiterMyApplicationsTable
      rows={rows}
      accountId="acct-1"
      onAccept={vi.fn()}
      onReject={vi.fn()}
      onUpdateNotes={vi.fn()}
    />
  );
}

describe('RecruiterMyApplicationsTable', () => {
  it('opens the candidate details modal when clicking anywhere on a candidate row', async () => {
    const user = userEvent.setup();
    renderTable();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByText('Ramesh Kumar'));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('does not open the candidate details modal when clicking the overflow-menu toggle', async () => {
    const user = userEvent.setup();
    renderTable();

    expect(screen.getAllByRole('button', { name: 'View Profile' })).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /More actions for Ramesh Kumar/ }));

    expect(screen.getAllByRole('button', { name: 'View Profile' })).toHaveLength(2);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
