import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { pageWrap } from './styles';

interface HeroBannerShellProps {
  image: string;
  imageAlt: string;
  /** Copy block classes. The shell owns the card and the photo; the caller owns the text. */
  className?: string;
  children: ReactNode;
}

/**
 * The inset rounded banner the public homepage and the recruiter homepage share.
 * Geometry, radius, height, crop and entrance animation live here so both heroes
 * cannot drift apart again. The cream left fade is baked into the image asset.
 */
export function HeroBannerShell({ image, imageAlt, className, children }: HeroBannerShellProps) {
  return (
    <section className="relative">
      <div className={pageWrap}>
        <div className="relative isolate overflow-hidden rounded-[28px] bg-surface min-[768px]:min-h-[380px] min-[1024px]:min-h-[420px] min-[1024px]:rounded-[32px]">
          <div className={cn('relative z-10', className)}>{children}</div>
          <img
            src={image}
            alt={imageAlt}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="relative z-0 h-[220px] w-full animate-hero-in object-cover object-[62%_0%] motion-reduce:animate-none min-[768px]:absolute min-[768px]:inset-0 min-[768px]:size-full min-[768px]:object-[58%_0%] min-[1024px]:object-[55%_0%]"
          />
        </div>
      </div>
    </section>
  );
}
