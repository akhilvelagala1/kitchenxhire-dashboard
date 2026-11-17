import { useCallback, useEffect, useMemo, useState } from 'react';
import { readSavedJobEntries, resolveSavedListings, writeSavedJobEntries } from '../lib/savedJobs';
import type { SavedJobEntry } from '../schemas/savedJobs';

export function useSavedJobs() {
  const [entries, setEntries] = useState<SavedJobEntry[]>(() => readSavedJobEntries());

  useEffect(() => {
    writeSavedJobEntries(entries);
  }, [entries]);

  const savedJobs = useMemo(() => resolveSavedListings(entries), [entries]);
  const savedCount = entries.length;

  const isSaved = useCallback(
    (jobId: string) => entries.some((entry) => entry.id === jobId),
    [entries]
  );

  const saveJob = useCallback((jobId: string) => {
    setEntries((current) => {
      if (current.some((entry) => entry.id === jobId)) return current;
      return [{ id: jobId, savedAt: new Date().toISOString() }, ...current];
    });
  }, []);

  const removeSavedJob = useCallback((jobId: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== jobId));
  }, []);

  const toggle = useCallback((jobId: string) => {
    setEntries((current) => {
      if (current.some((entry) => entry.id === jobId)) {
        return current.filter((entry) => entry.id !== jobId);
      }
      return [{ id: jobId, savedAt: new Date().toISOString() }, ...current];
    });
  }, []);

  return {
    entries,
    savedJobs,
    savedCount,
    isSaved,
    saveJob,
    removeSavedJob,
    toggle
  };
}
