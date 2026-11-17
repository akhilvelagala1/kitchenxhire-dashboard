import { Bell, IndianRupee, Search, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import hireChefPortrait from '../assets/hire-chef-portrait.jpg';
import { card } from './styles';

const BENEFITS = [
  { Icon: Search, text: 'Get found by verified employers' },
  { Icon: IndianRupee, text: 'Receive relevant job opportunities' },
  { Icon: Bell, text: 'Get interview updates quickly' },
  { Icon: TrendingUp, text: 'Build a better career in the food industry' }
] as const;

interface ProfileBenefitsPanelProps {
  className?: string;
  /** Fill grid row height beside the form card (wizard layout). */
  stretch?: boolean;
}

export function ProfileBenefitsPanel({ className, stretch = false }: ProfileBenefitsPanelProps) {
  return (
    <aside className={cn('w-full', stretch && 'h-full min-h-0', className)}>
      <div
        className={cn(
          card,
          'flex h-full min-h-0 flex-col overflow-hidden border border-line p-0 hover:translate-y-0 hover:shadow-card motion-reduce:hover:translate-y-0',
          !stretch && 'h-fit'
        )}
      >
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-b from-[#FF7A45] via-brand-500 to-brand-600 pt-2">
          <img
            src={hireChefPortrait}
            alt="Chef in professional kitchen uniform"
            className="relative z-[1] h-[256px] w-full object-cover object-[50%_10%] saturate-[0.92] contrast-[0.94] brightness-[1.03] min-[1280px]:h-[288px]"
            loading="lazy"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-12 bg-surface"
            style={{ borderTopLeftRadius: '48% 100%', borderTopRightRadius: '48% 100%' }}
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-1 flex-col justify-center bg-surface px-5 pb-7 pt-5 min-[1280px]:px-5 min-[1280px]:pb-8">
          <h2 className="text-[15px] font-extrabold tracking-tight text-ink min-[1280px]:text-base">
            A complete profile helps you
          </h2>
          <ul className="mt-4 flex flex-col gap-4 min-[1280px]:mt-5 min-[1280px]:gap-[18px]">
            {BENEFITS.map(({ Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-3 text-[14px] font-semibold leading-snug text-ink-600"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FFF3ED] text-brand-600">
                  <Icon className="size-[19px]" strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="pt-2">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
