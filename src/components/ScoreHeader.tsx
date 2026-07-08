import { toAr } from '@/i18n/ar';
import type { PlayerIndex } from '@/types';

interface Props {
  names: [string, string];
  scores: [number, number];
  activePlayer: PlayerIndex | null;
  centerTop: string;
  centerBottom: string;
}

function PlayerChip({
  index,
  name,
  score,
  active,
}: {
  index: PlayerIndex;
  name: string;
  score: number;
  active: boolean;
}) {
  const color = index === 0 ? 'var(--color-p1)' : 'var(--color-p2)';
  return (
    <div
      className="flex flex-1 flex-col items-center rounded-xl border-2 px-2 py-2"
      style={{
        borderColor: active ? color : 'var(--color-line)',
        backgroundColor: active ? `color-mix(in srgb, ${color} 14%, transparent)` : 'var(--color-surface)',
      }}
    >
      <span
        className="max-w-full truncate text-sm font-bold"
        style={{ color: active ? color : 'var(--color-txt2)' }}
      >
        {name}
      </span>
      <span className="text-2xl font-black" style={{ color: active ? color : 'var(--color-txt)' }}>
        {toAr(score)}
      </span>
    </div>
  );
}

export function ScoreHeader({ names, scores, activePlayer, centerTop, centerBottom }: Props) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <PlayerChip index={0} name={names[0]} score={scores[0]} active={activePlayer === 0} />
      <div className="flex flex-1 flex-col items-center gap-0.5 text-center">
        <span className="text-accent text-xs font-semibold">{centerTop}</span>
        <span className="text-txt2 text-sm font-bold">{centerBottom}</span>
      </div>
      <PlayerChip index={1} name={names[1]} score={scores[1]} active={activePlayer === 1} />
    </div>
  );
}
