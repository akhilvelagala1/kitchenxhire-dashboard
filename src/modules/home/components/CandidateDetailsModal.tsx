import { X } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Dialog } from '@/shared/ui/Dialog';
import { useCandidateNotes } from '../hooks/useCandidateNotes';
import {
  CANDIDATE_TABS,
  downloadCandidateResume,
  type CandidateTab
} from '../lib/candidateDetails';
import type { RecruiterJobMeta } from '../lib/recruiterPostedJobsStore';
import type { RecruiterInboundApplication } from '../schemas/recruiterApplication';
import { CandidateDetailsApplicationTab } from './CandidateDetailsApplicationTab';
import { CandidateDetailsOverviewTab } from './CandidateDetailsOverviewTab';
import { CandidateDetailsResumeTab } from './CandidateDetailsResumeTab';
import { CandidateDetailsSidebar } from './CandidateDetailsSidebar';
import { homeButton } from './styles';

// One fixed frame (height, width, position) for every tab: only the tabpanel content scrolls.
// `open:flex`, not `flex`: a plain display class overrides the browser's hidden-when-closed rule.
const dialogClass =
  'relative m-auto open:flex h-[min(640px,85vh)] w-[min(900px,calc(100%-32px))] flex-col overflow-hidden rounded-3xl bg-surface text-ink shadow-dialog backdrop:bg-ink/35 open:animate-dlg-in motion-reduce:animate-none';
// Identical for active and inactive tabs; only colour tokens differ so tab geometry never shifts.
const tabClass =
  'shrink-0 border-b-2 whitespace-nowrap px-1 py-2.5 text-sm font-extrabold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30';
const rejectButtonClass =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 text-[13.5px] font-extrabold text-rose-700 transition-colors duration-150 hover:bg-rose-100 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30';

export interface CandidateDetailsModalProps {
  application: RecruiterInboundApplication | null;
  jobMeta?: RecruiterJobMeta;
  initialTab?: CandidateTab;
  onClose: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export function CandidateDetailsModal({
  application,
  jobMeta,
  initialTab,
  onClose,
  onAccept,
  onReject,
  onUpdateNotes
}: CandidateDetailsModalProps) {
  const base = useId();
  const resolvedInitialTab: CandidateTab = initialTab ?? 'overview';
  const currentId = application?.id ?? null;

  const [trackedId, setTrackedId] = useState(currentId);
  const [trackedInitialTab, setTrackedInitialTab] = useState(resolvedInitialTab);
  const [tab, setTab] = useState<CandidateTab>(resolvedInitialTab);
  const notes = useCandidateNotes(application, onUpdateNotes);

  if (currentId !== trackedId || resolvedInitialTab !== trackedInitialTab) {
    setTrackedId(currentId);
    setTrackedInitialTab(resolvedInitialTab);
    setTab(resolvedInitialTab);
  }

  // Closed: the Dialog still mounts (open=false) so Escape/close transitions keep working.
  if (!application) {
    return (
      <Dialog open={false} bare onClose={onClose} title="Candidate details" className={dialogClass}>
        {null}
      </Dialog>
    );
  }

  const panelId = `${base}-panel`;
  const then = (action: () => void, after: () => void) => () => {
    action();
    after();
  };
  const download = () => downloadCandidateResume(application);

  return (
    <Dialog
      open
      bare
      onClose={onClose}
      title={`${application.candidateName}, candidate details`}
      className={dialogClass}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full bg-muted hover:bg-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
      >
        <X className="size-4 stroke-[2.4]" aria-hidden="true" />
      </button>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 min-[900px]:flex-row min-[900px]:overflow-hidden">
        <CandidateDetailsSidebar
          application={application}
          onViewFullProfile={() => setTab('resume')}
          onDownloadResume={download}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col min-[900px]:pl-5">
          <div
            role="tablist"
            aria-label="Candidate details"
            className="flex flex-none gap-5 overflow-x-auto border-b border-line [scrollbar-width:thin]"
          >
            {CANDIDATE_TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                id={`${base}-tab-${item.key}`}
                aria-selected={tab === item.key}
                aria-controls={panelId}
                onClick={() => setTab(item.key)}
                className={cn(
                  tabClass,
                  tab === item.key
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-ink-500'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={panelId}
            aria-labelledby={`${base}-tab-${tab}`}
            className="mt-4 min-h-0 flex-1 space-y-4 min-[900px]:overflow-y-auto"
          >
            {tab === 'overview' && <CandidateDetailsOverviewTab application={application} />}
            {tab === 'resume' && (
              <CandidateDetailsResumeTab application={application} onDownload={download} />
            )}
            {tab === 'application' && (
              <CandidateDetailsApplicationTab
                application={application}
                jobMeta={jobMeta}
                notes={notes}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-none flex-wrap justify-end gap-3 border-t border-line p-5">
        <button
          type="button"
          onClick={then(() => onReject(application.id), onClose)}
          className={rejectButtonClass}
        >
          Reject
        </button>
        <button
          type="button"
          onClick={then(() => onAccept(application.id), onClose)}
          className={homeButton('orange-slim')}
        >
          Accept
        </button>
      </div>
    </Dialog>
  );
}
