import { useMemo } from 'react';

const PALETTE = ['#00e676', '#ffb300', '#22d3ee', '#fb7185', '#ffd400', '#a78bfa'];
const COUNT = 50;

interface Piece {
  left: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

function makePieces(): Piece[] {
  return Array.from({ length: COUNT }, () => ({
    left: Math.random() * 100,
    size: 6 + Math.random() * 8,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    duration: 2.4 + Math.random() * 2.2,
    delay: Math.random() * 1.5,
  }));
}

/** Lightweight CSS-animated celebratory confetti. */
export function Confetti() {
  const pieces = useMemo(makePieces, []);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="animate-confetti absolute top-0 rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            ['--fall-duration' as string]: `${p.duration}s`,
            ['--fall-delay' as string]: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
