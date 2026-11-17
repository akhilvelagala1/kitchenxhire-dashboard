import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  MoreHorizontal,
  type LucideIcon
} from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/cn';
import { useHireLanguage } from '../hooks/useHireLanguage';
import {
  DOCUMENT_STATUS_LABEL,
  documentCategoryLabel,
  type DocumentCategory,
  type DocumentStatus,
  type JobDocument
} from '../lib/jobDocuments';

const CATEGORY_TONE: Record<DocumentCategory, string> = {
  identity: 'bg-sky-50 text-sky-700',
  education: 'bg-violet-50 text-violet-700',
  experience: 'bg-brand-50 text-brand-600',
  other: 'bg-muted text-ink-600'
};

const STATUS_TONE: Record<DocumentStatus, string> = {
  verified: 'bg-success-50 text-success-700',
  'under-review': 'bg-violet-50 text-violet-700',
  rejected: 'bg-danger-50 text-danger-700'
};

const STATUS_ICON: Record<DocumentStatus, LucideIcon> = {
  verified: CheckCircle2,
  'under-review': Clock,
  rejected: AlertCircle
};

export function DocumentRow({
  doc,
  onPreview,
  onDownload,
  onReplace,
  onDelete
}: {
  doc: JobDocument;
  onPreview: (doc: JobDocument) => void;
  onDownload: (doc: JobDocument) => void;
  onReplace: (doc: JobDocument, file: File) => void;
  onDelete: (doc: JobDocument) => void;
}) {
  const { tx } = useHireLanguage();
  const StatusIcon = STATUS_ICON[doc.status];
  const image = doc.kind === 'jpg' || doc.kind === 'png';
  const FileIcon = image ? ImageIcon : FileText;

  return (
    <tr className="h-[76px] border-b border-line-soft last:border-b-0">
      <td className="px-3 pl-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'grid size-12 shrink-0 place-items-center rounded-xl',
              doc.kind === 'pdf' && 'bg-danger-50 text-danger-600',
              image && 'bg-violet-50 text-violet-600',
              doc.kind === 'other' && 'bg-muted text-ink-500'
            )}
          >
            <FileIcon className="size-6" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold text-ink">{doc.name}</p>
            <p className="text-[13px] font-medium text-ink-500">{doc.sizeLabel}</p>
          </div>
        </div>
      </td>
      <td className="px-3">
        <span
          className={cn(
            'inline-flex rounded-full px-2.5 py-1 text-[13px] font-bold',
            CATEGORY_TONE[doc.category]
          )}
        >
          {tx(documentCategoryLabel(doc.category))}
        </span>
      </td>
      <td className="px-3 text-[14px] font-semibold whitespace-nowrap text-ink-700">
        {doc.uploadedLabel}
      </td>
      <td className="px-3">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-bold whitespace-nowrap',
            STATUS_TONE[doc.status]
          )}
        >
          <StatusIcon className="size-3.5" />
          {tx(DOCUMENT_STATUS_LABEL[doc.status])}
        </span>
      </td>
      <td className="px-3 pr-4">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            aria-label={`${tx('Preview document')}: ${doc.name}`}
            onClick={() => onPreview(doc)}
            className="grid size-10 place-items-center rounded-xl text-ink-500 hover:bg-muted"
          >
            <Eye className="size-5" />
          </button>
          <button
            type="button"
            aria-label={`${tx('Download document')}: ${doc.name}`}
            onClick={() => onDownload(doc)}
            className="grid size-10 place-items-center rounded-xl text-ink-500 hover:bg-muted"
          >
            <Download className="size-5" />
          </button>
          <DocumentMoreMenu doc={doc} onReplace={onReplace} onDelete={onDelete} />
        </div>
      </td>
    </tr>
  );
}

function DocumentMoreMenu({
  doc,
  onReplace,
  onDelete
}: {
  doc: JobDocument;
  onReplace: (doc: JobDocument, file: File) => void;
  onDelete: (doc: JobDocument) => void;
}) {
  const { tx } = useHireLanguage();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 88;
    const openUp = window.innerHeight - rect.bottom < menuHeight + 8;
    setPos({
      top: openUp ? rect.top - menuHeight - 6 : rect.bottom + 6,
      left: Math.max(8, rect.right - 168)
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      const node = event.target as Node;
      if (triggerRef.current?.contains(node) || menuRef.current?.contains(node)) return;
      setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${tx('More actions')}: ${doc.name}`}
        onClick={() => setOpen((current) => !current)}
        className="grid size-10 place-items-center rounded-xl text-ink-500 hover:bg-muted"
      >
        <MoreHorizontal className="size-5" />
      </button>
      <input
        ref={inputRef}
        type="file" // guard-allow: replace one job seeker document from the row menu
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        aria-label={`${tx('Replace')}: ${doc.name}`}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onReplace(doc, file);
        }}
      />
      {open
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{ top: pos.top, left: pos.left }}
              className="fixed z-[80] w-[168px] rounded-2xl border border-line bg-surface p-1.5 shadow-loc"
            >
              <button
                type="button"
                role="menuitem"
                className="flex min-h-10 w-full items-center rounded-[10px] px-2.5 text-left text-sm font-bold text-ink-700 hover:bg-brand-50"
                onMouseDown={(event) => {
                  event.preventDefault();
                  setOpen(false);
                  inputRef.current?.click();
                }}
              >
                {tx('Replace')}
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex min-h-10 w-full items-center rounded-[10px] px-2.5 text-left text-sm font-bold text-danger-700 hover:bg-danger-50"
                onMouseDown={(event) => {
                  event.preventDefault();
                  setOpen(false);
                  onDelete(doc);
                }}
              >
                {tx('Delete')}
              </button>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
