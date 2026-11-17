import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { MORE_ROLES, ROLES } from '../content/roles';
import { Reveal } from './Reveal';
import { RoleCard } from './RoleCard';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { kickerLg, pageWrap, secTitleLg } from './styles';

const gridClass =
  'grid items-stretch gap-3 min-[720px]:grid-cols-2 min-[720px]:gap-x-3.5 min-[1024px]:grid-cols-3 min-[1024px]:gap-x-4 min-[1024px]:gap-y-3';

interface RolesSectionProps {
  activeRole: string | null;
  onPick: (query: string) => void;
}

export function RolesSection({ activeRole, onPick }: RolesSectionProps) {
  const { tx } = useHireLanguage();
  const [showMore, setShowMore] = useState(false);

  return (
    <section id="roles" className="scroll-mt-[84px] pt-[26px] pb-1">
      <div className={pageWrap}>
        <p className={kickerLg}>{tx('Explore opportunities')}</p>
        <h2 className={cn(secTitleLg, 'max-w-xl')}>{tx('Find work that fits your skills.')}</h2>
        <Reveal className={cn(gridClass, 'mt-5')}>
          {ROLES.map((role, index) => {
            const visibilityClass = !showMore
              ? index >= 5
                ? 'hidden min-[1024px]:flex'
                : index >= 3
                  ? 'hidden min-[720px]:flex'
                  : undefined
              : undefined;

            return (
              <RoleCard
                key={role.query}
                role={role}
                active={activeRole === role.query}
                slideArrow
                className={visibilityClass}
                onPick={onPick}
              />
            );
          })}
          {!showMore ? (
            <button
              type="button"
              aria-expanded={false}
              aria-controls="moreRoles"
              onClick={() => setShowMore(true)}
              className="flex h-full min-h-[100px] w-full items-center justify-center gap-2 rounded-[20px] border border-brand-200 bg-brand-25 px-4 py-3 text-sm leading-[21px] font-extrabold text-brand-600 transition-[translate,box-shadow,gap] duration-[180ms] hover:-translate-y-0.5 hover:gap-3 hover:shadow-role-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
            >
              {tx('View all roles')}
              <ArrowRight className="size-[18px] stroke-[2.2]" />
            </button>
          ) : null}
          <div id="moreRoles" hidden={!showMore} className={showMore ? 'contents' : 'hidden'}>
            {MORE_ROLES.map((role) => (
              <RoleCard
                key={role.query}
                role={role}
                active={activeRole === role.query}
                slideArrow
                onPick={onPick}
              />
            ))}
          </div>
          {showMore ? (
            <button
              type="button"
              aria-expanded={true}
              aria-controls="moreRoles"
              onClick={() => setShowMore(false)}
              className="flex h-full min-h-[100px] w-full items-center justify-center gap-2 rounded-[20px] border border-brand-200 bg-brand-25 px-4 py-3 text-sm leading-[21px] font-extrabold text-brand-600 transition-[translate,box-shadow,gap] duration-[180ms] hover:-translate-y-0.5 hover:gap-3 hover:shadow-role-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 min-[720px]:col-span-2 min-[1024px]:col-span-1"
            >
              {tx('Show fewer roles')}
              <ArrowRight className="size-[18px] stroke-[2.2]" />
            </button>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
