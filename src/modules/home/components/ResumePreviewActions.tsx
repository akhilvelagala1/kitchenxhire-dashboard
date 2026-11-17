import { Download, FileUp, Pencil } from 'lucide-react';
import { homeButton } from './styles';

interface ResumePreviewActionsProps {
  onDownload: () => void;
  onEdit: () => void;
  onReplace: (file: File) => void;
}

export function ResumePreviewActions({ onDownload, onEdit, onReplace }: ResumePreviewActionsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-line bg-surface p-4 shadow-card">
      <button type="button" onClick={onDownload} className={homeButton('orange-block') + ' gap-2'}>
        <Download className="size-4" aria-hidden="true" />
        Download Resume (PDF)
      </button>
      <button type="button" onClick={onEdit} className={homeButton('white-slim') + ' w-full gap-2'}>
        <Pencil className="size-4 text-brand-600" aria-hidden="true" />
        Edit Resume
      </button>
      <label className={homeButton('white-slim') + ' w-full cursor-pointer gap-2'}>
        <FileUp className="size-4 text-brand-600" aria-hidden="true" />
        Replace with Another
        <input
          type="file" // guard-allow: job seeker replace-resume upload matches prototype, not BulkImportDialog
          accept=".pdf,.doc,.docx,application/pdf"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onReplace(file);
            event.target.value = '';
          }}
        />
      </label>
    </div>
  );
}
