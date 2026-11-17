import { Pencil } from 'lucide-react';
import type { ProfileWizardFormValues } from '../schemas/jobSeekerProfileWizard';
import { homeButton } from './styles';

const ROWS: { key: keyof ProfileWizardFormValues; label: string }[] = [
  { key: 'fullName', label: 'Full Name' },
  { key: 'mobile', label: 'Mobile Number' },
  { key: 'city', label: 'Current City / Location' },
  { key: 'preferredRole', label: 'Preferred Job Role' },
  { key: 'workExperience', label: 'Work Experience' },
  { key: 'expectedSalary', label: 'Expected Salary' },
  { key: 'primarySkills', label: 'Primary Skills' },
  { key: 'highestQualification', label: 'Highest Qualification' }
];

interface ProfileSavedSummaryProps {
  values: ProfileWizardFormValues;
  onEdit: () => void;
}

/** Read-only profile snapshot after Save Profile, with one Edit Profile action. */
export function ProfileSavedSummary({ values, onEdit }: ProfileSavedSummaryProps) {
  return (
    <div className="mt-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] font-semibold text-ink-600">
          Your profile is saved. Employers can discover you for matching roles.
        </p>
        <button type="button" onClick={onEdit} className={homeButton('white-slim') + ' gap-1.5'}>
          <Pencil className="size-3.5" aria-hidden="true" />
          Edit Profile
        </button>
      </div>
      <dl className="grid gap-3 min-[768px]:grid-cols-2">
        {ROWS.map((row) => (
          <div key={row.key} className="rounded-xl border border-line bg-muted/40 px-3.5 py-3">
            <dt className="text-[11px] font-extrabold uppercase tracking-wide text-ink-500">
              {row.label}
            </dt>
            <dd className="mt-1 text-[14px] font-semibold text-ink">
              {String(values[row.key] ?? '').trim() || '—'}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
