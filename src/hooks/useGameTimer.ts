/**
 * Timestamp-based countdown driven by requestAnimationFrame.
 * Remaining time is always `endsAt - Date.now()` — no per-tick drift, and
 * pause/resume or tab switches restore the exact remaining time.
 */

import { useEffect, useRef, useState } from 'react';

interface Options {
  /** Absolute end timestamp (ms). Null when not running (paused/untimed). */
  endsAt: number | null;
  /** Full turn duration in ms, used to compute the 0..1 ring progress. */
  durationMs: number;
  running: boolean;
  onExpire: () => void;
  /** Called once per whole second during the final 5 seconds. */
  onTick?: (secondsLeft: number) => void;
}

interface Result {
  /** 1 → 0 remaining fraction for the ring. */
  progress: number;
  /** Whole seconds remaining (for the numeric readout). */
  secondsLeft: number;
}

export function useGameTimer({ endsAt, durationMs, running, onExpire, onTick }: Options): Result {
  const [progress, setProgress] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil(durationMs / 1000)),
  );

  const rafRef = useRef<number | null>(null);
  const lastWholeRef = useRef(-1);
  const firedRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onExpireRef.current = onExpire;
    onTickRef.current = onTick;
  }, [onExpire, onTick]);

  useEffect(() => {
    firedRef.current = false;
    lastWholeRef.current = -1;

    if (!running || endsAt == null) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const loop = (): void => {
      const remaining = Math.max(0, endsAt - Date.now());
      setProgress(durationMs > 0 ? remaining / durationMs : 0);

      const whole = Math.ceil(remaining / 1000);
      if (whole !== lastWholeRef.current) {
        lastWholeRef.current = whole;
        setSecondsLeft(whole);
        if (whole > 0 && whole <= 5) onTickRef.current?.(whole);
      }

      if (remaining <= 0) {
        if (!firedRef.current) {
          firedRef.current = true;
          onExpireRef.current();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [endsAt, running, durationMs]);

  return { progress, secondsLeft };
}
