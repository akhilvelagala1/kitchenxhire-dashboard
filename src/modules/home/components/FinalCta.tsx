import { ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import heroImage from '../assets/hire-hero.webp';
import { useHomeState } from '../hooks/useHomeState';
import { Reveal } from './Reveal';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { homeButton, kicker, pageWrap } from './styles';

export function FinalCta() {
  const { tx } = useHireLanguage();
  const { setFlow } = useHomeState();

  return (
    <section id="final-cta" aria-labelledby="final-cta-heading" className="pt-[26px] pb-1">
      <div className={pageWrap}>
        <Reveal
          className={cn(
            'grid overflow-hidden rounded-[28px] border border-brand-200/50 bg-closer min-[768px]:min-h-[300px] min-[768px]:grid-cols-[minmax(330px,1.15fr)_minmax(0,1fr)] min-[768px]:items-center'
          )}
        >
          <div className="px-5 py-6 min-[768px]:px-7 min-[768px]:py-6 min-[900px]:px-8 min-[900px]:py-7">
            <p className={kicker}>{tx('Grow your food business')}</p>
            <h2
              id="final-cta-heading"
              className="mt-2 text-[28px] leading-[1.05] font-extrabold tracking-[-0.04em] text-ink min-[768px]:text-[30px] min-[900px]:text-[34px]"
            >
              {tx('Build your team.')}
              <br />
              {tx('Build your future.')}
            </h2>
            <p className="mt-3 max-w-[420px] text-base leading-[1.5] font-medium text-ink-600">
              {tx(
                'Find skilled kitchen staff, from chefs to helpers, and keep your food business running smoothly.'
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#how"
                onClick={() => setFlow('employer')}
                className={cn(
                  homeButton('orange-base'),
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30'
                )}
              >
                {tx('Hire Staff')}
                <ArrowRight aria-hidden="true" className="size-4 stroke-[2.6]" />
              </a>
              <a
                href="#jobs"
                className={cn(
                  homeButton('white-base'),
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30'
                )}
              >
                {tx('Find a Job')}
              </a>
            </div>
          </div>
          <div className="relative min-h-[240px] min-[768px]:min-h-[300px]">
            <img
              src={heroImage}
              alt={tx('KitchenX kitchen team')}
              loading="lazy"
              decoding="async"
              className="size-full object-cover object-[center_22%] min-[768px]:absolute min-[768px]:inset-0 min-[768px]:fade-left-hero min-[768px]:object-[50%_16%]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
