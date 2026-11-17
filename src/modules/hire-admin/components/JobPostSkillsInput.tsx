import { useId, useState, type KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/shared/ui/Input';

const MAX_SKILLS = 20;

// Below lg the pill, × and + keep comfortable touch sizes; from lg they shrink to the 24-unit design.
const PILL =
  'inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 text-sm font-semibold text-ink-700 lg:h-[calc(24*var(--u))] lg:text-dense-sm';
const REMOVE =
  'inline-grid size-6 place-items-center rounded-full text-ink-500 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600 lg:size-4';
const ADD_FIELD = 'relative min-w-[calc(180*var(--u))] max-w-[calc(345*var(--u))] flex-1';
// From lg `!` beats Input's own 44px height, 12px radius and padding; `block` keeps the inline input
// from leaving line-box space under it, so the row stays exactly 24 design px tall.
const ADD_INPUT =
  'block pr-10 lg:h-[calc(24*var(--u))] lg:min-h-0! lg:rounded-lg! lg:px-2.5! lg:pr-8! lg:text-dense-sm!';
const ADD =
  'absolute top-1/2 right-1 grid size-8 -translate-y-1/2 place-items-center rounded-md text-ink-700 enabled:hover:bg-canvas focus-visible:outline-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:text-disabled-ink lg:size-5';

interface JobPostSkillsInputProps {
  skills: string[];
  onChange: (next: string[]) => void;
  error?: string;
}

/** Optional skill tags: Enter or + adds one, × removes one. Blank and repeated values are ignored. */
export function JobPostSkillsInput({ skills, onChange, error }: JobPostSkillsInputProps) {
  const id = useId();
  const [draft, setDraft] = useState('');
  const full = skills.length >= MAX_SKILLS;

  const add = () => {
    const value = draft.trim();
    if (!value || full) return;
    const seen = skills.some((skill) => skill.toLowerCase() === value.toLowerCase());
    if (!seen) onChange([...skills, value]);
    setDraft('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    // Enter adds a skill; it must not submit the surrounding form.
    event.preventDefault();
    add();
  };

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        Skills <span className="font-normal text-ink-soft">(optional)</span>
      </label>
      <div className="mt-[calc(3*var(--u))] flex flex-wrap items-center gap-2">
        {skills.map((skill) => (
          <span key={skill} className={PILL}>
            {skill}
            <button
              type="button"
              aria-label={`Remove ${skill}`}
              className={REMOVE}
              onClick={() => onChange(skills.filter((item) => item !== skill))}
            >
              <X aria-hidden="true" className="size-3.5 lg:size-3" />
            </button>
          </span>
        ))}
        <div className={ADD_FIELD}>
          <Input
            id={id}
            className={ADD_INPUT}
            value={draft}
            placeholder="Add a skill"
            aria-label="Add a skill"
            maxLength={40}
            autoComplete="off"
            disabled={full}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <button
            type="button"
            aria-label="Add skill"
            className={ADD}
            disabled={full}
            onClick={add}
          >
            <Plus aria-hidden="true" className="size-4 lg:size-3.5" />
          </button>
        </div>
      </div>
      {full && (
        <p className="mt-1 text-sm text-ink-soft lg:text-dense-sm lg:leading-3.5">
          You can add up to {MAX_SKILLS} skills
        </p>
      )}
      {error && (
        <p role="alert" className="mt-1 text-sm text-danger-600 lg:text-dense-sm lg:leading-3.5">
          {error}
        </p>
      )}
    </div>
  );
}
