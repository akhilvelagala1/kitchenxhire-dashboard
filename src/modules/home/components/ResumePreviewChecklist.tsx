import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { RESUME_WIZARD_STEPS } from '../schemas/jobSeekerResumeWizard';

interface ResumePreviewChecklistProps {
  completed: Record<number, boolean>;
}

function LeadingCheck({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-full shadow-[0_2px_6px_rgb(27_158_75/0.2)]',
        done ? 'bg-success-700 text-white' : 'border-2 border-line bg-surface'
      )}
      aria-hidden="true"
    >
      {done ? <Check className="size-4" strokeWidth={2.75} /> : null}
    </span>
  );
}

function TrailingCheck({ done }: { done: boolean }) {
  if (!done) {
    return <span className="size-5 shrink-0" aria-hidden="true" />;
  }
  return (
    <span
      className="grid size-5 shrink-0 place-items-center rounded-full bg-success-700/90 text-white"
      aria-hidden="true"
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
  );
}

/** Reference-style completion panel beside resume preview (compact, content-height). */
export function ResumePreviewChecklist({ completed }: ResumePreviewChecklistProps) {
  return (
    <div
      className="w-full rounded-[18px] border border-success-700/12 bg-success-50 p-4 shadow-[0_4px_16px_rgb(27_158_75/0.07)]"
      role="status"
      aria-label="Resume sections completed"
    >
      <ol className="space-y-3">
        {RESUME_WIZARD_STEPS.map((step) => {
          const done = Boolean(completed[step.id]);
          return (
            <li key={step.key} className="flex items-center gap-3">
              <LeadingCheck done={done} />
              <span
                className={cn(
                  'min-w-0 flex-1 text-[13.5px] font-bold leading-tight tracking-[-0.01em]',
                  done ? 'text-ink' : 'text-ink-500'
                )}
              >
                {step.label}
              </span>
              <TrailingCheck done={done} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
