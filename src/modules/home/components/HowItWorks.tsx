import { Briefcase, UserRound } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { cn } from '@/shared/lib/cn';
import { EMPLOYER_STEPS, SEEKER_STEPS } from '../content/sections';
import { useHomeState } from '../hooks/useHomeState';
import { useInView } from '../hooks/useInView';
import type { FlowKey, Step } from '../schemas/home';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { kickerLg, pageWrap, secTitleXl } from './styles';

const tabClass =
  'inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-full text-sm font-extrabold transition-colors duration-[180ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30';

function StepList({ id, steps, live }: { id: string; steps: Step[]; live: boolean }) {
  const { tx } = useHireLanguage();
  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={id === 'flowSeeker' ? 'tabSeeker' : 'tabEmployer'}
      className="relative mt-8 grid animate-panel-in grid-cols-2 gap-x-4 gap-y-7 steps-rail min-[768px]:mt-10 min-[768px]:grid-cols-4 min-[768px]:gap-3.5 min-[900px]:mt-12 min-[1024px]:gap-5 motion-reduce:animate-none"
    >
      {steps.map((step, index) => (
        <article
          key={step.title}
          className={cn(
            'group relative z-[1] text-center transition-[opacity,translate] duration-500',
            live ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            'motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none'
          )}
          style={{ transitionDelay: `${index * 90}ms` }}
        >
          {(index === 0 || index === 2) && (
            <span aria-hidden="true" className="step-connector-mobile" />
          )}
          <div className="relative z-[1] mx-auto mb-[18px] size-[132px] min-[768px]:size-[128px] min-[900px]:size-[142px] min-[1024px]:size-[156px]">
            <img
              src={step.image}
              alt={step.alt}
              loading="lazy"
              decoding="async"
              className="block size-full rounded-full bg-surface object-cover shadow-step transition-[scale,box-shadow] duration-[400ms] group-hover:scale-[1.08] group-hover:shadow-step-hover motion-reduce:transition-none"
            />
            <span className="absolute bottom-0 left-1/2 z-[2] grid size-8 -translate-x-1/2 translate-y-1/2 place-items-center rounded-full border-[3px] border-surface bg-brand-600 text-sm leading-none font-extrabold text-white transition-[opacity,scale] duration-300 group-hover:scale-[0.4] group-hover:opacity-0 motion-reduce:transition-none">
              {index + 1}
            </span>
          </div>
          <h3 className="mt-1 text-base font-extrabold text-ink">{tx(step.title)}</h3>
          <p className="mx-auto mt-1.5 max-w-[200px] text-[13px] leading-[1.45] font-medium text-ink-500">
            {tx(step.description)}
          </p>
        </article>
      ))}
    </div>
  );
}

export interface HowItWorksProps {
  seekerSteps?: Step[];
  employerSteps?: Step[];
}

export function HowItWorks({
  seekerSteps = SEEKER_STEPS,
  employerSteps = EMPLOYER_STEPS
}: HowItWorksProps = {}) {
  const { tx } = useHireLanguage();
  const { flow, setFlow } = useHomeState();
  const [sectionRef, seen] = useInView<HTMLDivElement>('0px', 0.2);
  const [switched, setSwitched] = useState(false);
  const live = seen || switched;

  function choose(next: FlowKey) {
    setFlow(next);
    setSwitched(true);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      choose('employer');
      document.getElementById('tabEmployer')?.focus();
    } else if (event.key === 'ArrowLeft') {
      choose('seeker');
      document.getElementById('tabSeeker')?.focus();
    }
  }

  const seeker = flow === 'seeker';

  return (
    <section id="how" className="scroll-mt-[84px] pt-12 pb-9">
      <div ref={sectionRef} className={pageWrap}>
        <p className={cn(kickerLg, 'text-center')}>{tx('A simple way to hire or get hired')}</p>
        <h2 className={cn(secTitleXl, 'text-center')}>{tx('How KitchenX Hiring works.')}</h2>
        <div
          role="tablist"
          aria-label={tx('Who is hiring')}
          onKeyDown={onKeyDown}
          className="mx-auto mt-[22px] flex w-[min(420px,100%)] gap-1 rounded-full border border-line bg-surface p-1"
        >
          <button
            type="button"
            role="tab"
            id="tabSeeker"
            tabIndex={seeker ? 0 : -1}
            aria-selected={seeker}
            aria-controls="flowSeeker"
            onClick={() => choose('seeker')}
            className={cn(
              tabClass,
              seeker
                ? 'border-[1.5px] border-brand-600 bg-brand-600/10 text-brand-600'
                : 'text-ink-500'
            )}
          >
            <UserRound className="size-4" />
            {tx('For Job Seekers')}
          </button>
          <button
            type="button"
            role="tab"
            id="tabEmployer"
            tabIndex={seeker ? -1 : 0}
            aria-selected={!seeker}
            aria-controls="flowEmployer"
            onClick={() => choose('employer')}
            className={cn(
              tabClass,
              seeker
                ? 'text-ink-500'
                : 'border-[1.5px] border-brand-600 bg-brand-600/10 text-brand-600'
            )}
          >
            <Briefcase className="size-4" />
            {tx('For Employers')}
          </button>
        </div>
        {seeker ? (
          <StepList id="flowSeeker" steps={seekerSteps} live={live} />
        ) : (
          <StepList id="flowEmployer" steps={employerSteps} live={live} />
        )}
      </div>
    </section>
  );
}
