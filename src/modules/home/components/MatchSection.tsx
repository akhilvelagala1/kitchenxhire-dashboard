import { cn } from '@/shared/lib/cn';
import { VALUE_CARDS } from '../content/sections';
import { useInView } from '../hooks/useInView';
import type { ValueCard } from '../schemas/home';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { kicker, pageWrap, secTitleLg } from './styles';

function ValueCardView({ item, index }: { item: ValueCard; index: number }) {
  const { tx } = useHireLanguage();
  const [ref, inView] = useInView<HTMLElement>('0px 0px -8% 0px', 0.16);

  return (
    <article
      ref={ref}
      className={cn(
        'group relative flex flex-col items-center overflow-hidden rounded-[22px] border-[1.5px] border-line/60 bg-surface px-3 pt-3.5 pb-[18px] text-center shadow-value after:absolute after:inset-x-[18px] after:bottom-0 after:h-[3px] after:origin-center after:scale-x-0 after:rounded-t-full after:bg-brand-600 after:transition-[scale] after:duration-[280ms] hover:-translate-y-1.5 hover:border-brand-600 hover:shadow-value-hover hover:after:scale-x-100',
        inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        'motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none'
      )}
      style={{
        transition:
          'translate 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease, opacity 0.75s ease',
        transitionDelay: inView ? `${index * 0.12}s` : undefined
      }}
    >
      <div className="h-[108px] w-full overflow-hidden rounded-2xl bg-canvas min-[768px]:h-32">
        <img
          src={item.image}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          className="size-full object-cover object-[center_22%] transition-transform duration-[450ms] group-hover:scale-105 motion-reduce:transition-none"
        />
      </div>
      <div
        aria-hidden="true"
        className="-mt-5 grid size-10 place-items-center rounded-full bg-brand-50 text-brand-600 shadow-[0_0_0_4px_var(--color-surface)]"
      >
        <item.icon className="size-4" />
      </div>
      <h3 className="mt-2.5 text-[15px] font-extrabold text-ink min-[768px]:text-base">
        {tx(item.title)}
      </h3>
      <p className="mt-1.5 text-xs leading-[1.45] font-medium text-ink-500 min-[768px]:text-[13px]">
        {tx(item.description)}
      </p>
    </article>
  );
}

export interface MatchSectionProps {
  cards?: ValueCard[];
}

export function MatchSection({ cards = VALUE_CARDS }: MatchSectionProps = {}) {
  const { tx } = useHireLanguage();

  return (
    <section id="match" className="scroll-mt-[84px] pt-10 pb-3">
      <div className={pageWrap}>
        <div className="text-center">
          <p className={kicker}>{tx('Make a smart hire')}</p>
          <h2 className={secTitleLg}>{tx('Make the right match.')}</h2>
          <div
            aria-hidden="true"
            className="mx-auto mt-3.5 h-[3px] w-[42px] rounded-full bg-brand-600"
          />
        </div>
        <div className="mt-7 grid gap-3 min-[768px]:mt-9 min-[768px]:grid-cols-3 min-[768px]:gap-4">
          {cards.map((item, index) => (
            <ValueCardView key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
