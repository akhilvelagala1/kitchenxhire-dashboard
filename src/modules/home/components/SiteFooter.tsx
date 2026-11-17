import { cn } from '@/shared/lib/cn';
import { FOOTER_COLUMNS, SOCIAL_LINKS } from '../content/nav';
import { useHomeState } from '../hooks/useHomeState';
import { BrandMark } from './BrandMark';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { pageWrap } from './styles';

export function SiteFooter() {
  const { tx } = useHireLanguage();
  const { setFlow } = useHomeState();

  return (
    <footer aria-label={tx('Site footer')} className="bg-ink text-white">
      <div
        className={cn(
          pageWrap,
          'grid gap-8 py-10 min-[900px]:grid-cols-2 min-[1200px]:grid-cols-[1.2fr_2fr]'
        )}
      >
        <div>
          <a
            href="#top"
            aria-label={tx('KitchenX Hiring')}
            className="flex flex-none items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <BrandMark size="footer" dark />
          </a>
          <p className="mt-3 text-sm font-semibold text-white/70">
            {tx('For every food business.')}
          </p>
          <div className="mt-5 flex gap-3">
            {SOCIAL_LINKS.map(({ label, Icon }) => (
              <a
                key={label}
                href="#top"
                aria-label={`KitchenX on ${label}`}
                className="grid size-9 place-items-center rounded-full border border-white/[.16] text-white/75 transition-all duration-150 hover:border-white/40 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 min-[768px]:grid-cols-3 min-[1100px]:grid-cols-5">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-extrabold tracking-tight text-white">
                {tx(column.title)}
              </h3>
              <div className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <a
                    key={link.label}
                    href={`#${link.target}`}
                    onClick={link.flow ? () => setFlow(link.flow!) : undefined}
                    className="block rounded-sm text-[14px] font-medium text-white/[.62] transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-400"
                  >
                    {tx(link.label)}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div
          className={cn(
            pageWrap,
            'flex flex-col gap-2 py-5 text-xs font-semibold text-white/50 sm:flex-row sm:items-center sm:justify-between'
          )}
        >
          <p>{tx('© 2026 KitchenX Hiring. All rights reserved.')}</p>
          <p>{tx("A part of KitchenX. For India's food businesses.")}</p>
        </div>
      </div>
    </footer>
  );
}
