import { MapPin, Search, X } from 'lucide-react';
import { useId, useRef, useState, type FormEvent } from 'react';
import { cn } from '@/shared/lib/cn';
import { searchCities, searchTaxonomy } from '../content/jobTaxonomy';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { HireMenu } from './HireMenu';
import { pageWrap } from './styles';

/** Start suggesting once the typed text is at least this long. */
const SUGGEST_MIN_CHARS = 2;

interface JobSearchBarProps {
  role: string;
  city: string;
  onRole: (value: string) => void;
  onCity: (value: string) => void;
  onSubmit: () => void;
  /** Find Jobs uses a text button; the home page uses the round search icon. */
  submitLabel?: string;
  rolePlaceholder?: string;
  /** The home page uses the compact pill inset over the rounded hero. */
  variant?: 'default' | 'home';
}

const fieldClass =
  'flex min-h-11 min-w-0 items-center gap-2.5 px-3 text-ink-400 min-[768px]:min-h-0 min-[768px]:flex-1';
const inputClass =
  'w-full min-w-0 border-0 bg-transparent text-sm font-medium text-ink outline-none placeholder:font-medium placeholder:text-ink-400 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden';

export function JobSearchBar({
  role,
  city,
  onRole,
  onCity,
  onSubmit,
  submitLabel,
  rolePlaceholder,
  variant = 'default'
}: JobSearchBarProps) {
  const { tx } = useHireLanguage();
  const isHome = variant === 'home';
  const roleHint = rolePlaceholder ?? tx('Job title or skill (e.g., Cook, Kitchen Helper)');
  const cityFieldRef = useRef<HTMLLabelElement>(null);
  const roleFieldRef = useRef<HTMLLabelElement>(null);
  const cityInputId = useId();
  const roleInputId = useId();
  const cityListId = useId();
  const roleListId = useId();
  const [citySuggestOpen, setCitySuggestOpen] = useState(false);
  const [roleSuggestOpen, setRoleSuggestOpen] = useState(false);

  // Role suggestions come from the shared taxonomy (categories, designations, cuisines,
  // specializations, skills) — never hardcoded inside this component.
  const roleSuggestions =
    role.trim().length >= SUGGEST_MIN_CHARS
      ? searchTaxonomy(role).map((item) => ({ value: item.label, label: item.label }))
      : [];

  // City suggestions resolve abbreviations (HYD -> Hyderabad), partial names and localities.
  // A locality shows as "Locality, City" so it's never mistaken for the city itself.
  const citySuggestions =
    city.trim().length >= SUGGEST_MIN_CHARS
      ? searchCities(city).map((item) => ({
          value: item.label,
          label: item.city ? `${item.label}, ${item.city}` : item.label
        }))
      : [];

  function submit(event: FormEvent) {
    event.preventDefault();
    setCitySuggestOpen(false);
    setRoleSuggestOpen(false);
    onSubmit();
  }

  function typeRole(value: string) {
    onRole(value);
    setRoleSuggestOpen(value.trim().length >= SUGGEST_MIN_CHARS);
  }

  function selectRole(value: string) {
    onRole(value);
    setRoleSuggestOpen(false);
  }

  function typeCity(value: string) {
    onCity(value);
    setCitySuggestOpen(value.trim().length >= SUGGEST_MIN_CHARS);
  }

  function selectCity(value: string) {
    onCity(value);
    setCitySuggestOpen(false);
  }

  // Keep the legacy nav city list in sync with the taxonomy so existing references still work.

  return (
    <div
      className={
        isHome
          ? 'relative z-[8] -mt-[18px] w-full px-4 min-[768px]:-mt-[28px] min-[768px]:px-[42px] min-[1024px]:-mt-[30px] min-[1024px]:px-[50px]'
          : cn(
              pageWrap,
              'relative z-[6] -mt-[18px] min-[768px]:z-[8] min-[768px]:-mt-[38px] min-[1024px]:-mt-[46px]'
            )
      }
    >
      <form
        role="search"
        onSubmit={submit}
        className={cn(
          'flex flex-col gap-2 rounded-3xl bg-surface p-2 shadow-search transition-shadow duration-[220ms] focus-within:ring-2 focus-within:ring-brand-200 focus-within:shadow-search-focus min-[768px]:flex-row min-[768px]:items-center min-[768px]:gap-0 min-[768px]:rounded-full min-[768px]:py-2 min-[768px]:pr-2 min-[768px]:shadow-search-wide',
          isHome ? 'min-[768px]:h-[60px] min-[768px]:pl-5' : 'min-[768px]:h-[72px] min-[768px]:pl-6'
        )}
      >
        <label ref={roleFieldRef} className={cn(fieldClass, 'min-[768px]:flex-[1.35]')}>
          <Search className="size-[18px] flex-none" />
          <span className="sr-only">{tx('Job title or skill')}</span>
          <input
            id={roleInputId}
            type="search"
            autoComplete="off"
            role="combobox"
            aria-expanded={roleSuggestOpen && roleSuggestions.length > 0}
            aria-controls={roleListId}
            aria-autocomplete="list"
            value={role}
            onChange={(event) => typeRole(event.target.value)}
            onFocus={() => setRoleSuggestOpen(role.trim().length >= SUGGEST_MIN_CHARS)}
            onBlur={() => setRoleSuggestOpen(false)}
            placeholder={roleHint}
            className={inputClass}
          />
          {role ? (
            <button
              type="button"
              aria-label={tx('Clear job title or skill')}
              onClick={() => {
                onRole('');
                setRoleSuggestOpen(false);
              }}
              className="grid size-6 flex-none place-items-center rounded-full text-ink-400 hover:bg-muted hover:text-ink-700"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </label>
        <span
          aria-hidden="true"
          className="hidden h-7 w-px self-center bg-line min-[768px]:mx-1.5 min-[768px]:block"
        />
        <label ref={cityFieldRef} className={fieldClass}>
          <MapPin className="size-[18px] flex-none" />
          <span className="sr-only">{tx('City or area')}</span>
          <input
            id={cityInputId}
            type="search"
            autoComplete="off"
            role="combobox"
            aria-expanded={citySuggestOpen && citySuggestions.length > 0}
            aria-controls={cityListId}
            aria-autocomplete="list"
            value={city}
            onChange={(event) => typeCity(event.target.value)}
            onFocus={() => setCitySuggestOpen(city.trim().length >= SUGGEST_MIN_CHARS)}
            onBlur={() => setCitySuggestOpen(false)}
            placeholder={tx('City or area (e.g., Hyderabad)')}
            className={inputClass}
          />
          {city ? (
            <button
              type="button"
              aria-label={tx('Clear city or area')}
              onClick={() => {
                onCity('');
                setCitySuggestOpen(false);
              }}
              className="grid size-6 flex-none place-items-center rounded-full text-ink-400 hover:bg-muted hover:text-ink-700"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </label>
        {roleSuggestOpen && roleSuggestions.length > 0 && (
          <HireMenu
            id={roleListId}
            labelledBy={roleInputId}
            open={roleSuggestOpen}
            value={role}
            options={roleSuggestions}
            triggerRef={roleFieldRef}
            minWidth={200}
            onChange={selectRole}
            onClose={() => setRoleSuggestOpen(false)}
          />
        )}
        {citySuggestOpen && citySuggestions.length > 0 && (
          <HireMenu
            id={cityListId}
            labelledBy={cityInputId}
            open={citySuggestOpen}
            value={city}
            options={citySuggestions}
            triggerRef={cityFieldRef}
            minWidth={200}
            onChange={selectCity}
            onClose={() => setCitySuggestOpen(false)}
          />
        )}
        <button
          type="submit"
          aria-label={tx('Search jobs')}
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-[filter,translate] duration-150 hover:brightness-[.96] active:translate-y-px',
            submitLabel
              ? 'h-[46px] w-full px-6 text-sm font-extrabold min-[768px]:h-[52px] min-[768px]:w-auto min-[768px]:min-w-[112px] min-[768px]:px-8'
              : cn(
                  'grid h-[46px] w-full place-items-center',
                  isHome
                    ? 'min-[768px]:size-[44px] min-[768px]:w-[44px]'
                    : 'min-[768px]:size-[52px] min-[768px]:w-[52px]'
                )
          )}
        >
          {submitLabel ? submitLabel : <Search className="size-5 stroke-[2.4]" />}
        </button>
      </form>
    </div>
  );
}
