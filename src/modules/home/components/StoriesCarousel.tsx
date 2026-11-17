import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import { cn } from '@/shared/lib/cn';
import { STORIES } from '../content/stories';
import { prefersReducedMotion } from '../lib/motion';
import type { Story } from '../schemas/home';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { kicker, pageWrap, secTitleLg } from './styles';

const STEP_MS = 3000;
const GAP = 16;

function useVisibleCount() {
  const [count, setCount] = useState(() => (window.innerWidth < 768 ? 1 : 3));
  useEffect(() => {
    const onResize = () => setCount(window.innerWidth < 768 ? 1 : 3);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return count;
}

/** Entrance animation. The front card also floats, and it starts after the entrance. */
function cardAnimation(
  front: boolean,
  intro: boolean,
  index: number,
  sliding: boolean
): React.CSSProperties {
  if (prefersReducedMotion()) return {};
  if (front) {
    if (sliding) return {};
    return {
      animation: intro
        ? 'impact-rise 0.75s ease both, impact-float 5.6s ease-in-out 0.8s infinite'
        : 'impact-float 5.6s ease-in-out infinite'
    };
  }
  return intro
    ? { animation: 'impact-rise 0.75s ease both', animationDelay: `${index * 0.12}s` }
    : {};
}

export interface StoriesCarouselProps {
  stories?: Story[];
}

/**
 * Three cards on tablet and up, one on a phone, advancing every three seconds. The track slides one
 * card, then the cards are reordered and the track snaps back, so the loop never runs out.
 */
export function StoriesCarousel({ stories = STORIES }: StoriesCarouselProps = {}) {
  const { tx } = useHireLanguage();
  const visible = useVisibleCount();
  const [at, setAt] = useState(0);
  const [shift, setShift] = useState<number | null>(null);
  const [intro, setIntro] = useState(true);
  const [paused, setPaused] = useState(false);
  const firstCard = useRef<HTMLElement>(null);
  const touchX = useRef(0);
  const sliding = shift !== null;

  const step = useCallback(() => {
    if (sliding || document.hidden || !stories.length) return;
    setIntro(false);
    if (prefersReducedMotion()) {
      setAt((a) => (a + 1) % stories.length);
      return;
    }
    const width = firstCard.current?.getBoundingClientRect().width;
    if (width) setShift(width + GAP);
  }, [sliding, stories.length]);

  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => stepRef.current(), STEP_MS);
    return () => clearInterval(id);
  }, [paused]);

  if (!stories || stories.length === 0) return null;

  function onTouchEnd(event: TouchEvent) {
    const dx = (event.changedTouches[0]?.clientX ?? 0) - touchX.current;
    if (Math.abs(dx) < 48 || sliding) return;
    if (dx > 0) setAt((a) => (a - 1 + stories.length) % stories.length);
    else step();
  }

  const frontIndex = visible === 1 ? 0 : 1;

  return (
    <section id="stories" className="scroll-mt-[84px] overflow-x-clip pt-8 pb-5">
      <div className={pageWrap}>
        <div>
          <p className={kicker}>{tx('Real people. Real kitchen work.')}</p>
          <h2 className={secTitleLg}>{tx('Built around real kitchen work.')}</h2>
        </div>
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label={tx('Customer stories')}
          tabIndex={0}
          className="mt-[18px] touch-pan-y overflow-hidden rounded-2xl pt-[18px] pb-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={(event) => {
            touchX.current = event.changedTouches[0]?.clientX ?? 0;
          }}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex w-full items-center gap-4"
            style={
              shift === null
                ? { transition: 'none', transform: 'translateX(0)' }
                : {
                    transition: 'transform 0.7s cubic-bezier(.22,.7,.3,1)',
                    transform: `translateX(-${shift}px)`
                  }
            }
            onTransitionEnd={(event) => {
              if (event.target !== event.currentTarget || event.propertyName !== 'transform')
                return;
              setAt((a) => (a + 1) % stories.length);
              setShift(null);
            }}
          >
            {Array.from({ length: visible + 1 }, (_, i) => {
              const story = stories[(at + i) % stories.length]!;
              const front = i === frontIndex;
              return (
                <article
                  key={i}
                  ref={i === 0 ? firstCard : undefined}
                  style={cardAnimation(front, intro, i, sliding)}
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${stories.length}`}
                  onClick={() => {
                    if (front || sliding) return;
                    if (i > frontIndex) step();
                    else setAt((a) => (a - 1 + stories.length) % stories.length);
                  }}
                  className={cn(
                    'flex flex-none basis-full flex-col rounded-[20px] bg-surface px-5 pt-[18px] pb-4 transition-[scale,border-color,box-shadow,opacity] duration-700 ease-[cubic-bezier(.22,.7,.3,1)] min-[768px]:min-h-[260px] min-[768px]:basis-[58%] min-[880px]:basis-[50%] min-[1024px]:min-h-0 min-[1024px]:basis-[calc((100%-32px)/3)] motion-reduce:animate-none motion-reduce:transition-none',
                    i === 0 && 'stories-peek-first',
                    front
                      ? 'z-10 border-[1.5px] border-line/60 border-t-4 border-t-brand-600 shadow-impact-front hover:shadow-impact-front-hover hover:[animation-play-state:paused]'
                      : 'cursor-pointer border-[1.5px] border-line-soft shadow-impact min-[768px]:scale-[0.95] min-[768px]:opacity-70 min-[768px]:motion-reduce:scale-100 min-[1024px]:scale-[0.97] min-[1024px]:opacity-100 hover:-translate-y-1.5 hover:border-brand-600/35 hover:shadow-impact-hover hover:opacity-100 hover:[animation-play-state:paused]'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="block text-[46px] leading-[0.7] font-extrabold text-brand-600"
                  >
                    “
                  </span>
                  <p className="mt-3 text-[17px] leading-[1.45] font-semibold text-ink-650">
                    {tx(story.quote)}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={story.photo}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="size-12 flex-shrink-0 rounded-full object-cover"
                      />
                      <div>
                        <strong className="block text-base leading-[1.2] text-ink">
                          {story.name}
                        </strong>
                        <span className="mt-0.5 block text-[13px] font-semibold text-ink-400">
                          {tx(story.role)}
                        </span>
                      </div>
                    </div>
                    <span className="flex-shrink-0 rounded-full bg-brand-50 px-3 py-2 text-[11px] font-extrabold tracking-[0.03em] text-brand-600 uppercase">
                      {tx(story.pill)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
