import { cn } from '@/shared/lib/cn';
import { RESUME_WIZARD_STEPS, type ResumeWizardStepId } from '../schemas/jobSeekerResumeWizard';

interface ResumeStepIndicatorProps {
  current: ResumeWizardStepId;
  onSelect?: (step: ResumeWizardStepId) => void;
}

export function ResumeStepIndicator({ current, onSelect }: ResumeStepIndicatorProps) {
  return (
    <nav aria-label="Resume steps">
      <ol className="flex w-full items-center">
        {RESUME_WIZARD_STEPS.map((step, index) => {
          const done = step.id < current;
          const active = step.id === current;
          const isLast = index === RESUME_WIZARD_STEPS.length - 1;

          return (
            <li
              key={step.key}
              className={cn('flex min-w-0 items-center', isLast ? 'shrink-0' : 'flex-1')}
            >
              <button
                type="button"
                onClick={() => onSelect?.(step.id)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex min-w-0 items-center gap-2 rounded-full py-1 pr-3 pl-1',
                  active && 'bg-[#FFF0E9]',
                  onSelect && 'cursor-pointer hover:bg-[#FFF0E9]'
                )}
              >
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-extrabold',
                    active || done
                      ? 'bg-brand-600 text-white shadow-[0_3px_10px_rgb(255_79_24/0.22)]'
                      : 'border-2 border-line bg-surface text-ink-500'
                  )}
                >
                  {step.id}
                </span>
                <span
                  className={cn(
                    'truncate text-[13px] font-bold min-[768px]:text-[14px]',
                    active ? 'text-brand-600' : done ? 'text-ink-700' : 'text-ink-500'
                  )}
                >
                  {step.label}
                </span>
              </button>
              {!isLast ? (
                <span
                  className="mx-2 hidden h-px min-w-[12px] flex-1 bg-line min-[768px]:block"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
