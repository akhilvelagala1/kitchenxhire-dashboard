import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { RecruiterOrganizationForm } from '../components/RecruiterOrganizationForm';
import { RecruiterSetupInfoPanel } from '../components/RecruiterSetupInfoPanel';
import { RecruiterSetupLayout } from '../components/RecruiterSetupLayout';
import { normalizeRecruiterAccountId } from '../lib/recruiterAccount';
import {
  readRecruiterOrganisationRecord,
  writeRecruiterOrganisationDraft
} from '../lib/recruiterOrganisationStorage';
import { useRecruiterSession } from '../lib/recruiterSession';
import type { RecruiterOrganisationDraft } from '../schemas/recruiterOrganisation';

function RecruiterOrganizationPageContent({ accountId }: { accountId: string }) {
  const navigate = useNavigate();
  const initialRecord = useMemo(() => readRecruiterOrganisationRecord(accountId), [accountId]);
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

  function onCancel() {
    const dirty = Boolean(draft?.name?.trim() || draft?.addressLine1?.trim());
    if (dirty && !window.confirm('Leave without saving? Your draft is kept for next time.')) {
      return;
    }
    navigate('/recruiter');
  }

  function onSaved() {
    navigate('/recruiter', { replace: true });
  }

  return (
    <RecruiterSetupLayout
      mode="organization"
      sidebar={<RecruiterSetupInfoPanel variant="organization" />}
    >
      <RecruiterOrganizationForm
        accountId={accountId}
        initialDraft={draft}
        onCancel={onCancel}
        onSaved={onSaved}
        onDraftChange={onDraftChange}
      />
    </RecruiterSetupLayout>
  );
}

export function RecruiterOrganizationPage() {
  const { session } = useRecruiterSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const accountId = normalizeRecruiterAccountId(session.phone);

  return (
    <>
      <title>KitchenX Hiring | Organization Details</title>
      <RecruiterOrganizationPageContent key={accountId} accountId={accountId} />
    </>
  );
}
