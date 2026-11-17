import { Download } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatCandidateDate } from '../lib/candidateDetails';
import type { RecruiterInboundApplication } from '../schemas/recruiterApplication';
import { RecruiterMyApplicationsStatusBadge } from './RecruiterMyApplicationsStatusBadge';
import { homeButton } from './styles';

export function CandidateDetailsSidebar({
  application,
  onViewFullProfile,
  onDownloadResume
}: {
  application: RecruiterInboundApplication;
  onViewFullProfile: () => void;
  onDownloadResume: () => void;
}) {
  const metaLine =
    [application.age ? `${application.age} yrs` : null, application.gender, application.location]
      .filter(Boolean)
      .join(' • ') || '—';

  return (
    <div className="flex min-w-0 flex-none flex-col gap-3 min-[900px]:w-[240px] min-[900px]:overflow-y-auto min-[900px]:border-r min-[900px]:border-line min-[900px]:pr-5">
      <div className="flex items-center gap-3">
        {application.photoUrl ? (
          <img
            src={application.photoUrl}
            alt=""
            className="size-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            className="grid size-16 shrink-0 place-items-center rounded-full text-lg font-extrabold text-white"
            style={{ backgroundColor: `hsl(${application.avatarHue} 65% 42%)` }}
          >
            {application.initials}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold text-ink">{application.candidateName}</p>
          <p className="truncate text-sm font-semibold text-ink-600">
            Applied for: {application.jobTitle}
          </p>
        </div>
      </div>
      <RecruiterMyApplicationsStatusBadge status={application.status} />
      <p className="text-sm font-medium break-words text-ink-600">{metaLine}</p>
      <p className="text-sm font-medium break-words text-ink-600">
        Applied on {formatCandidateDate(application.appliedAt)}
      </p>
      <p className="text-sm font-medium break-words text-ink-600">
        Phone: {application.phone ?? '—'}
      </p>
      <p className="text-sm font-medium break-all text-ink-600">
        Email: {application.email ?? '—'}
      </p>
      <button
        type="button"
        onClick={onViewFullProfile}
        className={cn(homeButton('white-slim'), 'mt-1 w-full')}
      >
        View Full Profile
      </button>
      <button
        type="button"
        onClick={onDownloadResume}
        className={cn(homeButton('white-slim'), 'w-full gap-2')}
      >
        <Download className="size-4" aria-hidden="true" />
        Download Resume
      </button>
    </div>
  );
}
