import { Check } from 'lucide-react';
import { RecruiterPostJobIllustration } from './RecruiterPostJobIllustration';
import {
  recruiterSetupInfoPanelPostJob,
  recruiterSetupPostJobPanelColumn
} from './recruiterSetupStyles';

const POST_JOB_COPY = {
  title: 'Post a Job',
  description: 'Find the right people for your kitchen or hospitality team.',
  checklist: [
    'Fill in basic job details',
    'Set your requirements',
    'Start receiving applications'
  ] as const
};

function SetupPanelWave() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[140px]"
    >
      <svg
        viewBox="0 0 330 140"
        preserveAspectRatio="none"
        className="h-full w-full"
        role="presentation"
      >
        <path
          fill="#FFE8DE"
          d="M-20 92 C40 40 120 118 200 78 C260 48 310 88 360 72 L360 140 L-20 140 Z"
        />
        <path
          fill="#FFD8C8"
          d="M-30 108 C30 62 130 128 210 92 C270 68 300 102 350 88 L350 140 L-30 140 Z"
        />
        <path
          fill="#FF4F18"
          fillOpacity={0.1}
          d="M-40 118 C20 88 110 132 190 108 C250 92 290 118 340 104 L340 140 L-40 140 Z"
        />
      </svg>
    </div>
  );
}

function OrangeSquareCheck() {
  return (
    <span
      className="grid size-[26px] shrink-0 place-items-center rounded-[8px] bg-brand-600"
      aria-hidden
    >
      <Check className="size-[16px] text-white" strokeWidth={3} />
    </span>
  );
}

/** Left promotional panel for Post a Job (reference layout). */
export function RecruiterPostJobSetupPanel() {
  const copy = POST_JOB_COPY;

  return (
    <div className={recruiterSetupPostJobPanelColumn}>
      <aside className={recruiterSetupInfoPanelPostJob}>
        <div className="relative z-10 flex flex-1 flex-col pb-16">
          <div className="mb-1 min-[1024px]:mb-0">
            <RecruiterPostJobIllustration />
          </div>
          <h2 className="max-w-[280px] text-[34px] font-extrabold leading-[1.12] tracking-tight text-[#151515] min-[1024px]:text-[46px]">
            {copy.title}
          </h2>
          <p className="mt-2 max-w-[280px] text-[17px] font-medium leading-snug text-[#243754] min-[1024px]:text-[20px]">
            {copy.description}
          </p>
          <ul className="mt-5 space-y-[18px] min-[1024px]:mt-6">
            {copy.checklist.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-[16px] font-semibold text-[#243754] min-[1024px]:text-[17px]"
              >
                <OrangeSquareCheck />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <SetupPanelWave />
      </aside>
    </div>
  );
}
