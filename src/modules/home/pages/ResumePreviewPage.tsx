import { useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { ResumePreviewActions } from '../components/ResumePreviewActions';
import { ResumePreviewChecklist } from '../components/ResumePreviewChecklist';
import { ResumePreviewDocument } from '../components/ResumePreviewDocument';
import { ResumePreviewShell } from '../components/ResumePreviewShell';
import { secLead, secTitle } from '../components/styles';
import {
  isResumeEducationComplete,
  isResumePersonalComplete,
  isResumeReadyForPreview,
  isResumeWorkComplete
} from '../lib/resumeCompletion';
import { downloadResumePdf } from '../lib/resumePdf';
import { useJobSeekerSession } from '../lib/jobSeekerSession';
import { readResumeDraft, writeResumeDraft } from '../lib/resumeDraftStorage';

export function ResumePreviewPage() {
  const navigate = useNavigate();
  const { session } = useJobSeekerSession();
  const phone = session?.phone ?? '';
  const draft = useMemo(() => readResumeDraft(phone), [phone]);

  if (!draft) {
    return <Navigate to="/user/resume" replace />;
  }

  const { values, meta, step } = draft;

  if (!isResumeReadyForPreview(values)) {
    return <Navigate to="/user/resume" replace />;
  }

  const completed = {
    1: isResumePersonalComplete(values),
    2: isResumeEducationComplete(values),
    3: isResumeWorkComplete(values)
  };

  function onReplace(file: File) {
    if (!window.confirm('Replace your uploaded resume file? Builder data stays until you edit.')) {
      return;
    }
    writeResumeDraft(
      {
        step,
        values,
        meta: { uploadedFileName: file.name, uploadedAt: new Date().toISOString() }
      },
      phone
    );
  }

  const header = (
    <>
      <Link to="/user/resume" className="text-[14px] font-extrabold text-brand-600 hover:underline">
        ← Back to Edit
      </Link>
      <h1 // guard-allow: job seeker resume preview matches prototype, not console PageHeader
        className={secTitle}
      >
        Resume Preview
      </h1>
      <p className={secLead}>Review your resume details. You can edit or download it anytime.</p>
      {meta.uploadedFileName ? (
        <p className="mt-2 text-[13px] font-semibold text-ink-600">
          On-file upload: <span className="font-bold text-ink">{meta.uploadedFileName}</span>
        </p>
      ) : null}
    </>
  );

  return (
    <>
      <title>KitchenX Hiring | Resume Preview</title>
      <ResumePreviewShell
        header={header}
        checklist={<ResumePreviewChecklist completed={completed} />}
        document={<ResumePreviewDocument values={values} />}
        actions={
          <ResumePreviewActions
            onDownload={() => {
              void downloadResumePdf(values).catch(() => {
                window.alert('Could not download the resume. Please try again.');
              });
            }}
            onEdit={() => navigate('/user/resume')}
            onReplace={onReplace}
          />
        }
      />
    </>
  );
}
