import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { RecruiterInboundApplication } from '../schemas/recruiterApplication';
import { CandidateDetailsModal, type CandidateDetailsModalProps } from './CandidateDetailsModal';

const FULL_APPLICATION: RecruiterInboundApplication = {
  id: 'app-1',
  candidateName: 'Asha Rao',
  initials: 'AR',
  avatarHue: 20,
  jobId: 'job-1',
  jobTitle: 'Line Cook',
  appliedAt: '2026-11-10T09:30:00.000Z',
  status: 'shortlisted',
  age: 28,
  gender: 'Female',
  location: 'Hyderabad',
  experience: '4 years',
  phone: '+91 98765 43210',
  email: 'asha.rao@example.com',
  profileSummary: 'Experienced line cook specializing in South Indian cuisine.',
  educationLevel: 'Diploma in Culinary Arts',
  skills: ['South Indian', 'Grill', 'Inventory'],
  resumeFileName: 'Asha_Rao_Resume.pdf',
  resumeFileSizeKb: 240,
  resumeUpdatedAt: '2026-11-01T00:00:00.000Z',
  resumeSummary: 'Four years of experience running a busy tandoor station.',
  workHistory: [
    { title: 'Line Cook', employer: 'Spice Route', startDate: 'Jan 2023', endDate: 'Oct 2026' },
    { title: 'Commis Chef', employer: 'Hotel Grand', startDate: 'Jun 2021', endDate: 'Dec 2022' }
  ],
  education: [{ institution: 'Culinary Institute of Hyderabad', year: '2020' }],
  recruiterNotes: 'Strong candidate, follow up next week.'
};

const MINIMAL_APPLICATION: RecruiterInboundApplication = {
  id: 'app-2',
  candidateName: 'Vikram Singh',
  initials: 'VS',
  avatarHue: 140,
  jobId: 'job-2',
  jobTitle: 'Kitchen Helper',
  appliedAt: '2026-11-05T12:00:00.000Z',
  status: 'new'
};

const JOB_META = { category: 'Kitchen', employmentType: 'Full-time', workShift: 'Morning' };

function renderModal(overrides: Partial<CandidateDetailsModalProps> = {}) {
  const props: CandidateDetailsModalProps = {
    application: FULL_APPLICATION,
    jobMeta: JOB_META,
    onClose: vi.fn(),
    onAccept: vi.fn(),
    onReject: vi.fn(),
    onUpdateNotes: vi.fn(),
    ...overrides
  };
  render(<CandidateDetailsModal {...props} />);
  return props;
}

