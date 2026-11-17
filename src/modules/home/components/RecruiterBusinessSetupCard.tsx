import { ArrowRight, Store } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { RECRUITER_BUSINESS_TYPES } from '../content/recruiterOrgFormOptions';
import { normalizeRecruiterAccountId } from '../lib/recruiterAccount';
import {
  getCompletedRecruiterOrganisation,
  isRecruiterOrgSetupComplete
} from '../lib/recruiterOrgSetup';
import { useRecruiterSession } from '../lib/recruiterSession';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { homeButton, pageWrap } from './styles';

function businessTypeLabel(value: string): string {
  return RECRUITER_BUSINESS_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function RecruiterBusinessSetupCard() {
  const { tx } = useHireLanguage();
  const { session } = useRecruiterSession();
  const accountId = session ? normalizeRecruiterAccountId(session.phone) : '';
  const complete = accountId ? isRecruiterOrgSetupComplete(accountId) : false;
  const organisation = accountId ? getCompletedRecruiterOrganisation(accountId) : null;

  return (
    <div className={cn(pageWrap, 'relative z-20 -mt-8 min-[900px]:-mt-12')}>
      <div className="rounded-[18px] border border-line bg-surface shadow-card">
        {complete && organisation ? (
          <div className="flex flex-col gap-4 p-4 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between min-[900px]:px-6 min-[900px]:py-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-11 flex-none place-items-center rounded-xl bg-brand-50 text-brand-600">
                {organisation.logoDataUrl ? (
                  <img
                    src={organisation.logoDataUrl}
                    alt=""
                    className="size-11 rounded-xl object-cover"
                  />
                ) : (
                  <Store className="size-5 stroke-[2]" />
                )}
              </span>
              <div>
                <p className="text-[16px] font-extrabold text-ink">{organisation.name}</p>
                <p className="text-[13px] font-medium text-ink-500">
                  {businessTypeLabel(organisation.businessType)} · {organisation.city},{' '}
                  {organisation.state}
                </p>
              </div>
            </div>
            <Link to="/recruiter/organization" className={homeButton('white-slim')}>
              {tx('Edit organisation')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between min-[900px]:px-6 min-[900px]:py-5">
            <div className="flex items-start gap-3">
              <span className="grid size-11 flex-none place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Store className="size-5 stroke-[2]" />
              </span>
              <div>
                <p className="text-[16px] font-extrabold text-ink">{tx('Set up your business')}</p>
                <p className="mt-0.5 text-[13px] font-medium text-ink-500">
                  {tx('Add organisation details before you post a job.')}
                </p>
              </div>
            </div>
            <Link
              to="/recruiter/organization"
              className={cn(homeButton('orange-slim'), 'min-h-11 px-5')}
            >
              {tx('Complete setup')}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
