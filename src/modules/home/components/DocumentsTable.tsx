import { ChevronDown, Search } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { useHireLanguage } from '../hooks/useHireLanguage';
import {
  DOCUMENT_FILTER_OPTIONS,
  type DocumentFilter,
  type JobDocument
} from '../lib/jobDocuments';
import { DocumentRow } from './DocumentRows';
import { HireMenu } from './HireMenu';

interface DocumentsTableProps {
  documents: JobDocument[];
  query: string;
  category: DocumentFilter;
  onQuery: (value: string) => void;
  onCategory: (value: DocumentFilter) => void;
  onPreview: (doc: JobDocument) => void;
  onDownload: (doc: JobDocument) => void;
  onReplace: (doc: JobDocument, file: File) => void;
  onDelete: (doc: JobDocument) => void;
}

export function DocumentsTable({
  documents,
  query,
  category,
  onQuery,
  onCategory,
  onPreview,
  onDownload,
  onReplace,
  onDelete
}: DocumentsTableProps) {
  const { tx } = useHireLanguage();
  const columns = ['Document', 'Type', 'Uploaded On', 'Status', 'Actions'] as const;

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-[18px] border border-line bg-surface p-3 shadow-card min-[1280px]:p-4">
      <div className="flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
        <h2 className="text-[20px] font-extrabold tracking-tight text-ink min-[1280px]:text-[22px]">
          {tx('Your Documents')} ({documents.length})
        </h2>
        <div className="flex flex-col gap-2 min-[640px]:flex-row">
          <label className="relative block min-[640px]:w-[280px] min-[1280px]:w-[320px]">
            <span className="sr-only">{tx('Search documents...')}</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-400" />
            <input
              type="search" // guard-allow: documents search needs a left icon the shared Input padding cannot host
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder={tx('Search documents...')}
              className="h-11 w-full rounded-xl border border-line bg-surface pr-3 pl-10 text-[15px] font-semibold text-ink placeholder:font-medium placeholder:text-ink-soft focus-visible:outline-2 focus-visible:outline-brand-600"
            />
          </label>
          <DocumentFilterMenu value={category} onChange={onCategory} />
        </div>
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-auto">
        <table // guard-allow: job seeker documents table matches the documents reference, not DataTable
          className="w-full min-w-[760px] border-collapse text-left"
        >
          <thead className="bg-muted text-[12px] font-extrabold tracking-[0.04em] text-ink-600 uppercase">
            <tr className="h-11">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className={cn(
                    'px-3',
                    column === 'Document' && 'rounded-l-xl pl-4',
                    column === 'Actions' && 'rounded-r-xl pr-4 text-right'
                  )}
                >
                  {tx(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-sm font-semibold text-ink-500">
                  {tx('No documents match your search.')}
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  onPreview={onPreview}
                  onDownload={onDownload}
                  onReplace={onReplace}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocumentFilterMenu({
  value,
  onChange
}: {
  value: DocumentFilter;
  onChange: (value: DocumentFilter) => void;
}) {
  const { tx } = useHireLanguage();
  const triggerId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selected =
    DOCUMENT_FILTER_OPTIONS.find((item) => item.value === value)?.label ?? 'All Documents';

  return (
    <div className="min-[640px]:w-[190px]">
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${tx('Document type')}: ${tx(selected)}`}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 text-[15px] font-semibold text-ink"
      >
        <span className="truncate">{tx(selected)}</span>
        <ChevronDown className="size-4 shrink-0 text-ink-400" />
      </button>
      <HireMenu
        id={`${triggerId}-menu`}
        labelledBy={triggerId}
        open={open}
        value={value}
        options={DOCUMENT_FILTER_OPTIONS.map((item) => ({
          value: item.value,
          label: tx(item.label)
        }))}
        triggerRef={triggerRef}
        minWidth={190}
        onChange={(next) => onChange(next as DocumentFilter)}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
