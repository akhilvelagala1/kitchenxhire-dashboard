import { Skeleton } from '@/shared/ui/Skeleton';

/** Grey blocks where the tab's cards will be, so the page does not jump when the settings arrive. */
export function SettingsSkeleton({ names }: { names: readonly string[] }) {
  return (
    <>
      <span role="status" className="sr-only">
        Loading settings
      </span>
      {names.map((name) => (
        <Skeleton key={name} className="h-48 rounded-xl xl:h-full" />
      ))}
    </>
  );
}
