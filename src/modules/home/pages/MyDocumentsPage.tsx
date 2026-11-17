import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DocumentPreviewDialog, DocumentUploadDialog } from '../components/DocumentDialogs';
import { DocumentSummaryCards } from '../components/DocumentSummaryCards';
import { DocumentsTable } from '../components/DocumentsTable';
import { secLead, secTitle } from '../components/styles';
import { useHireLanguage } from '../hooks/useHireLanguage';
import {
  createJobDocument,
  documentFileError,
  downloadJobDocument,
  filterJobDocuments,
  jobDocumentCounts,
  replaceJobDocument,
  seedJobDocuments,
  type DocumentCategory,
  type DocumentFilter,
  type JobDocument
} from '../lib/jobDocuments';

export function MyDocumentsPage() {
  const { tx } = useHireLanguage();
  const [documents, setDocuments] = useState(seedJobDocuments);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DocumentFilter>('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [preview, setPreview] = useState<JobDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [pendingDelete, setPendingDelete] = useState<JobDocument | null>(null);
  const [notice, setNotice] = useState('');
  const visible = filterJobDocuments(documents, query, category);
  const counts = jobDocumentCounts(documents);

  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setPreview(null);
  }

  function openPreview(doc: JobDocument) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const next =
      doc.file && (doc.kind === 'jpg' || doc.kind === 'png') ? URL.createObjectURL(doc.file) : '';
    setPreviewUrl(next);
    setPreview(doc);
  }

  function addDocument(file: File, nextCategory: DocumentCategory) {
    setDocuments((current) => [...current, createJobDocument(file, nextCategory)]);
    setNotice('');
    setUploadOpen(false);
  }

  function replaceDocument(doc: JobDocument, file: File) {
    const problem = documentFileError(file);
    if (problem) {
      setNotice(problem);
      return;
    }
    setDocuments((current) =>
      current.map((item) => (item.id === doc.id ? replaceJobDocument(item, file) : item))
    );
    setNotice('');
    if (preview?.id === doc.id) closePreview();
  }

  return (
    <>
      <title>{`KitchenX Hiring | ${tx('My Documents')}`}</title>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between">
          <div className="min-w-0">
            <h1 // guard-allow: job seeker documents heading matches the hire reference, not console PageHeader
              className={secTitle}
            >
              {tx('My Documents')}
            </h1>
            <p className={secLead}>
              {tx(
                'Upload and manage your important documents for faster job applications and verification.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setUploadKey((key) => key + 1);
              setUploadOpen(true);
            }}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-base font-semibold text-white shadow-btn-orange-slim hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <Plus className="size-4" />
            {tx('Upload Document')}
          </button>
        </div>
        {notice ? (
          <p role="alert" className="text-sm font-semibold text-danger-600">
            {tx(notice)}
          </p>
        ) : null}
        <DocumentSummaryCards
          total={counts.total}
          verified={counts.verified}
          underReview={counts.underReview}
          rejected={counts.rejected}
        />
        <DocumentsTable
          documents={visible}
          query={query}
          category={category}
          onQuery={setQuery}
          onCategory={setCategory}
          onPreview={openPreview}
          onDownload={downloadJobDocument}
          onReplace={replaceDocument}
          onDelete={setPendingDelete}
        />
      </div>
      <DocumentUploadDialog
        key={uploadKey}
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={addDocument}
      />
      <DocumentPreviewDialog
        doc={preview}
        imageUrl={previewUrl}
        onClose={closePreview}
        onDownload={downloadJobDocument}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        title={tx('Delete this document?')}
        message={
          pendingDelete
            ? `${pendingDelete.name}. ${tx('This removes the document from this browser.')}`
            : ''
        }
        confirmLabel={tx('Delete')}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          setDocuments((current) => current.filter((item) => item.id !== pendingDelete.id));
          if (preview?.id === pendingDelete.id) closePreview();
          setPendingDelete(null);
        }}
      />
    </>
  );
}
