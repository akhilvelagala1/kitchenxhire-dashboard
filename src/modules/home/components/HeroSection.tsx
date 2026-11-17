import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import heroImage from '../assets/hire-hero-home.webp';
import { HERO_TICKS } from '../content/sections';
import { useHomeState } from '../hooks/useHomeState';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { HeroBannerShell } from './HeroBannerShell';
import { homeButton, kicker } from './styles';

const rise = 'animate-rise-in motion-reduce:animate-none';

export function HeroSection() {
  const { tx } = useHireLanguage();
  const { setFlow } = useHomeState();

  return (
    <HeroBannerShell
      image={heroImage}
      imageAlt="KitchenX kitchen team"
      className="max-w-[560px] px-6 pt-8 pb-6 min-[768px]:px-10 min-[768px]:pt-10 min-[768px]:pb-[88px] min-[1024px]:px-[52px] min-[1024px]:pt-12 min-[1024px]:pb-[60px] min-[1200px]:max-w-[624px]"
    >
      <p className={cn(kicker, 'eyebrow-shine')}>{tx("Built for India's food industry")}</p>
      <h1 // guard-allow: the public homepage owns its headline; PageHeader is for console pages
        className={cn(
          rise,
          'mt-2 text-[length:clamp(28px,8vw,32px)] leading-[1.08] font-extrabold tracking-[-0.03em] min-[768px]:text-[34px] min-[880px]:text-[40px] min-[1024px]:text-[length:clamp(36px,4.6vw,46px)] min-[1200px]:text-[58px]'
        )}
        style={{ animationDelay: '0.05s' }}
      >
        {tx('Good people.')}
        <br />
        <span className="text-brand-600">{tx('Stronger kitchens.')}</span>
      </h1>
      <p
        className={cn(
          rise,
          'mt-3 max-w-[340px] text-[15px] leading-[1.55] font-medium text-ink-600 min-[768px]:text-[15.5px] min-[900px]:max-w-[420px] min-[1024px]:text-[17px] min-[1200px]:max-w-[520px] min-[1200px]:text-lg'
        )}
        style={{ animationDelay: '0.1s' }}
      >
        {tx(
          'Find reliable kitchen and hospitality staff — or discover your next shift with a team that values your skills.'
        )}
      </p>
      <div className={cn(rise, 'mt-4 flex flex-wrap gap-2.5')} style={{ animationDelay: '0.15s' }}>
        <a href="#how" onClick={() => setFlow('employer')} className={homeButton('orange-base')}>
          {tx('Hire Staff')}
          <ArrowRight className="size-4 stroke-[2.6]" />
        </a>
        <a href="#jobs" className={homeButton('white-base')}>
          {tx('Find a Job')}
        </a>
      </div>
      <div
        className={cn(
          rise,
          'mt-3.5 flex flex-wrap gap-x-3.5 gap-y-1.5 text-[12px] font-bold text-ink-700 min-[768px]:gap-x-3 min-[768px]:gap-y-1 min-[768px]:text-[12px] min-[1024px]:flex-nowrap min-[1024px]:gap-x-4 min-[1024px]:gap-y-2 min-[1024px]:text-[13px]'
        )}
        style={{ animationDelay: '0.2s' }}
      >
        {HERO_TICKS.map((tick) => (
          <span key={tick} className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="grid size-4 flex-none place-items-center rounded-full bg-brand-50 text-brand-600">
              <Check className="size-3 stroke-3" />
            </span>
            {tx(tick)}
          </span>
        ))}
      </div>
    </HeroBannerShell>
  );
}
