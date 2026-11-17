import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  /** Drops the bottom margin when the parent lays pages out with its own gap. */
  flush?: boolean;
}

/** Every page title goes through here; pages never write their own <h1> (UI-03). */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  titleClassName,
  descriptionClassName,
  flush
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-3 md:flex-row md:items-end md:justify-between',
        !flush && 'mb-6',
        className
      )}
    >
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-1 text-sm text-ink-soft">
            <ol className="flex flex-wrap gap-1">
              {breadcrumbs.map((c, i) => (
                <li key={c.label} className="flex gap-1">
                  {i > 0 && <span aria-hidden>/</span>}
                  {c.to ? (
                    <Link to={c.to} className="hover:underline">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className={cn('truncate text-2xl font-semibold text-ink', titleClassName)}>{title}</h1>
        {description && (
          <p className={cn('mt-1 text-sm text-ink-soft', descriptionClassName)}>{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
