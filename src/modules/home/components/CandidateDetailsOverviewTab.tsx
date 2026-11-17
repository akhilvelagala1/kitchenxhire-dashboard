import type { RecruiterInboundApplication } from '../schemas/recruiterApplication';
import { candidateSectionBody, candidateSectionTitle } from './candidateDetailsStyles';

export function CandidateDetailsOverviewTab({
  application
}: {
  application: RecruiterInboundApplication;
}) {
  return (
    <>
      <div>
        <p className={candidateSectionTitle}>Profile Summary</p>
        <p className={candidateSectionBody}>
          {application.profileSummary ?? 'No summary available.'}
        </p>
      </div>
      <p className="text-sm font-semibold text-ink">Experience: {application.experience ?? '—'}</p>
      <p className="text-sm font-semibold text-ink">
        Education: {application.educationLevel ?? '—'}
      </p>
      <div>
        <p className={candidateSectionTitle}>Skills</p>
        {application.skills && application.skills.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {application.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-line bg-canvas px-3 py-1.5 text-[13px] font-semibold text-ink-700"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className={candidateSectionBody}>No skills listed.</p>
        )}
      </div>
    </>
  );
}
