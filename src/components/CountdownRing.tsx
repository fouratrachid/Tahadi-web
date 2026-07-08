import { toAr } from '@/i18n/ar';

interface Props {
  /** 1 → 0 remaining fraction. */
  progress: number;
  seconds: number;
  /** Ring diameter in px (the wrapper scales responsively). */
  size?: number;
}

/** Linear color blend between two hex colors. */
function blend(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const out = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${out[0]}, ${out[1]}, ${out[2]})`;
}

const GREEN = '#00e676';
const YELLOW = '#ffd400';
const RED = '#ff3b5c';

function ringColor(p: number): string {
  // green (1) → yellow (0.66..0.33) → red (0)
  if (p > 0.66) return blend(YELLOW, GREEN, (p - 0.66) / 0.34);
  if (p > 0.33) return blend(RED, YELLOW, (p - 0.33) / 0.33);
  return blend(RED, RED, 0);
}

/** Circular countdown that depletes and shifts green → yellow → red. */
export function CountdownRing({ progress, seconds, size = 160 }: Props) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      role="timer"
      aria-label={`${seconds} ثانية متبقية`}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--color-surface-alt)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={ringColor(p)}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - p)}
        />
      </svg>
      <span className="text-6xl font-black tabular-nums" dir="rtl">
        {toAr(seconds)}
      </span>
    </div>
  );
}
