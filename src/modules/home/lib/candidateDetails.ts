import type { RecruiterInboundApplication } from '../schemas/recruiterApplication';

export type CandidateTab = 'overview' | 'resume' | 'application';

export const CANDIDATE_TABS: { key: CandidateTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'resume', label: 'Resume' },
  { key: 'application', label: 'Application Details' }
];

export function formatCandidateDate(iso?: string, withTime = false): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const options: Intl.DateTimeFormatOptions = withTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat('en-IN', options).format(date);
}

export const formatWorkRange = (entry: { startDate: string; endDate?: string }) =>
  entry.endDate ? `${entry.startDate} – ${entry.endDate}` : `${entry.startDate} – Present`;

export const formatFileSizeKb = (kb?: number) => (kb === undefined ? '—' : `${Math.round(kb)} KB`);

function resumeLines(a: RecruiterInboundApplication): string[] {
  const work = a.workHistory?.length
    ? a.workHistory.map((e) => `${e.title} — ${e.employer} (${formatWorkRange(e)})`)
    : ['No work history on file.'];
  const edu = a.education?.length
    ? a.education.map((e) => `${e.institution} — ${e.year}`)
    : ['No education on file.'];
  const skills = a.skills?.length ? a.skills.join(', ') : 'No skills listed.';
  return [
    'Prototype resume generated for demo purposes — not a real document.',
    '',
    `Candidate: ${a.candidateName}`,
    `Applied for: ${a.jobTitle}`,
    '',
    'Resume Summary',
    a.resumeSummary ?? 'No resume summary available.',
    '',
    'Experience',
    ...work,
    '',
    'Education',
    ...edu,
    '',
    'Skills',
    skills
  ];
}

export function downloadCandidateResume(application: RecruiterInboundApplication): void {
  const blob = new Blob([resumeLines(application).join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${application.resumeFileName ?? `${application.candidateName}_Resume`}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
