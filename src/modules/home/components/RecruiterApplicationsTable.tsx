import { FileText, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { findRecruiterJobMeta } from '../lib/recruiterPostedJobsStore';
import type { RecruiterInboundApplication } from '../schemas/recruiterApplication';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { CandidateDetailsModal } from './CandidateDetailsModal';
import { RecruiterApplicationStatusBadge } from './RecruiterApplicationStatusBadge';

function formatAppliedOn(iso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(iso));
}

function canAccept(status: RecruiterInboundApplication['status']) {
  return status !== 'selected' && status !== 'hired' && status !== 'rejected';
}

function canReject(status: RecruiterInboundApplication['status']) {
  return status !== 'rejected' && status !== 'hired';
}

const actionBtn =
  'inline-flex h-8 min-w-[88px] items-center justify-center rounded-lg border px-2.5 text-[12px] font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-40';

interface RecruiterApplicationsTableProps {
  rows: RecruiterInboundApplication[];
  accountId: string;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export function RecruiterApplicationsTable({
  rows,
  accountId,
  onAccept,
  onReject,
  onUpdateNotes
}: RecruiterApplicationsTableProps) {
  const { tx } = useHireLanguage();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [viewRow, setViewRow] = useState<RecruiterInboundApplication | null>(null);
  const [viewTab, setViewTab] = useState<'overview' | 'resume' | 'application'>('overview');

  return (
    <>
      <div className="overflow-x-auto">
        <table // guard-allow: recruiter applications table matches hire prototype reference
          className="w-full min-w-[960px] border-collapse text-left"
        >
          <thead>
            <tr className="border-b border-line bg-muted/60 text-[13px] font-extrabold text-ink-600">
              <th className="px-4 py-3 font-extrabold">{tx('Candidate')}</th>
              <th className="px-4 py-3 font-extrabold">{tx('Applied For')}</th>
              <th className="px-4 py-3 font-extrabold">{tx('Applied On')}</th>
              <th className="px-4 py-3 font-extrabold">{tx('Resume')}</th>
              <th className="px-4 py-3 font-extrabold">{tx('Status')}</th>
              <th className="w-[240px] px-4 py-3 text-right font-extrabold">{tx('Action')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const acceptOk = canAccept(row.status);
              const rejectOk = canReject(row.status);
              return (
                <tr
                  key={row.id}
                  onClick={() => {
                    setViewRow(row);
                    setViewTab('overview');
                  }}
                  className="h-12 cursor-pointer border-b border-line/80 text-[13px] font-semibold text-ink"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="grid size-9 flex-none place-items-center rounded-full text-[11px] font-extrabold text-white"
                        style={{ backgroundColor: `hsl(${row.avatarHue} 65% 42%)` }}
                      >
                        {row.initials}
                      </span>
                      <span className="font-extrabold text-ink">{row.candidateName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-700">{row.jobTitle}</td>
                  <td className="px-4 py-2.5 text-ink-600 tabular-nums">
                    {formatAppliedOn(row.appliedAt)}
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewRow(row);
                        setViewTab('resume');
                      }}
                      className="inline-flex items-center gap-1.5 font-extrabold text-sky-700 hover:underline"
                    >
                      <FileText className="size-4 shrink-0" aria-hidden="true" />
                      {tx('View Resume')}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <RecruiterApplicationStatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={!acceptOk}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (acceptOk) onAccept(row.id);
                        }}
                        className={cn(
                          actionBtn,
                          'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        )}
                      >
                        {tx('✓ Accept')}
                      </button>
                      <button
                        type="button"
                        disabled={!rejectOk}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (rejectOk) setRejectId(row.id);
                        }}
                        className={cn(
                          actionBtn,
                          'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                        )}
                      >
                        {tx('✕ Reject')}
                      </button>
                      <button
                        type="button"
                        aria-label={`More actions for ${row.candidateName}`}
                        onClick={(e) => e.stopPropagation()}
                        className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-500 hover:bg-muted"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
