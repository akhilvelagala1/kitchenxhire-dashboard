import type { RecruiterJobStatus } from '../lib/recruiterPostedJobsStore';

/** Jobs Posted status pills (Active / Pending / Closed). */
export function RecruiterJobStatusBadge({ status }: { status: RecruiterJobStatus }) {
  if (status === 'Pending') {
    return (
      <span className="inline-flex h-8 items-center rounded-full bg-[#fff1ce] px-4 text-[14px] font-semibold text-[#a45108]">
        Pending
      </span>
    );
  }
  if (status === 'Closed') {
    return (
      <span className="inline-flex h-8 items-center rounded-full bg-[#eef0f2] px-4 text-[14px] font-semibold text-[#4b5563]">
        Closed
      </span>
    );
  }
  return (
    <span className="inline-flex h-8 items-center rounded-full bg-[#e5f7e8] px-4 text-[14px] font-semibold text-[#15803d]">
      Active
    </span>
  );
}
