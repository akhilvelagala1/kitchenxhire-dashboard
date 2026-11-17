import { useState } from 'react';
import { Navigate } from 'react-router';
import { RecruiterAccountSettingsNotificationsPanel } from '../components/RecruiterAccountSettingsNotificationsPanel';
import { RecruiterAccountSettingsOrganisationPanel } from '../components/RecruiterAccountSettingsOrganisationPanel';
import { RecruiterAccountSettingsPersonalPanel } from '../components/RecruiterAccountSettingsPersonalPanel';
import { RecruiterAccountSettingsSecurityPanel } from '../components/RecruiterAccountSettingsSecurityPanel';
import {
  RecruiterAccountSettingsSidebar,
  type RecruiterAccountSettingsTab
} from '../components/RecruiterAccountSettingsSidebar';
import { pageWrap, secLead, secTitle } from '../components/styles';
import { normalizeRecruiterAccountId } from '../lib/recruiterAccount';
import { recruiterInitials, useRecruiterProfile } from '../lib/recruiterOnboarding';
import { useRecruiterSession } from '../lib/recruiterSession';

function RecruiterAccountSettingsPageContent({
  accountId,
  phone
}: {
  accountId: string;
  phone: string;
}) {
  const [tab, setTab] = useState<RecruiterAccountSettingsTab>('personal');
  const profile = useRecruiterProfile(phone);
  const displayName = profile?.fullName ?? 'Recruiter';
  const initials = profile ? recruiterInitials(profile.fullName) : 'R';

  return (
    <main id="main" className={`${pageWrap} pb-10 pt-4 min-[900px]:pt-5`}>
      <div>
        <h1 // guard-allow: recruiter account settings matches the hire prototype, not console PageHeader
          className={secTitle}
        >
          Account Settings
        </h1>
        <p className={secLead}>
          Manage your personal, organisation, security and notification preferences.
        </p>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 min-[1280px]:grid-cols-[280px_minmax(0,1fr)] min-[1280px]:items-stretch min-[1280px]:gap-6">
        <div className="min-w-0">
          <RecruiterAccountSettingsSidebar
            active={tab}
            onSelect={setTab}
            displayName={displayName}
            initials={initials}
          />
        </div>
        <div className="min-w-0" role="tabpanel">
          {tab === 'personal' && (
            <RecruiterAccountSettingsPersonalPanel accountId={accountId} phone={phone} />
          )}
          {tab === 'organisation' && (
            <RecruiterAccountSettingsOrganisationPanel accountId={accountId} />
          )}
          {tab === 'security' && <RecruiterAccountSettingsSecurityPanel accountId={accountId} />}
          {tab === 'notifications' && (
            <RecruiterAccountSettingsNotificationsPanel accountId={accountId} />
          )}
        </div>
      </div>
    </main>
  );
}

export function RecruiterAccountSettingsPage() {
  const { session } = useRecruiterSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const accountId = normalizeRecruiterAccountId(session.phone);

  return (
    <>
      <title>KitchenX Hiring | Recruiter Account Settings</title>
      <RecruiterAccountSettingsPageContent
        key={accountId}
        accountId={accountId}
        phone={session.phone}
      />
    </>
  );
}
