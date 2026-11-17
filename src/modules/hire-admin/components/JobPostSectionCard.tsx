import { useId, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface JobPostSectionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}

/** One white card of the Post a Job form: orange icon tile, bold title, grey line, then the fields. */
export function JobPostSectionCard({
  icon: Icon,
  title,
  description,
  children
}: JobPostSectionCardProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="rounded-xl border border-line bg-surface p-4 lg:pt-2 lg:pb-[calc(15*var(--u))]"
    >
      <header className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FFF0E9] text-brand-600">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id={headingId} className="text-base font-bold leading-5 text-ink">
            {title}
          </h2>
          <p className="text-sm text-ink-soft lg:text-dense-sm lg:leading-3.5">{description}</p>
        </div>
      </header>
      <div className="mt-2">{children}</div>
    </section>
  );
}
