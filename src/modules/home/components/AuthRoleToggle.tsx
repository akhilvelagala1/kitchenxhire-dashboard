import { Briefcase, User } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { HireLoginIntent } from '../schemas/hireLogin';

const pill =
  'flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-[13.5px] font-extrabold transition-colors outline-offset-2 focus-visible:outline-2 focus-visible:outline-brand-600';

export function AuthRoleToggle({
  intent,
  onChange
}: {
  intent: HireLoginIntent;
  onChange: (next: HireLoginIntent) => void;
}) {
  return (
    <div
      className="grid grid-cols-2 gap-2.5"
      role="radiogroup"
      aria-label="How do you want to use KitchenX?"
    >
      <button
        type="button"
        role="radio"
        aria-checked={intent === 'job_seeker'}
        onClick={() => onChange('job_seeker')}
        className={cn(
          pill,
          intent === 'job_seeker'
            ? 'bg-brand-600 text-white shadow-auth-btn'
            : 'border border-line bg-surface text-ink hover:bg-muted/80'
        )}
      >
        <User className="size-[18px] stroke-[2.2]" aria-hidden="true" />
        Find a Job
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={intent === 'recruiter'}
        onClick={() => onChange('recruiter')}
        className={cn(
          pill,
          intent === 'recruiter'
            ? 'bg-brand-600 text-white shadow-auth-btn'
            : 'border border-line bg-surface text-ink hover:bg-muted/80'
        )}
      >
        <Briefcase className="size-[18px] stroke-[2.2]" aria-hidden="true" />
        Hire People
      </button>
    </div>
  );
}
