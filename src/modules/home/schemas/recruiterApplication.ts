export type RecruiterApplicationStatus =
  'new' | 'under-review' | 'shortlisted' | 'interview' | 'selected' | 'hired' | 'rejected';

export type RecruiterApplicationStatusFilter = 'all' | RecruiterApplicationStatus;

export interface RecruiterInboundApplication {
  id: string;
  candidateName: string;
  initials: string;
  avatarHue: number;
  jobId: string;
  jobTitle: string;
  appliedAt: string;
  status: RecruiterApplicationStatus;
  resumePreviewPath?: string;
  age?: number;
  gender?: string;
  location?: string;
  experience?: string;
  photoUrl?: string;
  phone?: string;
  email?: string;
  profileSummary?: string;
  educationLevel?: string;
  skills?: string[];
  resumeFileName?: string;
  resumeFileSizeKb?: number;
  resumeUpdatedAt?: string;
  resumeSummary?: string;
  workHistory?: { title: string; employer: string; startDate: string; endDate?: string }[];
  education?: { institution: string; year: string }[];
  recruiterNotes?: string;
}

export const RECRUITER_APPLICATIONS_PAGE_SIZE = 4;
export const RECRUITER_MY_APPLICATIONS_PAGE_SIZE = 5;

/** My Applications dashboard status tabs (reference UI). */
export type RecruiterMyApplicationsTab = 'all' | 'under-review' | 'accepted' | 'rejected';

export const RECRUITER_STATUS_LABEL: Record<RecruiterApplicationStatus, string> = {
  new: 'New',
  'under-review': 'Under Review',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  selected: 'Selected',
  hired: 'Hired',
  rejected: 'Rejected'
};

export const RECRUITER_STATUS_CLASS: Record<RecruiterApplicationStatus, string> = {
  new: 'bg-sky-50 text-sky-700',
  'under-review': 'bg-amber-50 text-amber-800',
  shortlisted: 'bg-violet-50 text-violet-700',
  interview: 'bg-brand-50 text-brand-600',
  selected: 'bg-emerald-50 text-emerald-700',
  hired: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-50 text-rose-700'
};
