import { useMemo } from 'react';
import { BusinessesSection } from '../components/BusinessesSection';
import { FeatureBand } from '../components/FeatureBand';
import { FinalCta } from '../components/FinalCta';
import { HeroSection } from '../components/HeroSection';
import { HowItWorks } from '../components/HowItWorks';
import { JobSearchBar } from '../components/JobSearchBar';
import { MatchSection } from '../components/MatchSection';
import { RecentJobs } from '../components/RecentJobs';
import { RolesSection } from '../components/RolesSection';
import { StoriesCarousel } from '../components/StoriesCarousel';
import { JOBS } from '../content/jobs';
import { STORIES } from '../content/stories';
import { useActiveSection } from '../hooks/useActiveSection';
import { useHomeState } from '../hooks/useHomeState';
import { emptyJobsMessage, searchJobs } from '../lib/searchJobs';
import { prefersReducedMotion } from '../lib/motion';

const SCROLL_SPY_IDS = ['jobs', 'roles', 'businesses', 'how'] as const;

function scrollToJobs() {
  document
    .getElementById('jobs')
    ?.scrollIntoView?.({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

export function HomePage() {
  const { role, activeRole, city, typeRole, pickRole, setCity, setActiveSection } = useHomeState();
  const jobs = useMemo(() => searchJobs(JOBS, role, city), [role, city]);
  useActiveSection(SCROLL_SPY_IDS, setActiveSection);

  return (
    <main id="top">
      <title>KitchenX Hiring | Good people. Stronger kitchens.</title>
      <meta
        name="description"
        content="KitchenX Hiring helps India's restaurants, hotels, cafés, bakeries, cloud kitchens and caterers find kitchen and hospitality staff, and helps people find the next shift near home."
      />
      <HeroSection />
      <JobSearchBar
        role={role}
        city={city}
        onRole={typeRole}
        onCity={setCity}
        onSubmit={scrollToJobs}
        variant="home"
      />
      <FeatureBand />
      <RolesSection
        activeRole={activeRole}
        onPick={(query) => {
          pickRole(query);
          scrollToJobs();
        }}
      />
      <BusinessesSection />
      <HowItWorks />
      <RecentJobs jobs={jobs} emptyMessage={emptyJobsMessage(city)} />
      <MatchSection />
      <StoriesCarousel stories={STORIES} />
      <FinalCta />
    </main>
  );
}
