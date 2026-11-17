import { useState } from 'react';
import heroImage from '../assets/hire-hero.webp';
import { JobSearchBar } from './JobSearchBar';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { kicker, pageWrap } from './styles';
import { cn } from '@/shared/lib/cn';

interface FindJobsHeroProps {
  initialRole: string;
  initialCity: string;
  onSearch: (role: string, city: string) => void;
}

export function FindJobsHero({ initialRole, initialCity, onSearch }: FindJobsHeroProps) {
  const { tx } = useHireLanguage();
  const [role, setRole] = useState(initialRole);
  const [city, setCity] = useState(initialCity);

  return (
    <>
      <section className="relative overflow-hidden bg-hero">
        <div
          className={cn(
            pageWrap,
            'relative min-[900px]:grid min-[900px]:min-h-0 min-[900px]:min-w-0 min-[900px]:grid-cols-[minmax(280px,520px)_minmax(0,1fr)] min-[900px]:items-end'
          )}
        >
          <div className="relative z-[2] max-w-[540px] pt-[18px] pb-1.5 min-[900px]:max-w-none min-[900px]:pt-7 min-[900px]:pb-[72px]">
            <p className={cn(kicker, 'eyebrow-shine')}>{tx("Built for India's food industry")}</p>
            <h1 // guard-allow: public find-jobs hero owns its headline
              className="mt-2 text-[length:clamp(28px,8vw,32px)] leading-[1.08] font-extrabold tracking-[-0.03em] min-[768px]:text-[length:clamp(36px,4.6vw,46px)] min-[1200px]:text-[58px]"
            >
              {tx('Find kitchen and hospitality jobs ')}
              <span className="text-brand-600">{tx('near you.')}</span>
            </h1>
            <p className="mt-3 max-w-[340px] text-[15px] leading-[1.55] font-medium text-ink-600 min-[768px]:text-base min-[900px]:max-w-[420px] min-[1024px]:text-[17px]">
              {tx('Cook, kitchen helper, waiter, bakery staff and more.')}
            </p>
          </div>
          <div className="relative z-0 mt-2 mb-1 h-[210px] overflow-hidden rounded-[18px] min-[900px]:m-0 min-[900px]:-ml-[6%] min-[900px]:h-[400px] min-[900px]:rounded-none">
            <img
              src={heroImage}
              alt={tx('KitchenX kitchen team')}
              className="size-full animate-hero-in object-cover object-[center_22%] motion-reduce:animate-none min-[900px]:fade-left-hero min-[900px]:object-[50%_16%]"
            />
          </div>
        </div>
      </section>
      <JobSearchBar
        role={role}
        city={city}
        onRole={setRole}
        onCity={setCity}
        onSubmit={() => onSearch(role, city)}
        submitLabel={tx('Search')}
        rolePlaceholder={tx('Search job title (e.g., Cook, Kitchen Helper)')}
      />
    </>
  );
}
