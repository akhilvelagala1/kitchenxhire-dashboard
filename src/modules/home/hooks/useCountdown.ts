import { useCallback, useEffect, useState } from 'react';

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const start = useCallback(() => {
    setSeconds(initialSeconds);
    setRunning(true);
  }, [initialSeconds]);

  const stop = useCallback(() => setRunning(false), []);

  return { seconds, start, stop };
}
