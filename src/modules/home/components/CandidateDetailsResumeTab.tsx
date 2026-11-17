import { Download } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatCandidateDate, formatFileSizeKb, formatWorkRange } from '../lib/candidateDetails';
import type { RecruiterInboundApplication } from '../schemas/recruiterApplication';
import { candidateSectionBody, candidateSectionTitle } from './candidateDetailsStyles';
import { homeButton } from './styles';

export function CandidateDetailsResumeTab({
  application,
  onDownload
}: {
  application: RecruiterInboundApplication;
  onDownload: () => void;
}) {
  const resumeFileName = application.resumeFileName ?? `${application.candidateName}_Resume.pdf`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas p-3">
        <p className="min-w-0 truncate text-sm font-semibold text-ink">
          {resumeFileName} • {formatFileSizeKb(application.resumeFileSizeKb)} • Updated{' '}
          {formatCandidateDate(application.resumeUpdatedAt)}
        </p>
        <button
          type="button"
          onClick={onDownload}
          className={cn(homeButton('white-slim'), 'gap-2')}
        >
          <Download className="size-4" aria-hidden="true" />
          Download
        </button>
      </div>
      <div>
        <p className={candidateSectionTitle}>Resume Summary</p>
        <p className={candidateSectionBody}>
          {application.resumeSummary ?? 'No resume summary available.'}
        </p>
      </div>
      <div>
        <p className={candidateSectionTitle}>Experience</p>
        {application.workHistory && application.workHistory.length > 0 ? (
          <ul className="mt-2 space-y-1.5">
            {application.workHistory.map((entry, index) => (
              <li key={`${entry.title}-${index}`} className="text-sm text-ink-600">
                <span className="font-extrabold text-ink">{entry.title}</span> — {entry.employer} ·{' '}
                {formatWorkRange(entry)}
              </li>
            ))}
          </ul>
        ) : (
          <p className={candidateSectionBody}>No work history on file.</p>
        )}
      </div>
      <div>
        <p className={candidateSectionTitle}>Education</p>
        {application.education && application.education.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {application.education.map((entry, index) => (
              <li key={`${entry.institution}-${index}`} className="text-sm font-semibold text-ink">
                {entry.institution} — {entry.year}
              </li>
            ))}
          </ul>
        ) : (
          <p className={candidateSectionBody}>No education on file.</p>
        )}
      </div>
    </>
  );
}
