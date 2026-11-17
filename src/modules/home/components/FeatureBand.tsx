import { Fragment } from 'react';
import { FEATURES } from '../content/sections';
import { useHireLanguage } from '../hooks/useHireLanguage';

export function FeatureBand() {
  const { tx } = useHireLanguage();

  return (
    <section aria-label={tx('Key features')} className="pt-3 pb-2 min-[768px]:pt-[18px]">
      <div className="w-full px-4 min-[1024px]:px-9">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4 rounded-[22px] border border-line/60 bg-surface px-2.5 py-4 shadow-panel min-[768px]:grid-cols-4 min-[768px]:gap-x-0 min-[768px]:gap-y-0 min-[768px]:rounded-[28px] min-[768px]:px-1.5 min-[768px]:pt-3 min-[768px]:pb-2">
          {FEATURES.map((feature) => (
            <article
              key={feature.titleLines.join(' ')}
              className="relative min-h-full px-2 pt-0.5 pb-1 text-center min-[768px]:px-3 min-[768px]:pt-1 min-[768px]:pb-0.5 min-[768px]:not-first:before:absolute min-[768px]:not-first:before:inset-y-[10%] min-[768px]:not-first:before:left-0 min-[768px]:not-first:before:w-px min-[768px]:not-first:before:bg-line min-[1024px]:px-4"
            >
              <span className="mx-auto mb-1.5 grid size-9 place-items-center text-brand-600 min-[768px]:mb-2 min-[768px]:size-11">
                <feature.icon className="size-7 stroke-[1.7] min-[768px]:size-10 min-[768px]:stroke-[1.6]" />
              </span>
              <h3 className="mx-auto text-[13px] leading-tight font-extrabold tracking-[-0.02em] text-ink min-[400px]:text-[14px] min-[768px]:text-base">
                {feature.titleLines.map((line, index) => (
                  <Fragment key={line}>
                    {index > 0 && (
                      <>
                        <br />{' '}
                      </>
                    )}
                    {tx(line)}
                  </Fragment>
                ))}
              </h3>
              <p className="mx-auto mt-1 max-w-[24ch] text-[11px] leading-[1.35] font-medium text-ink-500 min-[400px]:text-[12px] min-[768px]:mt-1.5 min-[768px]:max-w-[28ch] min-[768px]:text-[13px] min-[768px]:leading-[1.45]">
                {tx(feature.description)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
