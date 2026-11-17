import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckSquare,
  Clock,
  FileText,
  IndianRupee,
  MapPin,
  X,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Dialog } from '@/shared/ui/Dialog';
import { useHomeState } from '../hooks/useHomeState';
import { useHireLanguage } from '../hooks/useHireLanguage';
import type { Job } from '../schemas/home';
import { homeButton, kicker } from './styles';

const chipIcon = 'size-4 flex-none text-ink-400';
const chip = 'flex items-center gap-2 rounded-xl border border-line px-3 py-2';
const tabClass =
  'border-b-2 px-1 py-2.5 text-sm font-extrabold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30';
const sectionIconWrap = 'mt-0.5 size-5 flex-none text-brand-600';

type DialogTab = 'details' | 'about';

export interface JobDialogProps {
  job: Job | null;
  onClose: () => void;
  /** Find Jobs: persist an application instead of the marketing apply link. */
  onApply?: (job: Job) => void | boolean;
  /** Recruiter market browse: details only, no apply CTA. */
  hideApply?: boolean;
}

export function JobDialog({ job, onClose, onApply, hideApply = false }: JobDialogProps) {
  const { setFlow } = useHomeState();
  const { tx } = useHireLanguage();
  const [tab, setTab] = useState<DialogTab>('details');
  const [trackedJob, setTrackedJob] = useState(job);

  if (job !== trackedJob) {
    setTrackedJob(job);
    setTab('details');
  }

  return (
    <Dialog
      open={job !== null}
      bare
      onClose={onClose}
      title={job ? `${tx(job.title)}, job details` : 'Job details'}
      className="m-auto flex max-h-[85vh] w-[min(640px,calc(100%-32px))] flex-col rounded-3xl bg-surface p-0 text-ink shadow-dialog backdrop:bg-ink/35 open:animate-dlg-in motion-reduce:animate-none"
    >
      {job && (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto p-[22px]">
            <div className="flex items-start justify-between gap-3">
              <p className={kicker}>{tx(job.place)}</p>
              <button
                type="button"
                aria-label={tx('Close')}
                onClick={onClose}
                className="grid size-9 flex-none place-items-center rounded-full bg-muted transition-colors duration-150 hover:bg-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
              >
                <X className="size-4 stroke-[2.4]" />
              </button>
            </div>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">
              {tx(job.title)}
            </h3>
            {job.company || job.verified ? (
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm font-bold text-ink-600">
                {job.company}
                {job.verified && (
                  <span className="inline-flex items-center gap-1 text-brand-600">
                    <BadgeCheck className="size-4" aria-hidden="true" />
                    {tx('Verified')}
                  </span>
                )}
              </p>
            ) : null}
            <div className="mt-4 grid grid-cols-2 gap-2 min-[560px]:grid-cols-4">
              <span className={chip}>
                <MapPin className={chipIcon} />
                {job.area}
              </span>
              <span className={chip}>
                <Briefcase className={chipIcon} />
                {tx(job.type)}
              </span>
              <span className={chip}>
                <Clock className={chipIcon} />
                {job.shift}
              </span>
              <span className={chip}>
                <IndianRupee className={chipIcon} />
                {job.pay}
              </span>
            </div>

            <div role="tablist" className="mt-5 flex gap-5 border-b border-line">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'details'}
                onClick={() => setTab('details')}
                className={cn(
                  tabClass,
                  tab === 'details'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-ink-500'
                )}
              >
                {tx('Job Details')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'about'}
                onClick={() => setTab('about')}
                className={cn(
                  tabClass,
                  tab === 'about'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-ink-500'
                )}
              >
                {tx('About Restaurant')}
              </button>
            </div>

            {tab === 'details' ? (
              <div className="mt-4 space-y-4">
                <div className="flex gap-3">
                  <FileText className={sectionIconWrap} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-ink">{tx('Job Description')}</p>
                    <p className="mt-1 text-sm leading-relaxed font-medium text-ink-600">
                      {job.description ??
                        tx(
                          'Apply with your skills, the area you can travel to, and the shift you can work.'
                        )}
                    </p>
                  </div>
                </div>
                {job.responsibilities && job.responsibilities.length > 0 && (
                  <div className="flex gap-3">
                    <CheckSquare className={sectionIconWrap} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-ink">
                        {tx('Key Responsibilities')}
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed font-medium text-ink-600 marker:text-brand-600">
                        {job.responsibilities.map((item) => (
                          <li key={item}>{tx(item)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {job.skills && job.skills.length > 0 && (
                  <div className="flex gap-3">
                    <Zap className={sectionIconWrap} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-ink">{tx('Required Skills')}</p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-line bg-canvas px-3 py-1.5 text-[13px] font-semibold text-ink-700"
                          >
                            {tx(skill)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 flex gap-3">
                <Briefcase className={sectionIconWrap} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-ink">{job.company ?? tx(job.place)}</p>
                  <p className="mt-1 text-sm leading-relaxed font-medium text-ink-600">
                    {tx('Restaurant information is currently unavailable.')}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-none flex-wrap gap-3 border-t border-line p-[22px]">
            {!hideApply &&
              (onApply ? (
                <button
                  type="button"
                  onClick={() => {
                    const applied = onApply(job);
                    if (applied !== false) onClose();
                  }}
                  className={cn(
                    homeButton('orange-slim'),
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30'
                  )}
                >
                  {tx('Apply Now')}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              ) : (
                <a
                  href="#how"
                  onClick={() => {
                    onClose();
                    setFlow('seeker');
                  }}
                  className={cn(
                    homeButton('orange-slim'),
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30'
                  )}
                >
                  {tx('Apply Now')}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              ))}
            <button
              type="button"
              onClick={onClose}
              className={cn(
                homeButton('white-slim'),
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30'
              )}
            >
              {tx('Close')}
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}
