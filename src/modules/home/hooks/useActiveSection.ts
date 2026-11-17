import { useEffect } from 'react';

/** Reports which section sits in the middle band of the viewport, for the header's scroll-spy. */
export function useActiveSection(ids: readonly string[], onChange: (id: string) => void) {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onChange(entry.target.id);
        }
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0.01 }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids, onChange]);
}
