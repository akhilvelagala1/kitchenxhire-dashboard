import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RecruiterInboundApplication } from '../schemas/recruiterApplication';
import {
  CANDIDATE_TABS,
  downloadCandidateResume,
  formatCandidateDate,
  formatFileSizeKb,
  formatWorkRange
} from './candidateDetails';

const APPLICATION: RecruiterInboundApplication = {
  id: 'app-1',
  candidateName: 'Asha Rao',
  initials: 'AR',
  avatarHue: 20,
  jobId: 'job-1',
  jobTitle: 'Line Cook',
  appliedAt: '2026-11-10T09:30:00.000Z',
  status: 'shortlisted',
  resumeFileName: 'Asha_Rao_Resume'
};

describe('candidateDetails', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists the three candidate tabs in order', () => {
    expect(CANDIDATE_TABS.map((tab) => tab.label)).toEqual([
      'Overview',
      'Resume',
      'Application Details'
    ]);
  });

  it('formats a missing or invalid date as a dash', () => {
    expect(formatCandidateDate()).toBe('—');
    expect(formatCandidateDate('not-a-date')).toBe('—');
  });

  it('formats a valid ISO date as day month year', () => {
    expect(formatCandidateDate('2026-11-10T12:00:00.000Z')).toMatch(/^\d{2} Nov 2026$/);
  });

  it('includes a time when withTime is set', () => {
    const formatted = formatCandidateDate('2026-11-10T12:00:00.000Z', true);
    expect(formatted).toContain('2026');
    expect(formatted).toMatch(/\d{1,2}:\d{2}/);
  });

  it('formats a work range with and without an end date', () => {
    expect(formatWorkRange({ startDate: 'Jan 2023', endDate: 'Oct 2026' })).toBe(
      'Jan 2023 – Oct 2026'
    );
    expect(formatWorkRange({ startDate: 'Jan 2023' })).toBe('Jan 2023 – Present');
  });

  it('formats a file size in rounded KB', () => {
    expect(formatFileSizeKb()).toBe('—');
    expect(formatFileSizeKb(240)).toBe('240 KB');
    expect(formatFileSizeKb(240.6)).toBe('241 KB');
  });

  it('downloads the resume as a text file and revokes the object URL', () => {
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:resume');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const downloads: string[] = [];
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function clickAnchor(this: HTMLAnchorElement) {
        downloads.push(this.download);
      });

    downloadCandidateResume(APPLICATION);

    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]?.[0]).toBeInstanceOf(Blob);
    expect(click).toHaveBeenCalledTimes(1);
    expect(downloads).toEqual(['Asha_Rao_Resume.txt']);
    expect(revoke).toHaveBeenCalledWith('blob:resume');
    expect(create.mock.invocationCallOrder[0]).toBeLessThan(
      revoke.mock.invocationCallOrder[0] ?? 0
    );
  });
});
