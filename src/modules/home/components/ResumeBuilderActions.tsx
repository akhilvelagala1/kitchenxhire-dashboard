import { FileUp, FilePlus2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { homeButton } from './styles';

interface ResumeBuilderActionsProps {
  onCreateNew: () => void;
  onUpload: (file: File) => void;
  className?: string;
}

export function ResumeBuilderActions({
  onCreateNew,
  onUpload,
  className
}: ResumeBuilderActionsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2 min-[640px]:gap-2.5', className)}>
      <button
        type="button"
        onClick={onCreateNew}
        className={
          homeButton('white-slim') +
          ' gap-2 border-brand-600/40 text-brand-600 hover:border-brand-600 hover:bg-brand-50'
        }
      >
        <FilePlus2 className="size-4" aria-hidden="true" />
        Create New Resume
      </button>
      <label className={homeButton('white-slim') + ' cursor-pointer gap-2'}>
        <FileUp className="size-4" aria-hidden="true" />
        Upload Existing Resume
        <input
          type="file" // guard-allow: job seeker resume upload matches prototype file picker, not BulkImportDialog
          accept=".pdf,.doc,.docx,application/pdf"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.target.value = '';
          }}
        />
      </label>
    </div>
  );
}
