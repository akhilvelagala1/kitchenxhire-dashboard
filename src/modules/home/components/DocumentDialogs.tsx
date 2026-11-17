import { ChevronDown } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { useHireLanguage } from '../hooks/useHireLanguage';
import {
  DOCUMENT_CATEGORY_OPTIONS,
  DOCUMENT_STATUS_LABEL,
  documentCategoryLabel,
  documentFileError,
  type DocumentCategory,
  type JobDocument
} from '../lib/jobDocuments';
import { HireMenu } from './HireMenu';

export function DocumentUploadDialog({
  open,
  onClose,
  onUpload
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, category: DocumentCategory) => void;
}) {
  const { tx } = useHireLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>('identity');
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const triggerId = useId();
  const selected =
    DOCUMENT_CATEGORY_OPTIONS.find((item) => item.value === category)?.label ?? 'Identity Proof';

  function save() {
    if (!file) {
      setError(tx('Choose a PDF or image.'));
      return;
    }
    const problem = documentFileError(file);
    if (problem) {
      setError(tx(problem));
      return;
    }
    onUpload(file, category);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={tx('Upload a document')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {tx('Cancel')}
          </Button>
          <Button onClick={save}>{tx('Save document')}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label={tx('Document file')} required error={error || undefined}>
          <input
            type="file" // guard-allow: job seeker document upload; shared Input is text only
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setError('');
            }}
          />
        </Field>
        <div className="flex flex-col gap-1">
          <span id={triggerId} className="text-sm font-medium text-ink">
            {tx('Document type')}
          </span>
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            aria-labelledby={triggerId}
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex min-h-11 items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-ink"
          >
            <span>{tx(selected)}</span>
            <ChevronDown className="size-4 text-ink-400" />
          </button>
          <HireMenu
            id={`${triggerId}-menu`}
            labelledBy={triggerId}
            open={menuOpen}
            value={category}
            options={DOCUMENT_CATEGORY_OPTIONS.map((item) => ({
              value: item.value,
              label: tx(item.label)
            }))}
            triggerRef={triggerRef}
            onChange={(next) => setCategory(next as DocumentCategory)}
            onClose={() => setMenuOpen(false)}
          />
        </div>
      </div>
    </Dialog>
  );
}

export function DocumentPreviewDialog({
  doc,
  imageUrl,
  onClose,
  onDownload
}: {
  doc: JobDocument | null;
  imageUrl: string;
  onClose: () => void;
  onDownload: (doc: JobDocument) => void;
}) {
  const { tx } = useHireLanguage();

  return (
    <Dialog
      open={doc !== null}
      onClose={onClose}
      title={tx('Document details')}
      footer={
        doc ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              {tx('Close')}
            </Button>
            <Button onClick={() => onDownload(doc)}>{tx('Download document')}</Button>
          </>
        ) : undefined
      }
    >
      {doc ? (
        <div className="flex flex-col gap-2 text-sm">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="max-h-40 w-full rounded-xl object-contain" />
          ) : null}
          <p className="font-extrabold text-ink">{doc.name}</p>
          <p className="text-ink-500">
            {tx(documentCategoryLabel(doc.category))} · {doc.sizeLabel}
          </p>
          <p className="text-ink-500">{doc.uploadedLabel}</p>
          <p className="font-semibold text-ink">{tx(DOCUMENT_STATUS_LABEL[doc.status])}</p>
          {doc.file ? null : <p className="text-ink-500">{tx('Sample file on this device.')}</p>}
        </div>
      ) : null}
    </Dialog>
  );
}
