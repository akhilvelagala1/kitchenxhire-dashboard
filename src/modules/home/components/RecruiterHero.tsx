import heroImage from '../assets/hire-hero-home.webp';
import { cn } from '@/shared/lib/cn';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { HeroBannerShell } from './HeroBannerShell';
import { kicker } from './styles';

const rise = 'animate-rise-in motion-reduce:animate-none';

/**
 * Recruiter hero — the public homepage banner with recruiter copy, so both
 * surfaces read as one product. Same asset, geometry and crop as HeroSection.
 */
export function RecruiterHero() {
  const { tx } = useHireLanguage();

  return (
    <HeroBannerShell
      image={heroImage}
      imageAlt={tx('Kitchen team ready to hire')}
      className="max-w-[560px] px-6 pt-8 pb-6 min-[768px]:px-10 min-[768px]:pt-10 min-[768px]:pb-[88px] min-[1024px]:px-[52px] min-[1024px]:pt-12 min-[1024px]:pb-[60px] min-[1200px]:max-w-[624px]"
    >
      <p className={cn(kicker, 'eyebrow-shine')}>
        {tx('Hire for your kitchen & hospitality team')}
      </p>
      <h1 // guard-allow: recruiter dashboard hero headline
        className={cn(
          rise,
          'mt-2 text-[length:clamp(28px,8vw,32px)] leading-[1.08] font-extrabold tracking-[-0.03em] min-[768px]:text-[34px] min-[880px]:text-[40px] min-[1024px]:text-[length:clamp(36px,4.6vw,46px)] min-[1200px]:text-[58px]'
        )}
        style={{ animationDelay: '0.05s' }}
      >
        {tx('Hire the right people for your ')}
        <span className="text-brand-600">{tx('kitchen.')}</span>
      </h1>
      <p
        className={cn(
          rise,
          'mt-3 max-w-[340px] text-[15px] leading-[1.55] font-medium text-ink-600 min-[768px]:text-[15.5px] min-[900px]:max-w-[420px] min-[1024px]:text-[17px] min-[1200px]:max-w-[520px] min-[1200px]:text-lg'
        )}
        style={{ animationDelay: '0.1s' }}
      >
        {tx('Post jobs, review applications and build a reliable team.')}
      </p>
    </HeroBannerShell>
  );
}
