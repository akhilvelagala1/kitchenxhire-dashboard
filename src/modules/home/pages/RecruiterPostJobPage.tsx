import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { RecruiterOrganizationForm } from '../components/RecruiterOrganizationForm';
import { RecruiterPostJobForm } from '../components/RecruiterPostJobForm';
import { RecruiterSetupInfoPanel } from '../components/RecruiterSetupInfoPanel';
import { RecruiterSetupLayout } from '../components/RecruiterSetupLayout';
import { normalizeRecruiterAccountId } from '../lib/recruiterAccount';
import { isRecruiterOrgSetupComplete } from '../lib/recruiterOrgSetup';
import {
  readRecruiterOrganisationRecord,
  writeRecruiterOrganisationDraft
} from '../lib/recruiterOrganisationStorage';
import { useRecruiterSession } from '../lib/recruiterSession';
import type { RecruiterOrganisationDraft } from '../schemas/recruiterOrganisation';

function RecruiterPostJobPageContent({ accountId }: { accountId: string }) {
  const navigate = useNavigate();
  const initialRecord = useMemo(() => readRecruiterOrganisationRecord(accountId), [accountId]);
  const [orgComplete, setOrgComplete] = useState(() => isRecruiterOrgSetupComplete(accountId));
  const [draft, setDraft] = useState<RecruiterOrganisationDraft | undefined>(
    () =>
      initialRecord.draft ?? (initialRecord.organisation ? initialRecord.organisation : undefined)
  );

  const onDraftChange = useCallback(
    (next: RecruiterOrganisationDraft) => {
      setDraft(next);
      writeRecruiterOrganisationDraft(accountId, next);
    },
    [accountId]
  );

  function onOrgCancel() {
    const dirty = Boolean(draft?.name?.trim() || draft?.addressLine1?.trim());
    if (dirty && !window.confirm('Leave without saving? Your draft is kept for next time.')) {
      return;
    }
    navigate('/recruiter');
  }

  function onOrgSaved() {
    setOrgComplete(true);
  }

  return (
    <RecruiterSetupLayout
      mode={orgComplete ? 'post-job' : 'organization'}
      sidebar={<RecruiterSetupInfoPanel variant={orgComplete ? 'post-job' : 'organization'} />}
    >
      {orgComplete ? (
        <RecruiterPostJobForm accountId={accountId} />
      ) : (
        <RecruiterOrganizationForm
          accountId={accountId}
          initialDraft={draft}
          onCancel={onOrgCancel}
          onSaved={onOrgSaved}
          onDraftChange={onDraftChange}
        />
      )}
    </RecruiterSetupLayout>
  );
}

export function RecruiterPostJobPage() {
  const { session } = useRecruiterSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const accountId = normalizeRecruiterAccountId(session.phone);

  return (
    <>
      <title>KitchenX Hiring | Post a Job</title>
      <RecruiterPostJobPageContent key={accountId} accountId={accountId} />
    </>
  );
}