describe('CandidateDetailsModal', () => {
  it('renders no candidate content when application is null', () => {
    renderModal({ application: null });

    expect(screen.queryByText('Asha Rao')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Overview' })).not.toBeInTheDocument();
  });

  it('shows candidate identity, status, meta line, phone and email when open', () => {
    renderModal();

    expect(screen.getByText('Asha Rao')).toBeInTheDocument();
    expect(screen.getByText('Applied for: Line Cook')).toBeInTheDocument();
    expect(screen.getByText('Under Review')).toBeInTheDocument();
    expect(screen.getByText('28 yrs • Female • Hyderabad')).toBeInTheDocument();
    expect(screen.getByText(/\+91 98765 43210/)).toBeInTheDocument();
    expect(screen.getByText(/asha\.rao@example\.com/)).toBeInTheDocument();
  });

  it('starts on the Overview tab by default', () => {
    renderModal();

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Profile Summary')).toBeInTheDocument();
  });

  it('starts on the requested tab when initialTab is provided', () => {
    renderModal({ initialTab: 'resume' });

    expect(screen.getByRole('tab', { name: 'Resume' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Asha_Rao_Resume\.pdf/)).toBeInTheDocument();
  });

  it('shows resume file info, work history and education after switching to the Resume tab', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('tab', { name: 'Resume' }));

    expect(screen.getByText(/Asha_Rao_Resume\.pdf/)).toBeInTheDocument();
    expect(screen.getByText(/240 KB/)).toBeInTheDocument();
    expect(screen.getByText(/Spice Route/)).toBeInTheDocument();
    expect(screen.getByText('Culinary Institute of Hyderabad — 2020')).toBeInTheDocument();
  });

  it('shows resume tab fallback copy when the candidate has no resume detail on file', async () => {
    const user = userEvent.setup();
    renderModal({ application: MINIMAL_APPLICATION });

    await user.click(screen.getByRole('tab', { name: 'Resume' }));

    expect(screen.getByText('No resume summary available.')).toBeInTheDocument();
    expect(screen.getByText('No work history on file.')).toBeInTheDocument();
    expect(screen.getByText('No education on file.')).toBeInTheDocument();
  });

  it('switches to the Resume tab when View Full Profile is clicked', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'View Full Profile' }));

    expect(screen.getByRole('tab', { name: 'Resume' })).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onAccept then onClose when Accept is clicked', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('button', { name: 'Accept' }));

    expect(props.onAccept).toHaveBeenCalledWith('app-1');
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onReject then onClose when Reject is clicked', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('button', { name: 'Reject' }));

    expect(props.onReject).toHaveBeenCalledWith('app-1');
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('edits and saves a recruiter note, then exits edit mode', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('tab', { name: 'Application Details' }));
    await user.click(screen.getByRole('button', { name: 'Edit Note' }));

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Schedule a trial shift.');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(props.onUpdateNotes).toHaveBeenCalledWith('app-1', 'Schedule a trial shift.');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Note' })).toBeInTheDocument();
  });

  it('triggers a resume download when Download Resume is clicked', async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:candidate');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Download Resume' }));

    expect(createObjectURL).toHaveBeenCalled();
    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });

  describe('fixed frame layout', () => {
    const COLOUR_TOKENS = [
      'border-brand-600',
      'text-brand-600',
      'border-transparent',
      'text-ink-500'
    ];
    const TAB_NAMES = ['Overview', 'Resume', 'Application Details'] as const;
    const withoutColour = (className: string) =>
      className
        .split(/\s+/)
        .filter((token) => token && !COLOUR_TOKENS.includes(token))
        .join(' ');
    const getDialogClass = () => document.querySelector('dialog')?.className ?? '';

    it('gives the dialog a fixed height and width instead of a max-height', () => {
      renderModal();

      const className = getDialogClass();
      expect(className).toContain('h-[min(640px,85vh)]');
      expect(className).toContain('w-[min(900px,calc(100%-32px))]');
      expect(className).not.toContain('max-h-[85vh]');
    });

    it('only applies display:flex when open, so a closed dialog stays hidden', () => {
      const { unmount } = render(
        <CandidateDetailsModal
          application={null}
          onClose={vi.fn()}
          onAccept={vi.fn()}
          onReject={vi.fn()}
          onUpdateNotes={vi.fn()}
        />
      );
      const closedTokens = getDialogClass().split(/\s+/);
      expect(closedTokens).toContain('open:flex');
      expect(closedTokens).not.toContain('flex');
      expect(document.querySelector('dialog')).not.toHaveAttribute('open');
      unmount();

      renderModal();
      expect(getDialogClass().split(/\s+/)).not.toContain('flex');
    });

    it('keeps the dialog class identical across every tab', async () => {
      const user = userEvent.setup();
      renderModal();
      const classNames = [getDialogClass()];

      for (const name of TAB_NAMES) {
        await user.click(screen.getByRole('tab', { name }));
        classNames.push(getDialogClass());
      }

      expect(new Set(classNames).size).toBe(1);
      expect(classNames[0]).toContain('h-[min(640px,85vh)]');
    });

    it('makes the tabpanel the only scrolling region at desktop width', () => {
      renderModal();

      const className = screen.getByRole('tabpanel').className;
      expect(className).toContain('min-h-0');
      expect(className).toContain('flex-1');
      expect(className).toContain('min-[900px]:overflow-y-auto');
    });

    it('keeps the tab bar pinned so it never scrolls away', () => {
      renderModal();

      expect(screen.getByRole('tablist').className).toContain('flex-none');
    });

    it('keeps tab geometry identical for active and inactive tabs', () => {
      renderModal();

      const active = screen.getByRole('tab', { name: 'Overview' });
      const inactive = screen.getByRole('tab', { name: 'Resume' });

      expect(active).toHaveAttribute('aria-selected', 'true');
      expect(inactive).toHaveAttribute('aria-selected', 'false');
      expect(withoutColour(active.className)).toBe(withoutColour(inactive.className));
      expect(active.className).toContain('border-brand-600');
      expect(inactive.className).toContain('border-transparent');
    });

    it('renders exactly one tabpanel on every tab', async () => {
      const user = userEvent.setup();
      renderModal();

      for (const name of TAB_NAMES) {
        await user.click(screen.getByRole('tab', { name }));
        expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
      }
    });
  });
});
