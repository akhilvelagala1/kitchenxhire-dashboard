import type { CandidateNotesState } from '../hooks/useCandidateNotes';
import { formatCandidateDate } from '../lib/candidateDetails';
import type { RecruiterJobMeta } from '../lib/recruiterPostedJobsStore';
import type { RecruiterInboundApplication } from '../schemas/recruiterApplication';
import { candidateSectionBody, candidateSectionTitle } from './candidateDetailsStyles';
import { RecruiterMyApplicationsStatusBadge } from './RecruiterMyApplicationsStatusBadge';
import { homeButton } from './styles';

export function CandidateDetailsApplicationTab({
  application,
  jobMeta,
  notes
}: {
  application: RecruiterInboundApplication;
  jobMeta?: RecruiterJobMeta;
  notes: CandidateNotesState;
}) {
  const applicationFields: [string, string][] = [
    ['Applied Position', application.jobTitle],
    ['Submitted On', formatCandidateDate(application.appliedAt, true)],
    ['Job Category', jobMeta?.category ?? '—'],
    ['Employment Type', jobMeta?.employmentType ?? '—'],
    ['Work Shift', jobMeta?.workShift ?? '—']
  ];

  return (
    <>
      <div className="grid gap-2 min-[560px]:grid-cols-2">
        {applicationFields.map(([label, value]) => (
          <p key={label} className="text-sm font-semibold text-ink">
            {label}: {value}
          </p>
        ))}
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          Application Status: <RecruiterMyApplicationsStatusBadge status={application.status} />
        </p>
      </div>
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className={candidateSectionTitle}>Recruiter Notes</p>
          {!notes.editing && (
            <button
              type="button"
              onClick={notes.startEdit}
              className="text-sm font-extrabold text-brand-600 hover:underline"
            >
              Edit Note
            </button>
          )}
        </div>
        {notes.editing ? (
          <div className="mt-2 flex flex-col gap-2">
            <textarea
              value={notes.draft}
              onChange={(event) => notes.setDraft(event.target.value)}
              rows={4}
              className="rounded-xl border border-line bg-surface p-3 text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={notes.cancel} className={homeButton('white-slim')}>
                Cancel
              </button>
              <button type="button" onClick={notes.save} className={homeButton('orange-slim')}>
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className={candidateSectionBody}>{application.recruiterNotes ?? 'No notes yet.'}</p>
        )}
      </div>
    </>
  );
}
