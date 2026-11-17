import { BadgeCheck, Clock, IndianRupee, Scale, ShieldCheck } from 'lucide-react';
import { TRUST_ITEMS } from '../content/filterOptions';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { pageWrap } from './styles';

const TRUST_ICONS = [ShieldCheck, BadgeCheck, IndianRupee, Clock, Scale] as const;

export function FindJobsTrustBand() {
  const { tx } = useHireLanguage();

  return (
    <section className="mt-10 border-t border-brand-100 bg-[#fff7f2] py-8">
      <div className={pageWrap}>
        <ul className="grid gap-8 min-[640px]:grid-cols-2 min-[1024px]:grid-cols-5 min-[1024px]:gap-4">
          {TRUST_ITEMS.map((item, index) => {
            const Icon = TRUST_ICONS[index] ?? ShieldCheck;
            return (
              <li
                key={item.title}
                className="flex flex-col items-center text-center min-[1024px]:items-start min-[1024px]:border-r min-[1024px]:border-brand-200/80 min-[1024px]:pr-4 min-[1024px]:text-left last:min-[1024px]:border-r-0"
              >
                <div className="grid size-11 place-items-center rounded-full border-2 border-brand-600/35 text-brand-600">
                  <Icon className="size-5" strokeWidth={2.2} />
                </div>
                <h3 className="mt-2.5 text-[13px] font-extrabold text-ink">{tx(item.title)}</h3>
                <p className="mt-1 max-w-[220px] text-[12.5px] leading-snug font-medium text-ink-500">
                  {tx(item.description)}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
