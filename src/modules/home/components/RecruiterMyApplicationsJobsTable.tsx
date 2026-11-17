import { useState } from 'react';
import { Dialog } from '@/shared/ui/Dialog';
import type { RecruiterJobWithStats } from '../lib/recruiterPostedJobsStore';
import { RecruiterJobStatusBadge } from './RecruiterJobStatusBadge';

/** Mirrors RecruiterMyApplicationsTable's formatAppliedOn — same locale and options. */
function formatPostedOn(iso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(iso));
}

interface RecruiterMyApplicationsJobsTableProps {
  rows: RecruiterJobWithStats[];
}

export function RecruiterMyApplicationsJobsTable({ rows }: RecruiterMyApplicationsJobsTableProps) {
  const [viewRow, setViewRow] = useState<RecruiterJobWithStats | null>(null);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-[#eef0f5] bg-white px-6 py-14 text-center shadow-[0_5px_18px_rgb(22_30_50/0.05)]">
        <p className="text-[18px] font-bold text-[#141517]">No jobs posted yet</p>
        <p className="mt-2 text-[15px] font-medium text-[#243754]">
          Once you post a job, it will appear here with its applicant count.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table // guard-allow: recruiter my applications reference table
          className="w-full min-w-[980px] table-fixed border-collapse text-left"
        >
          <colgroup>
            <col className="w-[260px]" />
            <col className="w-[160px]" />
            <col className="w-[110px]" />
            <col className="w-[110px]" />
            <col className="w-[150px]" />
            <col className="w-[120px]" />
            <col className="w-[110px]" />
          </colgroup>
          <thead>
            <tr className="h-9 bg-[#f2f4f7] text-[13px] font-bold text-[#141517]">
              <th className="px-3 font-bold">Job Title</th>
              <th className="px-3 font-bold">Category</th>
              <th className="px-3 font-bold">Openings</th>
              <th className="px-3 font-bold">Applicants</th>
              <th className="px-3 font-bold">Posted On</th>
              <th className="px-3 font-bold">Status</th>
              <th className="px-3 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="h-[62px] border-b border-[#edf0f5] text-[14px]">
                <td className="truncate px-3 font-bold text-[#141517]" title={row.title}>
                  {row.title}
                </td>
                <td className="truncate px-3 font-medium text-[#141517]">{row.category ?? '—'}</td>
                <td className="px-3 font-medium text-[#141517] tabular-nums">
                  {row.openings ?? '—'}
                </td>
                <td className="px-3 font-medium text-[#141517] tabular-nums">
                  {row.applicantCount}
                </td>
                <td className="px-3 font-medium text-[#141517] tabular-nums">
                  {row.postedAt ? formatPostedOn(row.postedAt) : '—'}
                </td>
                <td className="px-3">
                  <RecruiterJobStatusBadge status={row.status} />
                </td>
                <td className="px-3">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setViewRow(row)}
                      className="inline-flex h-10 min-w-[116px] items-center justify-center rounded-full border border-[#e5e9f0] bg-white px-4 text-[14px] font-semibold text-[#141517] hover:bg-muted"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={viewRow !== null}
        onClose={() => setViewRow(null)}
        title={viewRow ? viewRow.title : 'Job details'}
        footer={
          <button
            type="button"
            onClick={() => setViewRow(null)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#e5e9f0] bg-white px-4 text-[14px] font-semibold text-[#141517] hover:bg-muted"
          >
            Close
          </button>
        }
      >
        {viewRow && (
          <div className="space-y-2 text-sm font-medium text-ink-600">
            <p>Category: {viewRow.category ?? '—'}</p>
            <p>Openings: {viewRow.openings ?? '—'}</p>
            <p>Posted On: {viewRow.postedAt ? formatPostedOn(viewRow.postedAt) : '—'}</p>
            <p>Applicants: {viewRow.applicantCount}</p>
            <p className="flex items-center gap-2">
              Status: <RecruiterJobStatusBadge status={viewRow.status} />
            </p>
            <p className="text-ink-500">
              Full job detail and edit screen will be added once the backend jobs API is wired.
            </p>
          </div>
        )}
      </Dialog>
    </>
  );
}
