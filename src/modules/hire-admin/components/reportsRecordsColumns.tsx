import type { Column } from '@/shared/components/DataTable';
import type {
  ReportsApplicationRow,
  ReportsHiredRow,
  ReportsJobRow,
  ReportsRejectedRow
} from '../schemas/adminReportsDrilldown';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { CandidateCell } from './applicationCells';
import { formatJoinedOnDate as formatDate } from './formatJoinedOnDate';
import { formatCount } from './reportsFormat';

/*
 * The columns of the four stat-card lists, drawn like the Recent Jobs and Recent Applications
 * tables: a plain cell has no style of its own, so it takes the table's text. Only the job title and
 * the application count are bold, as in the picture. The first column is `#`, the id of the record.
 * Each helper below fits any row that has the field it reads, so the four lists share them.
 */

/** Ids and days stay on one line instead of wrapping when the table gets tight. */
const NOWRAP = 'whitespace-nowrap';

/** `#`: the id the row carries in its `key` field. */
function idColumn<Key extends string>(key: Key): Column<Record<Key, string>> {
  return { id: 'id', header: '#', className: NOWRAP, cell: (row) => row[key] };
}

/** A plain text column that reads the row's `key` field. */
function textColumn<Key extends string>(key: Key, header: string): Column<Record<Key, string>> {
  return { id: key, header, cell: (row) => row[key] };
}

/** The person: round initials avatar and name, with no city under it (these lists have none). */
function personColumn(header: string): Column<{ candidate_name: string }> {
  return {
    id: 'candidate_name',
    header,
    cell: (row) => <CandidateCell name={row.candidate_name} />
  };
}

/**
 * A day column, like `24 Jun 2026` in India time, sortable on the server. The row field is named
 * after the sort key, so one word serves as the column id, the sort key and the field to read.
 */
function dateColumn<Key extends string>(key: Key, header: string): Column<Record<Key, string>> {
  return {
    id: key,
    header,
    sortKey: key,
    className: NOWRAP,
    cell: (row) => formatDate(row[key])
  };
}

const outletColumn = textColumn('outlet_name', 'Outlet / Restaurant');
const appliedForColumn = textColumn('job_title', 'Applied For');
const applicantColumn = personColumn('Applicant');

export const jobsPostedColumns: Column<ReportsJobRow>[] = [
  idColumn('job_id'),
  {
    id: 'title',
    header: 'Job Title',
    cell: (row) => <span className="font-semibold">{row.title}</span>
  },
  textColumn('recruiter_name', 'Posted By (Recruiter)'),
  outletColumn,
  dateColumn('posted_at', 'Posted On'),
  {
    id: 'applications_count',
    header: 'Applications',
    sortKey: 'applications_count',
    className: 'text-right',
    cell: (row) => (
      <span className="font-semibold tabular-nums">{formatCount(row.applications_count)}</span>
    )
  }
];

export const applicationsColumns: Column<ReportsApplicationRow>[] = [
  idColumn('application_id'),
  applicantColumn,
  appliedForColumn,
  outletColumn,
  dateColumn('applied_at', 'Applied On'),
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <ApplicationStatusBadge status={row.status} />
  }
];

/** The `#` of a hire is the candidate's id; the row itself is keyed by its application id. */
export const hiredColumns: Column<ReportsHiredRow>[] = [
  idColumn('candidate_id'),
  personColumn('Candidate'),
  textColumn('job_title', 'Hired For'),
  textColumn('recruiter_name', 'Recruited By'),
  outletColumn,
  dateColumn('hired_at', 'Hired On')
];

export const rejectedColumns: Column<ReportsRejectedRow>[] = [
  idColumn('application_id'),
  applicantColumn,
  appliedForColumn,
  outletColumn,
  dateColumn('rejected_at', 'Rejected On'),
  {
    id: 'rejection_reason',
    header: 'Reason',
    // Null, or a blank string, is no reason: say so and never make one up.
    cell: (row) =>
      row.rejection_reason?.trim() || <span className="text-ink-soft">Not recorded</span>
  }
];
