import { useState } from 'react';
import type { RecruiterInboundApplication } from '../schemas/recruiterApplication';

export interface CandidateNotesState {
  editing: boolean;
  draft: string;
  setDraft: (value: string) => void;
  startEdit: () => void;
  cancel: () => void;
  save: () => void;
}

/**
 * Recruiter-notes editing state for the candidate details modal. Accepts a null application so the
 * caller can run it before its closed-state early return.
 */
export function useCandidateNotes(
  application: RecruiterInboundApplication | null,
  onUpdateNotes: (id: string, notes: string) => void
): CandidateNotesState {
  const currentId = application?.id ?? null;
  const savedNotes = application?.recruiterNotes ?? '';

  const [trackedId, setTrackedId] = useState(currentId);
  const [draft, setDraft] = useState(savedNotes);
  const [editing, setEditing] = useState(false);

  // Reset during render (not in an effect) when the application changes, including to/from null.
  if (currentId !== trackedId) {
    setTrackedId(currentId);
    setDraft(savedNotes);
    setEditing(false);
  }

  return {
    editing,
    draft,
    setDraft,
    startEdit: () => setEditing(true),
    cancel: () => {
      setDraft(savedNotes);
      setEditing(false);
    },
    save: () => {
      if (!application) return;
      onUpdateNotes(application.id, draft);
      setEditing(false);
    }
  };
}
