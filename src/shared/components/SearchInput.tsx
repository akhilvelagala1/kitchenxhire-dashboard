import { useEffect, useState } from 'react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { Input } from '@/shared/ui/Input';

interface SearchInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

/** Debounced server-side search. Typing never fires one request per keystroke. */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search',
  label = 'Search',
  className
}: SearchInputProps) {
  const [text, setText] = useState(value ?? '');
  const debounced = useDebouncedValue(text, 300);

  useEffect(() => {
    if (debounced !== (value ?? '')) onChange(debounced);
    // value is the URL echo of our own change; reacting to it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <Input
      type="search"
      aria-label={label}
      placeholder={placeholder}
      value={text}
      onChange={(e) => setText(e.target.value)}
      className={className ?? 'md:max-w-xs'}
    />
  );
}
