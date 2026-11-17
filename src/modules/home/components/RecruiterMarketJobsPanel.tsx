import { ArrowRight, ChefHat, ConciergeBell, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { DEMO_RECRUITER_MARKET_JOBS } from '../content/demoRecruiterMarketJobs';
import { homeButton } from './styles';

const ICONS: Record<string, LucideIcon> = {
  chef: ChefHat,
  helper: UtensilsCrossed,
  bakery: ConciergeBell
};

function formatSalary(min: number, max: number) {
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
  return `₹${fmt(min)} – ₹${fmt(max)} / month`;
}

export function RecruiterMarketJobsPanel() {
  return (
    <aside className="rounded-[18px] border border-[#eef0f5] bg-white p-5 shadow-[0_5px_18px_rgb(22_30_50/0.07)] min-[1200px]:sticky min-[1200px]:top-[76px]">
      <div className="flex items-start gap-2.5">
        <span className="grid size-7 place-items-center text-brand-600">
          <ChefHat className="size-6" aria-hidden />
        </span>
        <div>
          <h2 className="text-[22px] font-bold text-[#141517]">Jobs in the Market</h2>
          <p className="mt-0.5 text-[14px] font-medium text-[#243754]">
            See similar job postings from other businesses.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-4">
        {DEMO_RECRUITER_MARKET_JOBS.map((job) => {
          const Icon = ICONS[job.category] ?? ChefHat;
          return (
            <li
              key={job.id}
              className="rounded-2xl border border-[#eef0f5] bg-white p-3.5 transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-[0_7px_20px_rgb(20_21_23/0.09)] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="flex gap-3">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#fff0e8] text-brand-600">
                  <Icon className="size-7 stroke-[2]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-bold text-[#141517]">{job.title}</p>
                  <p className="truncate text-[14px] font-medium text-[#243754]">
                    {job.companyName}
                  </p>
                  <p className="truncate text-[13px] text-[#243754]">{job.location}</p>
                  <p className="mt-1 text-[14px] font-bold text-[#141517]">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-[#fff0e8] px-2.5 py-0.5 text-[13px] font-semibold text-brand-600">
                    {job.employmentType}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Link
        to="/recruiter/market-jobs"
        className={cn(
          homeButton('white-base'),
          'mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-brand-600 text-[15px] font-bold text-brand-600'
        )}
      >
        View More Market Jobs
        <ArrowRight className="size-4" />
      </Link>
    </aside>
  );
}
