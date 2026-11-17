import { X } from 'lucide-react';
import { Dialog } from '@/shared/ui/Dialog';
import { formatAppliedDate } from '../lib/jobApplications';
import type { JobApplication } from '../schemas/jobApplication';
import { APPLICATION_STATUS_LABEL } from '../schemas/jobApplication';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { homeButton, metaGrid, metaItem } from './styles';

interface ApplicationDetailDialogProps {
  application: JobApplication | null;
  onClose: () => void;
}

export function ApplicationDetailDialog({ application, onClose }: ApplicationDetailDialogProps) {
  return (
    <Dialog
      open={application !== null}
      bare
      onClose={onClose}
      title={application ? `${application.title}, application details` : 'Application details'}
      className="m-auto w-[min(480px,calc(100%-32px))] rounded-3xl bg-surface p-0 text-ink shadow-dialog backdrop:bg-ink/35 open:animate-dlg-in motion-reduce:animate-none"
    >
      {application && (
        <div className="p-[22px]">
          <div className="flex items-start justify-between gap-3">
            <ApplicationStatusBadge status={application.status} />
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="grid size-9 place-items-center rounded-full bg-muted transition-colors duration-150 hover:bg-disabled"
            >
              <X className="size-4 stroke-[2.4]" />
            </button>
          </div>
          <h3 className="mt-3 text-2xl font-extrabold tracking-tight">{application.title}</h3>
          <p className="mt-1 text-sm font-bold text-ink-600">{application.company}</p>
          <p className="mt-1 text-sm font-bold text-ink-500">{application.type}</p>
          <div className={metaGrid + ' mt-4'}>
            <span className={metaItem}>{application.area}</span>
            <span className={metaItem}>{application.shift}</span>
            <span className={metaItem}>{application.pay}</span>
            <span className={metaItem}>Applied on {formatAppliedDate(application.appliedAt)}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed font-medium text-ink-600">
            Current status:{' '}
            <span className="font-extrabold text-ink">
              {APPLICATION_STATUS_LABEL[application.status]}
            </span>
            . Updates appear here when the employer moves your application forward.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={onClose} className={homeButton('orange-slim')}>
              Close
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
