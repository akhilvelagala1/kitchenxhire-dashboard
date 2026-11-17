import { cn } from '@/shared/lib/cn';
import { BUSINESSES } from '../content/sections';
import { Reveal } from './Reveal';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { card, kicker, pageWrap, secLead, secTitle } from './styles';

export function BusinessesSection() {
  const { tx } = useHireLanguage();

  return (
    <section id="businesses" className="scroll-mt-[84px] pt-14 pb-10">
      <div className={pageWrap}>
        <p className={kicker}>{tx('Explore for every food business')}</p>
        <h2 className={secTitle}>{tx('Hiring for every food business.')}</h2>
        <p className={secLead}>
          {tx(
            'Find the right people for your restaurant, hotel, café, bakery, cloud kitchen, or catering business.'
          )}
        </p>
        <Reveal className="mt-[22px] grid grid-cols-2 items-stretch gap-2.5 min-[380px]:gap-3 min-[720px]:grid-cols-2 min-[720px]:gap-3.5 min-[900px]:grid-cols-3">
          {BUSINESSES.map((business) => (
            <article
              key={business.title}
              className={cn(
                card,
                'group flex h-full flex-col overflow-hidden border border-line/60 px-1.5 pt-1.5 pb-2.5 min-[380px]:px-2 min-[380px]:pt-2 min-[380px]:pb-3'
              )}
            >
              <div className="relative h-[96px] w-full overflow-hidden rounded-[10px] bg-muted min-[380px]:h-[110px] min-[440px]:h-[124px] min-[720px]:h-[148px] min-[720px]:rounded-xl min-[900px]:h-44">
                <img
                  src={business.image}
                  alt={business.alt}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover object-[center_32%] transition-transform duration-[350ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.045] motion-reduce:transition-none"
                />
              </div>
              <h3 className="mt-2 px-1 text-[13px] font-extrabold tracking-[-0.02em] text-ink min-[380px]:text-[14px] min-[720px]:mt-2.5 min-[720px]:text-[15px]">
                {tx(business.title)}
              </h3>
              <p className="mt-0.5 line-clamp-2 px-1 pb-0.5 text-[11px] leading-[1.35] font-medium text-ink-500 min-[380px]:mt-1 min-[380px]:text-[12px] min-[720px]:text-[13px] min-[720px]:leading-[1.45]">
                {tx(business.description)}
              </p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
