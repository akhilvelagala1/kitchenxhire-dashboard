import {
  isRecruiterApplicationAccepted,
  isRecruiterApplicationUnderReview
} from '../lib/recruiterDashboard';
import type { RecruiterApplicationStatus } from '../schemas/recruiterApplication';

/** Reference dashboard status pills (Accepted / Under Review / Rejected). */
export function RecruiterMyApplicationsStatusBadge({
  status
}: {
  status: RecruiterApplicationStatus;
}) {
  if (status === 'rejected') {
    return (
      <span className="inline-flex h-8 items-center rounded-full bg-[#ffe4e4] px-4 text-[14px] font-semibold text-[#dc2626]">
        Rejected
      </span>
    );
  }
  if (isRecruiterApplicationAccepted(status)) {
    return (
      <span className="inline-flex h-8 items-center rounded-full bg-[#e5f7e8] px-4 text-[14px] font-semibold text-[#15803d]">
        Accepted
      </span>
    );
  }
  if (isRecruiterApplicationUnderReview(status)) {
    return (
      <span className="inline-flex h-8 items-center rounded-full bg-[#fff1ce] px-4 text-[14px] font-semibold text-[#a45108]">
        Under Review
      </span>
    );
  }
  return (
    <span className="inline-flex h-8 items-center rounded-full bg-[#fff1ce] px-4 text-[14px] font-semibold text-[#a45108]">
      Under Review
    </span>
  );
}
