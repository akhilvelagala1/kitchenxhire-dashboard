import { cn } from '@/shared/lib/cn';
import { PROFILE_WIZARD_STEPS, type ProfileWizardStepId } from '../schemas/jobSeekerProfileWizard';

interface ProfileStepIndicatorProps {
  current: ProfileWizardStepId;
  onSelect?: (step: ProfileWizardStepId) => void;
}

export function ProfileStepIndicator({ current, onSelect }: ProfileStepIndicatorProps) {
  return (
    <nav aria-label="Profile steps">
      <ol className="flex flex-wrap items-center gap-y-2 min-[768px]:gap-x-1 min-[1024px]:flex-nowrap">
        {PROFILE_WIZARD_STEPS.map((step, index) => {
          const done = step.id < current;
          const active = step.id === current;
          return (
            <li key={step.key} className="flex min-w-0 items-center">
              <button
                type="button"
                onClick={() => onSelect?.(step.id)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex min-w-0 items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5',
                  active && 'bg-[#FFF3ED]',
                  onSelect && 'cursor-pointer hover:bg-[#FFF3ED]'
                )}
              >
                <span
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-full text-[14px] font-extrabold',
                    active || done
                      ? 'bg-brand-600 text-white shadow-[0_4px_12px_rgb(255_79_24/0.25)]'
                      : 'border-2 border-line bg-surface text-ink-500'
                  )}
                >
                  {step.id}
                </span>
                <span
                  className={cn(
                    'text-[14px] font-bold min-[640px]:inline',
                    active ? 'text-brand-600' : done ? 'text-ink-700' : 'text-ink-500'
                  )}
                >
                  {step.label}
                </span>
              </button>
              {index < PROFILE_WIZARD_STEPS.length - 1 && (
                <span
                  className="mx-2 hidden h-px w-6 shrink-0 bg-line min-[1024px]:block min-[1280px]:mx-3 min-[1280px]:w-10"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
