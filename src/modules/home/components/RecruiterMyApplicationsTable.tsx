import { FileText, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import type { RecruiterInboundApplication } from '../schemas/recruiterApplication';
import { CandidateDetailsModal } from './CandidateDetailsModal';
import { findRecruiterJobMeta } from '../lib/recruiterPostedJobsStore';
import { RecruiterMyApplicationsStatusBadge } from './RecruiterMyApplicationsStatusBadge';

function formatAppliedOn(iso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(iso));
}

interface RecruiterMyApplicationsTableProps {
  rows: RecruiterInboundApplication[];
  accountId: string;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export function RecruiterMyApplicationsTable({
  rows,
  accountId,
  onAccept,
  onReject,
  onUpdateNotes
}: RecruiterMyApplicationsTableProps) {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [viewRow, setViewRow] = useState<RecruiterInboundApplication | null>(null);
  const [viewTab, setViewTab] = useState<'overview' | 'resume' | 'application'>('overview');
  const [menuId, setMenuId] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table // guard-allow: recruiter my applications reference table
          className="w-full min-w-[980px] table-fixed border-collapse text-left"
        >
          <colgroup>
            <col className="w-[240px]" />
            <col className="w-[145px]" />
            <col className="w-[120px]" />
            <col className="w-[120px]" />
            <col className="w-[150px]" />
            <col className="w-[145px]" />
            <col className="w-[180px]" />
          </colgroup>
          <thead>
            <tr className="h-9 bg-[#f2f4f7] text-[13px] font-bold text-[#141517]">
              <th className="px-3 font-bold">Candidate</th>
              <th className="px-3 font-bold">Applied For</th>
              <th className="px-3 font-bold">Experience</th>
              <th className="px-3 font-bold">Applied On</th>
              <th className="px-3 font-bold">Resume</th>
              <th className="px-3 font-bold">Status</th>
              <th className="px-3 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => {
                  setViewRow(row);
                  setViewTab('overview');
                }}
                className="h-[62px] cursor-pointer border-b border-[#edf0f5] text-[14px]"
              >
                <td className="px-3 py-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#fff0e8] text-[13px] font-bold text-[#9e350b]">
                      {row.initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[16px] font-bold text-[#141517]">
                        {row.candidateName}
                      </span>
                      <span className="block truncate text-[14px] font-medium text-[#243754]">
                        {[row.age ? `${row.age} yrs` : null, row.gender, row.location]
                          .filter(Boolean)
                          .join(' • ')}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="truncate px-3 font-semibold text-[#141517]" title={row.jobTitle}>
                  {row.jobTitle}
                </td>
                <td className="px-3 font-medium text-[#141517]">{row.experience ?? '—'}</td>
                <td className="px-3 font-medium text-[#141517] tabular-nums">
                  {formatAppliedOn(row.appliedAt)}
                </td>
                <td className="px-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewRow(row);
                      setViewTab('resume');
                    }}
                    className="inline-flex items-center gap-2 font-semibold text-[#1746b8] hover:underline"
                  >
                    <FileText className="size-[18px] shrink-0" aria-hidden />
                    View Resume
                  </button>
                </td>
                <td className="px-3">
                  <RecruiterMyApplicationsStatusBadge status={row.status} />
                </td>
                <td className="relative px-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewRow(row);
                        setViewTab('overview');
                      }}
                      className="inline-flex h-10 min-w-[116px] items-center justify-center rounded-full border border-[#e5e9f0] bg-white px-4 text-[14px] font-semibold text-[#141517] hover:bg-muted"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      aria-label={`More actions for ${row.candidateName}`}
                      aria-expanded={menuId === row.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuId((prev) => (prev === row.id ? null : row.id));
                      }}
                      className="grid size-9 place-items-center rounded-lg text-ink-600 hover:bg-muted"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                  {menuId === row.id && (
                    <div className="absolute top-12 right-3 z-20 min-w-[180px] rounded-xl border border-[#e5e9f0] bg-white p-1.5 shadow-lg">
                      <button
                        type="button"
                        className="block w-full rounded-lg px-3 py-2 text-left text-[14px] font-semibold hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewRow(row);
                          setViewTab('overview');
                          setMenuId(null);
                        }}
                      >
                        View Profile
                      </button>
                      <button
                        type="button"
                        className="block w-full rounded-lg px-3 py-2 text-left text-[14px] font-semibold hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewRow(row);
                          setViewTab('resume');
                          setMenuId(null);
                        }}
                      >
                        View Resume
                      </button>
                      <button
                        type="button"
                        className="block w-full rounded-lg px-3 py-2 text-left text-[14px] font-semibold text-[#15803d] hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAccept(row.id);
                          setMenuId(null);
                        }}
                      >
                        Accept Application
                      </button>
                      <button
                        type="button"
                        className="block w-full rounded-lg px-3 py-2 text-left text-[14px] font-semibold text-[#dc2626] hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRejectId(row.id);
                          setMenuId(null);
                        }}
                      >
                        Reject Application
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={rejectId !== null}
        title="Reject this application?"
        message="The candidate will be marked as rejected. You can change status later from the applications list."
        confirmLabel="Reject"
        onConfirm={() => {
          if (rejectId) onReject(rejectId);
          setRejectId(null);
        }}
        onCancel={() => setRejectId(null)}
      />

      <CandidateDetailsModal
        application={viewRow}
        jobMeta={viewRow ? findRecruiterJobMeta(accountId, viewRow.jobId) : undefined}
        initialTab={viewTab}
        onClose={() => setViewRow(null)}
        onAccept={onAccept}
        onReject={onReject}
        onUpdateNotes={onUpdateNotes}
      />
    </>
  );
}
