import { useId, useState, type KeyboardEvent } from 'react';
import { useQuery, type QueryKey } from '@tanstack/react-query';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { Input } from '@/shared/ui/Input';
import { Spinner } from '@/shared/ui/Spinner';

export interface Option {
  value: string;
  label: string;
}

interface AsyncSelectProps {
  /** Base key; the search term is appended. */
  queryKey: QueryKey;
  /** Server-side search. Return at most ~20 options. */
  loadOptions: (search: string) => Promise<Option[]>;
  value: Option | null;
  onChange: (option: Option | null) => void;
  placeholder?: string;
  id?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

/**
 * Searchable picker for entity references (category, brand, supplier, customer).
 * Never load a whole table into a <select>: catalogues reach thousands of rows (UI-06).
 */
export function AsyncSelect({
  queryKey,
  loadOptions,
  value,
  onChange,
  placeholder = 'Type to search',
  ...aria
}: AsyncSelectProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [active, setActive] = useState(0);
  const search = useDebouncedValue(text, 250);

  const { data = [], isFetching } = useQuery({
    queryKey: [...queryKey, 'options', search],
    queryFn: () => loadOptions(search),
    enabled: open,
    staleTime: 60_000
  });

  function pick(opt: Option | null) {
    onChange(opt);
    setText('');
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, data.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open && data[active]) {
      e.preventDefault();
      pick(data[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <Input
        {...aria}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && data[active] ? `${listId}-${active}` : undefined}
        placeholder={value?.label ?? placeholder}
        value={open ? text : (value?.label ?? '')}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => {
          setText(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {isFetching && (
        <span className="absolute top-3 right-3 text-ink-soft">
          <Spinner size="sm" />
        </span>
      )}
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-surface shadow-lg"
        >
          {value && (
            <li
              role="option"
              aria-selected={false}
              className="cursor-pointer px-3 py-2 text-sm text-ink-soft hover:bg-muted"
              onMouseDown={() => pick(null)}
            >
              Clear selection
            </li>
          )}
          {data.length === 0 && !isFetching && (
            <li className="px-3 py-2 text-sm text-ink-soft">No matches</li>
          )}
          {data.map((opt, i) => (
            <li
              key={opt.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={value?.value === opt.value}
              className={`cursor-pointer px-3 py-2 text-sm ${i === active ? 'bg-muted' : ''}`}
              onMouseDown={() => pick(opt)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
