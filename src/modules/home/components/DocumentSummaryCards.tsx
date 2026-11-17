import { CheckCircle2, Clock, FileText, Info, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useHireLanguage } from '../hooks/useHireLanguage';

interface DocumentSummaryCardsProps {
  total: number;
  verified: number;
  underReview: number;
  rejected: number;
}

const CARDS: {
  key: keyof DocumentSummaryCardsProps;
  label: string;
  Icon: LucideIcon;
  cardClass: string;
  iconClass: string;
}[] = [
  {
    key: 'total',
    label: 'Total Documents',
    Icon: FileText,
    cardClass: 'bg-brand-50',
    iconClass: 'text-brand-600'
  },
  {
    key: 'verified',
    label: 'Verified',
    Icon: CheckCircle2,
    cardClass: 'bg-success-50',
    iconClass: 'text-success-700'
  },
  {
    key: 'underReview',
    label: 'Under Review',
    Icon: Clock,
    cardClass: 'bg-violet-50',
    iconClass: 'text-violet-600'
  },
  {
    key: 'rejected',
    label: 'Rejected',
    Icon: Info,
    cardClass: 'bg-sky-50',
    iconClass: 'text-sky-600'
  }
];

export function DocumentSummaryCards(props: DocumentSummaryCardsProps) {
  const { tx } = useHireLanguage();

  return (
    <div className="grid grid-cols-2 gap-3 min-[1024px]:grid-cols-4">
      {CARDS.map(({ key, label, Icon, cardClass, iconClass }) => (
        <div
          key={key}
          role="group"
          aria-label={tx(label)}
          className={cn('flex h-[84px] items-center gap-3 rounded-[18px] px-3.5', cardClass)}
        >
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-surface shadow-btn-white">
            <Icon className={cn('size-6', iconClass)} />
          </div>
          <div className="min-w-0">
            <p className="text-[26px] font-extrabold leading-none tracking-tight text-ink">
              {props[key]}
            </p>
            <p className="mt-1 truncate text-[13px] font-semibold text-ink-500 min-[1280px]:text-[14px]">
              {tx(label)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
